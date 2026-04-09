require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const connectDB = require('./config/connectDB');
const userRouter = require('./routes/userRoute');
const bookingRouter = require('./routes/bookingRoute');
const hospitalRouter = require('./routes/hospitalRoute');
const { setupSocketHandlers } = require('./core/socket/socketHandler');
const orchestrator = require('./core/orchestrator/orchestrator');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(helmet({
    crossOriginResourcePolicy : false
}));
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Setup Socket.io
setupSocketHandlers(io);

// Expose io instance to controllers via app
app.set('io', io);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CORTEX-OS MCP Backend is running' });
});

// Authentication Routes
app.use('/api/user', userRouter);

// Booking Routes
app.use('/api/booking', bookingRouter);

// Hospital Management Routes
app.use('/api/hospital', hospitalRouter);

// Chat Endpoint (Protected or public depending on preference, currently public)
app.post('/api/chat', async (req, res) => {
  const { query, userId } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const response = await orchestrator.processQuery(query, userId, io);
    res.json(response);
  } catch (error) {
    console.error('Orchestration error:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
});

const PORT = process.env.PORT || 5000;

// Validate Env
if (!process.env.MONGODB_URI) {
    console.error('❌ CRITICAL ERROR: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
}

// Connect to DB and Start Server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`\n================================================`);
        console.log(`🚀 MCP Backend running on port ${PORT}`);
        console.log(`================================================\n`);
    });
}).catch((err) => {
    console.error("❌ Failed to connect to database:", err.message);
    process.exit(1);
});
