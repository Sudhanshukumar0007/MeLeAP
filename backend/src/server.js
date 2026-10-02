require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// Middleware
app.use(cors());
app.use(express.json());

// Attach Socket.IO instance to app
app.set('io', io);

// DB Connection & Server Start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Routes
    app.get('/health', (req, res) => {
      res.json({ ok: true });
    });

    app.use('/', require('./routes/leads'));

    // Health / root check
    app.get('/', (req, res) => {
      res.json({ message: 'MeLeAP backend is running 🚀' });
    });

    // Socket.io
    io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);
      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
  }
};

startServer();

