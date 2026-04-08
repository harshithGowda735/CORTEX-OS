# AgriHealthTraffic – MCP Multi-Agent Decision Platform

**AgriHealthTraffic** is a premium, full-stack multi-agent system built for the Model Context Protocol (MCP) era. It integrates intelligence across **Agriculture**, **Healthcare**, and **Traffic** domains, using an autonomous orchestrator to coordinate complex decision-making through distributed agents.

## 🚀 Vision: Cross-Domain Intelligence
Most AI systems act as siloed chatbots. AgriHealthTraffic demonstrates a **Multi-Agent Orchestration** approach where:
- A **Planner Agent** breaks down a single user query into sub-tasks.
- **Domain-Specific Agents** (Agri, Health, Traffic) process data in parallel within a shared context.
- A **Response Agent** synthesizes multi-layered data into a definitive, actionable decision.

## 🌟 Key Features
- **MCP Orchestrator Core**: A central node that parses intent and manages agent lifecycles.
- **Real-Time Agent Activity**: Watch the orchestrator "think" in real-time through the live Agent Timeline (powered by Socket.io).
- **Emerald Design Language**: A clean, premium dashboard with smooth Framer Motion animations.
- **Shared Memory System**: Maintains context across interactions for deep, multi-turn reasoning.

## 🛠 Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS + Framer Motion
- **Backend**: Node.js (Express) + Socket.io
- **Architecture**: Model Context Protocol (MCP) inspired Multi-Agent System

## 📂 Project Structure
```text
agri-health-traffic-mcp/
├── backend/
│   ├── core/
│   │   ├── agents/ (Domain & System Agents)
│   │   ├── orchestrator/ (The Brain)
│   │   ├── memory/ (Context Storage)
│   │   └── socket/ (Real-time Handler)
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── App.jsx
```

## 🚥 Live Demo Flow
1. **User Input**: "I have chest pain and need to get to the City Hospital, how's the traffic?"
2. **Planner**: Detects both *Health* and *Traffic* requirements.
3. **Execution**:
   - `Healthcare Agent`: Analyzes symptoms and identifies high risk.
   - `Traffic Agent`: Finds the fastest emergency route avoiding congestion.
4. **Synthesis**: `Response Agent` combines findings: "Possible Cardiac risk detected. Primary route via Northern Expressway is clear. ETA: 12 minutes."

## 🏗 Setup & Installation

### Backend
1. `cd backend`
2. `npm install`
3. `npm start` (Runs on port 5000)

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev` (Runs on port 5173)

---

Built for the future of agentic workflows. 🌾🏥🚦
