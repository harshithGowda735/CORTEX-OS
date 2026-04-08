let ioInstance = null;

const setupSocketHandlers = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`📡 New client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};

const emitAgentActivity = (userId, activity) => {
  if (ioInstance) {
    // Activity: { agent: string, message: string, status: 'thinking' | 'done' | 'info' }
    ioInstance.emit('agent-activity', {
      userId,
      ...activity,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  setupSocketHandlers,
  emitAgentActivity
};
