/**
 * MODULE 7: MEMORY SYSTEM
 * Persistent MCP context storage per user
 */

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
  
  // Clean context results from being stored recursively if needed, 
  // but for demo, we store the core summary and metadata.
  memory.push({
    query: interaction.query,
    response: interaction.response,
    context: interaction.context, // Store the shared context (Module 7)
    timestamp: new Date().toISOString()
  });
  
  if (memory.length > MAX_CONTEXT) {
    memory.shift();
  }
  
  console.log(`💾 [MEMORY] Interaction saved for ${userId}. Context depth: ${memory.length}`);
};

const clearMemory = (userId) => {
  userMemories.delete(userId);
};

module.exports = {
  getMemory,
  saveInteraction,
  clearMemory
};
