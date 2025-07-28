require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client")));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require("./models/User");
const Room = require("./models/Room");
const Message = require("./models/Message");

// Clerk authentication middleware
app.use(ClerkExpressRequireAuth());

// API routes
app.get("/api/rooms", async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});

app.post("/api/rooms", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Room name required" });
  const room = new Room({ name });
  await room.save();
  res.json(room);
});

// Socket.IO events
io.on("connection", (socket) => {
  socket.on("joinRoom", async ({ roomId, username }) => {
    socket.join(roomId);
    io.to(roomId).emit("notification", `${username} joined the room.`);
  });

  socket.on("leaveRoom", async ({ roomId, username }) => {
    socket.leave(roomId);
    io.to(roomId).emit("notification", `${username} left the room.`);
  });

  socket.on("sendMessage", async ({ roomId, username, text }) => {
    if (!text.trim()) return;
    const message = new Message({
      room: roomId,
      username,
      text,
      timestamp: new Date(),
    });
    await message.save();
    io.to(roomId).emit("newMessage", message);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
