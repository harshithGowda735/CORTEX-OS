# CORTEX-OS – Hospital Intelligence System

**CORTEX-OS** is a premium, full-stack hospital intelligence system built for the Model Context Protocol (MCP) era. It integrates medical diagnostics, real-time appointment booking, and emergency logistics through an autonomous multi-agent orchestrator.

## 🚀 Vision: Clinical Intelligence & Logistics
Most medical systems are static data entries. CORTEX-OS demonstrates a **Multi-Agent Orchestration** approach where:
- A **Planner Agent** breaks down patient symptoms and logistical needs.
- **Clinical Agents** (Healthcare, Logistics) process diagnostics and routing in parallel.
- **Booking Core** manages real-time appointments with automated scheduling.
- A **Response Agent** synthesizes clinical data into definitive medical insights.

## 🌟 Key Features
- **Healthcare Orchestrator**: Central node parsing patient intent and clinical urgency.
- **Real-time Booking**: Full-stack hospital appointment system with instant confirmation.
- **Emergency Logistics**: Intelligent routing optimized for hospital arrival time.
- **CORTEX Node Timeline**: Live execution logs via Socket.io.
- **Security-First Auth**: JWT-based session management with Resend OTP verification.

## 🛠 Tech Stack
- **Frontend**: React (Vite) + Lucide + Framer Motion
- **Backend**: Node.js (Express) + MongoDB Atlas + Socket.io
- **Email**: Resend API
- **Architecture**: Multi-Agent Decision Core

## 📂 Project Structure
```text
CORTEX-OS/
├── server/
│   ├── config/ (DB, Email, Auth)
│   ├── controllers/ (User, Booking)
│   ├── core/
│   │   ├── agents/ (Clinical & System Agents)
│   │   ├── orchestrator/ (The Brain)
│   │   └── socket/ (Real-time Timeline)
│   ├── models/ (User, Booking)
│   └── routes/ (Auth, Booking)
└── frontend/
    ├── src/
    │   ├── components/
    │   └── App.jsx
```

## 🚥 Clinical Flow Demo
1. **Patient Input**: "I have chest pain and need to get to the City Hospital, how's the traffic?"
2. **Planner**: Identifies high-risk clinical symptoms and logistical priority.
3. **Execution**:
   - `Healthcare Agent`: Analyzes risk (Cardiac) and advises immediate arrival.
   - `Traffic Agent`: Finds the fastest emergency route avoiding congestion.
4. **Synthesis**: `Response Agent` combines findings: "CORTEX-OS Assessment: CRITICAL status detected. Logistical analysis recommends Northern Expressway. ETA: 8 minutes."

## 🏗 Setup & Installation

### Backend
1. `cd server`
2. `npm install`
3. Create `.env` (MONGODB_URI, RESEND_API_KEY, JWT_SECRET)
4. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

---

Built for the future of clinical workflows. 🏥🚦🧬
