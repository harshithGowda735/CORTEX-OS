# CORTEX-OS – Smart AI Hospital Management System (MCP)

**CORTEX-OS** is a premium, full-stack hospital intelligence system built for the Model Context Protocol (MCP) era. It unifies clinical diagnostics, real-time health monitoring, automated staffing, and intelligent billing (PayFlow AI) through a synchronized multi-agent orchestrator.

## 🚀 Vision: Autonomous Hospital Intelligence
CORTEX-OS moves beyond static management to active orchestration. Using the **Model Context Protocol (MCP)**, the system coordinates specialized AI agents to manage every facet of a hospital's operation:
- **Planner Agent**: Deconstructs complex clinical/logistical intents.
- **Healthcare Agent**: Performs deep-dive symptom analysis and risk assessment.
- **Vitals Agent**: Monitors real-time biometric feeds (Heart Rate, SpO2, BP) for high-urgency alerts.
- **PayFlow AI Agent**: Automates billing, predicts treatment costs, and detects financial anomalies.
- **Operations Agent**: Optimizes doctor availability, bed occupancy, and duty shifts.
- **Traffic Agent**: Finds fastest emergency routes for incoming patients.

## 🌟 Key Features
- **Smart Health Monitoring**: Real-time biometric streaming with AI-generated urgency levels (Normal/Critical/Emergency).
- **PayFlow AI Billing**: Automated real-time billing with predictive cost visualizations and insurance optimization.
- **Staff Operations**: Intelligent doctor assignment based on specialization and current occupancy.
- **Admission/Discharge AI**: Automated admission date tracking and predictive discharge forensics.
- **CORTEX Node Timeline**: Live multi-agent execution thread powered by Socket.io.
- **Zero-Config Dev Mode**: Bypasses login requirements for rapid development and testing.

## 🛠 Tech Stack
- **Frontend**: React (Vite) + Lucide + Framer Motion + Tailwind CSS
- **Backend**: Node.js (Express) + MongoDB Atlas + Socket.io
- **AI Core**: Multi-Agent Decision Orchestration (MCP Architecture)

## 📂 Project Structure
```text
CORTEX-OS/
├── server/
│   ├── core/
│   │   ├── agents/ (Specialized Domain Agents)
│   │   └── orchestrator/ (The Decision Brain)
│   ├── controllers/ (Hospital, Billing, User)
│   ├── models/ (Doctor, MedicalProfile, Billing, User)
│   └── routes/ (Public & Protected routes)
└── frontend/
    ├── src/
    │   └── App.jsx (Unified MCP Dashboard)
```

## 🚥 Sample Orchestration Flow
1. **Input**: "Check my current bill and suggest a cardiologist for my chest pain."
2. **Planner Agent**: Identifies `Healthcare`, `Operations`, and `Billing` requirements.
3. **Parallel Execution**:
   - `PayFlow Agent`: Pulls current consultation and lab charges.
   - `Healthcare Agent`: Analyzes risk for chest pain (Cardiac).
   - `Ops Agent`: Finds available cardiologists and optimizes the wait time.
4. **Synthesis**: `Response Agent` combines findings: "CORTEX-OS Assessment: High-risk cardiac symptom detected. Dr. Sarah Chen is available in 15 mins. Current PayFlow total: ₹4,500."

## 🏗 Setup & Installation
1. `cd server` -> `npm install` -> `npm run dev`
2. `cd frontend` -> `npm install` -> `npm run dev`

---

Built for the future of intelligent clinical workflows. 🏥🚦🧬
