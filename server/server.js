const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { setupSocketHandlers } = require('./core/socket/socketHandler');
const orchestrator = require('./core/orchestrator/orchestrator');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Setup Socket.io
setupSocketHandlers(io);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AgriHealthTraffic MCP Backend is running' });
});

// Chat Endpoint
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
server.listen(PORT, () => {
  console.log(`\n================================================`);
  console.log(`🚀 MCP Backend running on port ${PORT}`);
  console.log(`================================================\n`);
});
