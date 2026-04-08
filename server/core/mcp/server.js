/**
 * MCP Server Emulation Layer
 * Standardizes agent calls into a tool-based architecture
 */

class MCPServer {
  constructor() {
    this.tools = new Map();
  }

  /**
   * Register a domain agent as an MCP tool
   */
  registerTool(toolConfig) {
    const { name, execute, description } = toolConfig;
    console.log(`📡 [MCP SERVER] Registering tool: ${name}`);
    this.tools.set(name, { execute, description });
  }

  /**
   * Call an MCP tool with standardized context
   */
  async callTool(name, context) {
    if (!this.tools.has(name)) {
      throw new Error(`Tool ${name} not registered in MCP Server`);
    }
    
    console.log(`🔌 [MCP SERVER] Calling tool: ${name}`);
    return await this.tools.get(name).execute(context);
  }

  /**
   * Returns a list of all registered tools and their descriptions
   */
  getToolsDescription() {
    let desc = "";
    this.tools.forEach((config, name) => {
      desc += `- **${name}**: ${config.description || 'No description available'}\n`;
    });
    return desc;
  }
}

// Singleton Instance
const server = new MCPServer();

module.exports = server;
