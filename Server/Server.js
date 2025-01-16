import express from "express";
import http from "http";
import cors from "cors";
import { Server as WebSocketServer } from "socket.io";
import { randomInt } from "crypto";
const app = express();
const port = process.env.PORT || 3000;
var usersonscreen = new Map();

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

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.username = "User" + "-" + randomInt(1000000000); //Immutable, can be an id

  socket.on("Authorized", (roomid, callback) => {
    if (socket.rooms.has(roomid)) callback("Yes");
    else callback("No");
  });

  socket.on("peersignal", (peerid, roomid) => {
    socket.broadcast.to(roomid).emit("peersignal", peerid);
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
  });
  socket.on(`letThisGuyin`, (candidateid) => {
    socket.broadcast.to(candidateid).emit("Accepted");
  });

  socket.on("disconnect", () => {
    usersonscreen.delete(socket.id);
    socket.broadcast.emit("livemouse", Array.from(usersonscreen.values()));
    console.log("user disconnected");
  });

  socket.on("livemouse", (msg) => {
    usersonscreen.set(socket.id, { id: socket.id, ...msg });
    socket.broadcast.emit("livemouse", Array.from(usersonscreen.values()));
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
