import express from "express";
import http from "http";
import cors from "cors";
import { Server as WebSocketServer } from "socket.io";
const app = express();
const port = process.env.PORT || 3000;
var usersonscreen = new Map();
// Middleware
app.use(cors({
  origin: "*",
}));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Create HTTP server
const server = http.createServer(app);

var Rooms = {};

// Setup WebSocket server
const io = new WebSocketServer(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");
  
  socket.on("disconnect", () => {
    usersonscreen.delete(socket.id);
    socket.broadcast.emit("livemouse", Array.from(usersonscreen.values()));
    console.log("user disconnected");
  });

  // Add your WebSocket event handlers here
  socket.on("message", (msg) => {
    console.log("message: " + msg);
    io.emit("message", "Hello from Server");
  });

  socket.on("livemouse", (msg) => {
    usersonscreen.set(socket.id,{id:socket.id,...msg});
    socket.broadcast.emit("livemouse", Array.from(usersonscreen.values()));
  });


});
app.post("/CheckAndEnterRoom", (req, res) => {
  let roomid = req.body.roomid;
  if(Rooms[roomid] != null) {
    res.status(200).send("Waiting for response");
  }else{
    Rooms[roomid] = [];
    res.status(200).send("Room created");
  }
})

// Start server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
