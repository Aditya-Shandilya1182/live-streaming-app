import express from "express";
import http from "http";
import { Server } from "socket.io";


const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname +'/index.html');
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