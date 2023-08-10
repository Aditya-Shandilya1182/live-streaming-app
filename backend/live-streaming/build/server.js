"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user connected', socket.id);
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user disconnected', socket.id);
        });
        // Handle WebRTC signaling messages (offer, answer, ICE candidates)
        socket.on('offer', (data) => {
            io.to(data.userId).emit('offer', { userId: socket.id, offer: data.offer });
        });
        socket.on('answer', (data) => {
            io.to(data.userId).emit('answer', { userId: socket.id, answer: data.answer });
        });
        socket.on('ice-candidate', (data) => {
            io.to(data.userId).emit('ice-candidate', { userId: socket.id, candidate: data.candidate });
        });
    });
});
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
