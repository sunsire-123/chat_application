const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { connectDB } = require('./db.config');
const Message = require('./Message.model');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Update with your React app's URL
    methods: ["GET", "POST"],
  },
});

// Connect to MySQL
connectDB();

// REST API endpoint to fetch the last 50 messages from a specific room
app.get('/api/messages/:room', async (req, res) => {
    try {
        const { room } = req.params;
        // Sequelize automatically uses parameterized queries, protecting against SQL injection.
        const messages = await Message.findAll({
            where: { room },
            order: [['timestamp', 'DESC']],
            limit: 50,
        });
        
        // Reverse to send oldest first for chronological chat display
        res.status(200).json(messages.reverse());
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Socket.IO logic
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User with ID: ${socket.id} joined room: ${room}`);
    });

    socket.on('send_message', async (data) => {
        try {
            // Save incoming socket message to MySQL database
            const savedMessage = await Message.create({
                room: data.room,
                author: data.author,
                message: data.message,
                timestamp: data.timestamp
            });

            // Broadcast to everyone in the room
            io.to(data.room).emit('receive_message', savedMessage);
        } catch (error) {
            console.error('Error saving or broadcasting message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
