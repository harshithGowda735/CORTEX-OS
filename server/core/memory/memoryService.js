// Simple in-memory context storage
const userMemories = new Map();
const MAX_CONTEXT = 5;

const getMemory = (userId) => {
  if (!userMemories.has(userId)) {
    userMemories.set(userId, []);
  }
  return userMemories.get(userId);
};

const saveInteraction = (userId, interaction) => {
  const memory = getMemory(userId);
  memory.push({
    ...interaction,
    timestamp: new Date().toISOString()
  });
  
  if (memory.length > MAX_CONTEXT) {
    memory.shift();
  }
};

const clearMemory = (userId) => {
  userMemories.delete(userId);
};

module.exports = {
  getMemory,
  saveInteraction,
  clearMemory
};
