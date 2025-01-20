import express from "express";
import http from "http";
import cors from "cors";
import { Server as WebSocketServer } from "socket.io";
import { randomInt } from "crypto";
const app = express();
const port = process.env.PORT || 3000;
var usersonscreen = new Map();
var MessageMap = {};
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
const server = http.createServer(app);

const io = new WebSocketServer(server, {
  cors: {
    origin: "*",
  },
});
io.use((socket, next) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
      socket.id = `user_${userId}`;
    } 
    next();
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.username = "User" + "-" + randomInt(1000000000); //Immutable, can be an id
  socket.on("getname", (callback) => {
    callback(socket.username);
  });
  socket.on("Authorized", (roomid, callback) => {
    if (socket.rooms.has(roomid)) callback("Yes");
    else callback("No");
  });
  socket.on("SendingMessage", (MessageContent, roomid) => {
    if (MessageMap[roomid])
      MessageMap[roomid] = [
        ...MessageMap[roomid],
        { message: MessageContent, sid: socket.id },
      ];
    else MessageMap[roomid] = [{ message: MessageContent, sid: socket.id }];
    console.log(roomid, MessageMap[roomid]);
    try {
      io.in(roomid).emit("MessageIncoming", MessageMap[roomid]);
    } catch (e) {
      console.log("Emitting Error: " + e);
    }
  });
  socket.on("peersignal", (peerid, roomid) => {
    console.log(peerid, roomid);
    setTimeout(() => {
      socket.broadcast.to(roomid).emit("peersignal", peerid);
    }, 1000);
  });
  socket.on("Howmanypeopleintheroom", (roomid, callback) => {
    let PeopleInTheRoom = io.sockets.adapter.rooms.get(roomid);
    if (PeopleInTheRoom) {
      let otherPeople = [...PeopleInTheRoom]
        .filter((id) => id !== socket.id)
        .map((id) => io.sockets.sockets.get(id).username);
      callback(otherPeople);
    } else {
      callback([]);
    }
  });
  socket.on("RoomCreation", (roomid, callback) => {
    if (socket.rooms.size > 2) {
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });
    }
    try {
      if (io.sockets.adapter.rooms.has(roomid) && !socket.rooms.has(roomid)) {
        callback("Room Found, Click join when ready", 2);
      } else {
        socket.join(roomid);

        callback("Room created successfully!", 1);
      }
    } catch (e) {
      console.log(e);
    }
  });
  socket.on("RequestAccess", (roomid) => {
    if (io.sockets.adapter.rooms.has(roomid)) {
      console.log("requesting access " + socket.id);
      socket
        .to([...io.sockets.adapter.rooms.get(roomid)][0])
        .emit(roomid + "req", { name: socket.username, id: socket.id });
    } else console.log("room was not found");
  });

  socket.on("joinroom", (roomid) => {
    socket.join(roomid);
    socket.to(roomid).emit("user_gotin", socket.username);
  });
  socket.on("GetMessages", (roomid,callback)=>{
    if(MessageMap[roomid])
    callback(MessageMap[roomid])
  })
  socket.on(`letThisGuyin`, (candidateid) => {
    socket.to(candidateid).emit("Accepted");
  });
  socket.on(`ToggledMedia`, (roomid, peerid) => {
    socket.to(roomid).emit("ToggledMedia", peerid);
  });
  socket.on("disconnect", () => {
    usersonscreen.delete(socket.id);
    socket.broadcast.emit("livemouse", Array.from(usersonscreen.values()));

    console.log("user disconnected");
  });
  socket.on("disconnecting", (reason) => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        io.in(room).emit("user_left", socket.username);
      }
    }
  });

  socket.on("livemouse", (msg) => {
    usersonscreen.set(socket.id, { id: socket.id, ...msg });
    socket.broadcast.emit("livemouse", Array.from(usersonscreen.values()));
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
