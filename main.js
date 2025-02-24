import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // Connect to server

const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const clearBtn = document.getElementById('clearBtn');

canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.6;

let drawing = false;
let currentColor = '#000000';

// Set color from picker
colorPicker.addEventListener('change', (e) => {
    currentColor = e.target.value;
});

// Start drawing
canvas.addEventListener('mousedown', () => {
    drawing = true;
});

// Stop drawing
canvas.addEventListener('mouseup', () => {
    drawing = false;
    ctx.beginPath();
});

// Handle drawing on the canvas
canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    const { offsetX, offsetY } = e;

    // Emit draw event to server
    socket.emit('draw', { x: offsetX, y: offsetY, color: currentColor });

    // Draw on your own board (avoiding direct drawing)
    draw(offsetX, offsetY, currentColor);
});

// Function to draw
function draw(x, y, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}


socket.on('draw', (data) => {
    draw(data.x, data.y, data.color);
});

socket.on('boardState', (boardState) => {
    boardState.forEach(({ x, y, color }) => {
        draw(x, y, color);
    });
});

clearBtn.addEventListener('click', () => {
    socket.emit('clearBoard');
});

socket.on('clearBoard', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
