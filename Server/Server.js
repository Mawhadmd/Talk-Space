import express from "express";
import http from "http";
import cors from "cors";
import { Server as WebSocketServer } from "socket.io";
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
var Rooms = new Set();

const io = new WebSocketServer(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("RoomCreation", (roomid, callback) => {
    try {
      if (io.sockets.adapter.rooms.has(roomid))
        callback("Room Found, Click join when ready", 2);
      socket.join(roomid);
      callback("Room created successfully!", 1);
    } catch (e) {
      console.log(e);
    }
  });

  socket.on("disconnect", () => {
    usersonscreen.delete(socket.id);
    socket.broadcast.emit("livemouse", Array.from(usersonscreen.values()));
    console.log("user disconnected");
  });

  socket.on("message", (msg) => {
    console.log("message: " + msg);
    io.emit("message", "Hello from Server");
  });

  socket.on("livemouse", (msg) => {
    usersonscreen.set(socket.id, { id: socket.id, ...msg });
    socket.broadcast.emit("livemouse", Array.from(usersonscreen.values()));
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
