const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    },
});

let boardState = []; // Stores drawing actions

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Send the full board state to new users
    socket.emit('boardState', boardState);

    // Listen for drawing events
    socket.on('draw', (data) => {
        boardState.push(data); // Store the drawing action
        io.emit('draw', data); // Broadcast to ALL clients (use io.emit instead of socket.broadcast.emit)
    });

    // Listen for clear board event
    socket.on('clearBoard', () => {
        boardState = []; // Clear stored actions
        io.emit('clearBoard'); // Notify all clients
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});


// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
