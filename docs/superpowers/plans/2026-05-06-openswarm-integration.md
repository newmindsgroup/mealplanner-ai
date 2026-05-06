# OpenSwarm Health Intelligence Integration — Master Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deploy a customized OpenSwarm multi-agent system alongside the MealPlan Assistant App, enabling research-backed lab reports, neuro protocols, meal plans, fitness analysis, and professional document generation.

**Architecture:** OpenSwarm runs as an isolated Docker sidecar container on the VPS (port 8080). Express gets new `/api/swarm/*` proxy routes protected by existing JWT auth. Frontend gains "Deep Analysis" buttons that route complex requests through Express → OpenSwarm. All 8 agents are retained and customized for health/nutrition/fitness.

**Tech Stack:** Python 3.13 (Docker), Agency Swarm, FastAPI, Node.js Express proxy, React frontend components

---

## Phase 1: Fork, Privatize & Base Setup

### Task 1.1: Fork OpenSwarm to Private Repo

- [ ] Fork `VRSEN/OpenSwarm` to `newmindsgroup/openswarm-health` (private)
- [ ] Clone locally: `git clone git@github.com:newmindsgroup/openswarm-health.git`
- [ ] Verify structure: `ls` should show `swarm.py`, `server.py`, `orchestrator/`, etc.
- [ ] Commit: `git commit --allow-empty -m "chore: initial private fork"`

### Task 1.2: Configure Environment

- [ ] Copy `.env.example` to `.env`
- [ ] Set `OPENAI_API_KEY` (from Max account)
- [ ] Set `ANTHROPIC_API_KEY` (from Max account)
- [ ] Set `DEFAULT_MODEL=gpt-4o` (or preferred model)
- [ ] Set `SEARCH_API_KEY` for research agent web search
- [ ] Set `GOOGLE_API_KEY` for image generation
- [ ] Commit `.env.example` updates (NOT `.env`): `git commit -m "chore: configure env for health platform"`

### Task 1.3: Local Docker Smoke Test

- [ ] Run `docker-compose up --build`
- [ ] Wait for startup (2-5 min for first build)
- [ ] Test health: `curl http://localhost:8080/docs` — should show FastAPI Swagger UI
- [ ] Test basic prompt via API: POST to `/api/v1/agencies/open-swarm/threads` with `{"message": "What can you do?"}`
- [ ] Verify response comes back with orchestrator reply
- [ ] `docker-compose down`
- [ ] Commit: `git commit -m "chore: verify docker build and API"`

---

## Phase 2: Agent Customization for Health/Nutrition

### Task 2.1: Customize Orchestrator

**Files:**
- Modify: `orchestrator/instructions.md`
- Modify: `shared_instructions.md`

- [ ] Replace `shared_instructions.md` with health-focused context:

```markdown
# Nourish AI Health Intelligence Platform

You are part of the Nourish AI multi-agent health intelligence system.
Your users are health-conscious families tracking nutrition, fitness,
lab results, neurotransmitter profiles, and wellness goals.

## Core Data Domains
- **Lab Results**: Blood panels (CBC, CMP, lipid, thyroid, vitamins, hormones)
- **Neurotransmitter Profiles**: Braverman Assessment (dopamine, acetylcholine, GABA, serotonin)
- **Blood Type Nutrition**: Type O/A/B/AB compatibility with foods
- **Fitness**: Workout tracking, body composition, muscle groups, periodization
- **Pantry & Grocery**: Household food inventory, expiration tracking
- **Meal Planning**: Blood-type-compatible, neuro-optimized weekly plans

## Key Principles
- Always cite sources (PubMed, USDA, NIH) when making health claims
- Never diagnose — educate and recommend consulting healthcare providers
- Prioritize food-based solutions over supplementation
- Consider blood type compatibility in all food recommendations
- Cross-reference lab data with dietary recommendations
- Account for drug-supplement interactions when recommending supplements
```

- [ ] Update `orchestrator/instructions.md` to route health queries to appropriate specialists
- [ ] Commit: `git commit -m "feat: customize orchestrator for health intelligence"`

### Task 2.2: Customize Deep Research Agent → Health Research Agent

**Files:**
- Modify: `deep_research/deep_research.py` (rename agent)
- Modify: `deep_research/instructions.md`

- [ ] Update agent name to "Health Research Agent"
- [ ] Update `instructions.md` to focus on:
  - PubMed literature search for nutrition/supplement evidence
  - Clinical trial lookup on ClinicalTrials.gov
  - Drug-supplement interaction verification
  - Blood type diet validation against scientific literature
  - Neurotransmitter-nutrient relationship research
- [ ] Commit: `git commit -m "feat: customize research agent for health literature"`

### Task 2.3: Customize Data Analyst → Health Analytics Agent

**Files:**
- Modify: `data_analyst_agent/data_analyst_agent.py`
- Modify: `data_analyst_agent/instructions.md`

- [ ] Update agent name to "Health Analytics Agent"
- [ ] Update instructions to specialize in:
  - Lab result trend analysis (matplotlib/plotly charts)
  - Biomarker statistical correlation (scipy)
  - Nutritional gap analysis (pandas)
  - Fitness progression statistics
  - Neurotransmitter score tracking over time
  - Household health comparison charts
- [ ] Commit: `git commit -m "feat: customize data analyst for health analytics"`

### Task 2.4: Customize Docs Agent → Health Report Generator

**Files:**
- Modify: `docs_agent/docs_agent.py`
- Modify: `docs_agent/instructions.md`

- [ ] Update agent name to "Health Report Generator"
- [ ] Update instructions for generating:
  - Lab Analysis Reports (PDF)
  - Neuro-Nutritional Recovery Protocols (PDF)
  - Weekly Meal Plans (printable PDF)
  - Monthly Fitness Reports
  - Doctor Visit Prep Packages
  - Supplement Protocol Cards
- [ ] Commit: `git commit -m "feat: customize docs agent for health reports"`

### Task 2.5: Customize Image Agent → Health Visual Agent

**Files:**
- Modify: `image_generation_agent/image_generation_agent.py`
- Modify: `image_generation_agent/instructions.md`

- [ ] Update instructions for:
  - Food/meal visualization
  - Neurotransmitter brain maps
  - Exercise form illustrations
  - Infographic generation for health data
- [ ] Commit: `git commit -m "feat: customize image agent for health visuals"`

### Task 2.6: Customize Video Agent → Exercise Demo Agent

**Files:**
- Modify: `video_generation_agent/video_generation_agent.py`
- Modify: `video_generation_agent/instructions.md`

- [ ] Update instructions for exercise demonstration videos
- [ ] Focus on proper form, safety cues, and rep cadence
- [ ] Commit: `git commit -m "feat: customize video agent for exercise demos"`

### Task 2.7: Customize Slides Agent → Health Presentation Agent

**Files:**
- Modify: `slides_agent/slides_agent.py`
- Modify: `slides_agent/instructions.md`

- [ ] Update instructions for health presentation use cases:
  - Protocol summaries
  - Meal plan presentations
  - Health progress reviews
  - Family health dashboards
- [ ] Commit: `git commit -m "feat: customize slides agent for health presentations"`

### Task 2.8: Update swarm.py with renamed agents

**Files:**
- Modify: `swarm.py`

- [ ] Update all factory function imports to use renamed agents
- [ ] Verify all communication flows remain intact
- [ ] Run `docker-compose up --build` and test with health-focused prompt
- [ ] Commit: `git commit -m "feat: wire all customized health agents into swarm"`

---

## Phase 3: Add Custom Health Tools to Agents

### Task 3.1: USDA Nutrition Lookup Tool

**Files:**
- Create: `shared_tools/usda_nutrition.py`

- [ ] Create Agency Swarm tool that queries USDA FoodData Central API
- [ ] Returns nutrition facts for any food item
- [ ] Available to Research + Data Analyst agents
- [ ] Commit: `git commit -m "feat: add USDA nutrition lookup tool"`

### Task 3.2: Biomarker Reference Tool

**Files:**
- Create: `shared_tools/biomarker_reference.py`

- [ ] Create tool with comprehensive biomarker database (ranges, meanings, food connections)
- [ ] Supports evaluating lab values against age/sex-appropriate ranges
- [ ] Available to Research + Data Analyst agents
- [ ] Commit: `git commit -m "feat: add biomarker reference tool"`

### Task 3.3: Drug-Supplement Interaction Tool

**Files:**
- Create: `shared_tools/interaction_checker.py`

- [ ] Create tool that checks supplement-drug interactions
- [ ] Uses known interaction database + FDA safety signals
- [ ] Available to Research agent
- [ ] Commit: `git commit -m "feat: add drug-supplement interaction tool"`

### Task 3.4: Blood Type Compatibility Tool

**Files:**
- Create: `shared_tools/blood_type_diet.py`

- [ ] Create tool with blood type food compatibility data
- [ ] Returns beneficial/neutral/avoid classification per food per blood type
- [ ] Available to all agents
- [ ] Commit: `git commit -m "feat: add blood type diet tool"`

### Task 3.5: Test all custom tools

- [ ] Run `docker-compose up --build`
- [ ] Test: "What nutrition does salmon provide for blood type O?"
- [ ] Verify orchestrator routes to Research → uses USDA + blood type tools
- [ ] Commit: `git commit -m "test: verify custom health tools integration"`

---

## Phase 4: VPS Deployment & Express Bridge

### Task 4.1: Deploy Docker to VPS

- [ ] SSH into VPS
- [ ] Install Docker and Docker Compose if not present
- [ ] Clone `newmindsgroup/openswarm-health` repo
- [ ] Copy `.env` with production API keys
- [ ] Run `docker-compose up -d --build`
- [ ] Verify: `curl http://localhost:8080/docs`
- [ ] Set restart policy: `docker update --restart=unless-stopped openswarm-health-openswarm-1`

### Task 4.2: NGINX Reverse Proxy

- [ ] Add NGINX config to proxy `/swarm-api/*` → `localhost:8080`
- [ ] Ensure port 8080 is NOT exposed publicly (internal only)
- [ ] Test: `curl https://yourdomain.com/swarm-api/docs`
- [ ] Reload NGINX: `sudo nginx -t && sudo systemctl reload nginx`

### Task 4.3: Express Bridge Routes

**Files:**
- Create: `server/routes/swarm.js`
- Modify: `server/index.js` (add route mounting)

- [ ] Create `server/routes/swarm.js` with proxy routes:

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

const SWARM_BASE = process.env.SWARM_API_URL || 'http://localhost:8080';

// Health check
router.get('/health', async (req, res) => {
  try {
    const resp = await fetch(`${SWARM_BASE}/docs`);
    res.json({ success: true, status: resp.ok ? 'healthy' : 'degraded' });
  } catch (err) {
    res.json({ success: false, status: 'offline', error: err.message });
  }
});

// Create thread (start new conversation with swarm)
router.post('/threads', authenticateToken, async (req, res) => {
  try {
    const resp = await fetch(`${SWARM_BASE}/api/v1/agencies/open-swarm/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: req.body.message }),
    });
    const data = await resp.json();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Send message to existing thread
router.post('/threads/:threadId/messages', authenticateToken, async (req, res) => {
  try {
    const resp = await fetch(
      `${SWARM_BASE}/api/v1/agencies/open-swarm/threads/${req.params.threadId}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: req.body.message }),
      }
    );
    const data = await resp.json();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get generated files (reports, charts, etc.)
router.get('/files/:filename', authenticateToken, async (req, res) => {
  try {
    const resp = await fetch(`${SWARM_BASE}/files/${req.params.filename}`);
    const buffer = await resp.arrayBuffer();
    res.set('Content-Type', resp.headers.get('content-type'));
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
```

- [ ] Mount in `server/index.js`: `app.use('/api/swarm', require('./routes/swarm'));`
- [ ] Test: `curl -H "Authorization: Bearer <jwt>" http://localhost:3001/api/swarm/health`
- [ ] Commit: `git commit -m "feat: add Express bridge routes for OpenSwarm"`

### Task 4.4: Frontend API Service

**Files:**
- Create: `src/services/swarmService.ts`

- [ ] Create frontend service for calling swarm endpoints:

```typescript
import { apiClient } from './apiClient';

export interface SwarmResponse {
  threadId: string;
  agentName: string;
  message: string;
  files?: { name: string; url: string; type: string }[];
  status: 'completed' | 'in_progress' | 'error';
}

export async function createSwarmThread(message: string, context?: Record<string, unknown>): Promise<SwarmResponse> {
  const enrichedMessage = context
    ? `${message}\n\n[CONTEXT DATA]\n${JSON.stringify(context, null, 2)}`
    : message;
  const resp = await apiClient.post('/swarm/threads', { message: enrichedMessage });
  return resp.data.data;
}

export async function sendSwarmMessage(threadId: string, message: string): Promise<SwarmResponse> {
  const resp = await apiClient.post(`/swarm/threads/${threadId}/messages`, { message });
  return resp.data.data;
}

export async function getSwarmFile(filename: string): Promise<Blob> {
  const resp = await apiClient.get(`/swarm/files/${filename}`, { responseType: 'blob' });
  return resp.data;
}

export function checkSwarmHealth(): Promise<{ status: string }> {
  return apiClient.get('/swarm/health').then(r => r.data);
}
```

- [ ] Commit: `git commit -m "feat: add frontend swarm API service"`

---

## Phase 5: Feature Integration — Lab Intelligence

### Task 5.1: "Deep Analysis" Button on Lab Report

**Files:**
- Modify: `src/components/labs/LabReportView.tsx`

- [ ] Add "🔬 Deep Analysis" button next to existing AI insights
- [ ] On click: gather all lab results + person profile + historical reports
- [ ] Call `createSwarmThread()` with rich context prompt
- [ ] Display loading state with agent progress indicators
- [ ] Commit: `git commit -m "feat: add deep analysis button to lab reports"`

### Task 5.2: Lab Report PDF Generation

**Files:**
- Modify: `src/components/labs/LabReportView.tsx`

- [ ] Add "📄 Generate Full Report" button
- [ ] Sends lab data to swarm with instruction to produce PDF
- [ ] Downloads resulting PDF from swarm file endpoint
- [ ] Commit: `git commit -m "feat: add PDF lab report generation via swarm"`

### Task 5.3: Lab Trend Charts via Data Analyst

**Files:**
- Modify: `src/components/labs/LabHistory.tsx`

- [ ] Add "📊 Statistical Analysis" button
- [ ] Sends historical lab data to swarm Data Analyst agent
- [ ] Receives and displays generated matplotlib/plotly chart images
- [ ] Commit: `git commit -m "feat: add statistical lab trend analysis"`

---

## Phase 6: Feature Integration — Neuro Intelligence

### Task 6.1: Research-Backed Neuro Protocol

**Files:**
- Modify: `src/components/assessment/NeuroReport.tsx`

- [ ] Add "🧬 Research-Backed Protocol" button
- [ ] Sends Braverman results + lab data + profile to swarm
- [ ] Receives evidence-based protocol with PubMed citations
- [ ] Displays citations inline with protocol recommendations
- [ ] Commit: `git commit -m "feat: add research-backed neuro protocol via swarm"`

### Task 6.2: Neuro-Lab Correlation Report

**Files:**
- Modify: `src/components/assessment/NeuroReport.tsx`

- [ ] Add "🔗 Lab-Neuro Correlation" button
- [ ] Sends neuro scores + all lab results to swarm
- [ ] Data Analyst runs statistical correlation
- [ ] Returns charts + correlation report
- [ ] Commit: `git commit -m "feat: add neuro-lab statistical correlation"`

### Task 6.3: Neuro Protocol PDF

- [ ] Add "📄 Export Protocol" button
- [ ] Generates professional PDF via Docs Agent
- [ ] Includes supplement schedule, dietary plan, lifestyle recommendations
- [ ] Commit: `git commit -m "feat: add neuro protocol PDF export"`

---

## Phase 7: Feature Integration — Meal Planning

### Task 7.1: Nutritionally Validated Meal Plans

**Files:**
- Modify: `src/components/WeeklyPlanView.tsx`

- [ ] Add "🔬 Verified Meal Plan" option to plan generation
- [ ] Sends profile + blood type + labs + neuro + pantry to swarm
- [ ] Orchestrator coordinates: Research validates, Data Analyst checks nutrition
- [ ] Returns meal plan with USDA-verified macros/micros
- [ ] Commit: `git commit -m "feat: add nutritionally validated meal plan generation"`

### Task 7.2: Meal Plan PDF with Images

- [ ] Add "📄 Print-Ready Plan" button
- [ ] Docs Agent generates beautiful PDF with recipes and grocery list
- [ ] Image Agent generates food photos for each meal
- [ ] Commit: `git commit -m "feat: add meal plan PDF with AI food images"`

---

## Phase 8: Feature Integration — Fitness Intelligence

### Task 8.1: Statistical Fitness Analysis

**Files:**
- Modify: `src/components/fitness/ProgressCharts.tsx`

- [ ] Add "📊 Deep Analysis" button
- [ ] Sends workout history to swarm Data Analyst
- [ ] Returns: strength curves, plateau detection, volume analysis charts
- [ ] Commit: `git commit -m "feat: add statistical fitness analysis via swarm"`

### Task 8.2: Monthly Fitness Report PDF

**Files:**
- Modify: `src/components/fitness/FitnessDashboard.tsx`

- [ ] Add "📄 Monthly Report" button
- [ ] Generates comprehensive PDF: progress, body comp, milestones
- [ ] Commit: `git commit -m "feat: add monthly fitness report PDF"`

### Task 8.3: Exercise Demo Video Generation

**Files:**
- Modify: `src/components/fitness/WorkoutLibrary.tsx`

- [ ] Add "🎬 Show Me How" button per exercise
- [ ] Routes to Video Agent for exercise demonstration
- [ ] Displays generated video inline
- [ ] Commit: `git commit -m "feat: add AI exercise demo video generation"`

---

## Phase 9: Feature Integration — Chat Enhancement

### Task 9.1: Complex Query Routing

**Files:**
- Modify: `src/services/chatService.ts`

- [ ] Add complexity detection: if query touches multiple domains (labs + diet + supplements), route to swarm
- [ ] Simple queries stay on existing Vercel Edge pipeline (fast)
- [ ] Complex queries go to swarm for multi-agent research
- [ ] Commit: `git commit -m "feat: add complex query routing to swarm"`

### Task 9.2: Swarm Response UI in Chat

**Files:**
- Modify: `src/components/ChatPanel.tsx`

- [ ] Display swarm responses with agent attribution
- [ ] Show file attachments (PDFs, charts) inline
- [ ] Add citation links for research sources
- [ ] Commit: `git commit -m "feat: add swarm response rendering in chat"`

---

## Phase 10: Feature Integration — Cross-Reference & Reports

### Task 10.1: Statistical Cross-Reference Engine

**Files:**
- Modify: `src/components/WelcomeWidget.tsx` or new dashboard component

- [ ] Add "🔬 Full Health Analysis" button
- [ ] Sends ALL household data (labs, pantry, fitness, neuro, profiles) to swarm
- [ ] Data Analyst discovers correlations via pandas/scipy
- [ ] Returns statistical findings with charts
- [ ] Commit: `git commit -m "feat: add statistical cross-reference analysis"`

### Task 10.2: Comprehensive Health Report

- [ ] Add "📋 Generate Health Report" to dashboard
- [ ] Orchestrator coordinates all agents for full household report
- [ ] Output: Professional PDF covering labs, neuro, fitness, nutrition, recommendations
- [ ] Commit: `git commit -m "feat: add comprehensive health report generation"`

### Task 10.3: Doctor Visit Prep Package

- [ ] Add "🏥 Prep for Doctor Visit" button
- [ ] Generates summary PDF formatted for healthcare provider review
- [ ] Includes: all recent labs, trends, current supplements, concerns
- [ ] Commit: `git commit -m "feat: add doctor visit prep package"`

---

## Phase 11: Health Presentation Slides

### Task 11.1: Protocol Slide Deck

**Files:**
- Modify: `src/components/assessment/NeuroReport.tsx`

- [ ] Add "📊 Generate Presentation" button
- [ ] Slides Agent creates PPTX with protocol summary, charts, action items
- [ ] Downloadable as PowerPoint file
- [ ] Commit: `git commit -m "feat: add neuro protocol slide generation"`

### Task 11.2: Meal Plan Presentation

- [ ] Add slide generation option to meal plan view
- [ ] Creates visual presentation of weekly meals with images
- [ ] Commit: `git commit -m "feat: add meal plan presentation slides"`

---

## Verification Plan

### After Each Phase
- [ ] Run existing app: `npm run dev` — verify no regressions
- [ ] Run swarm: `docker-compose up` — verify agents respond
- [ ] Test Express bridge: `curl /api/swarm/health`
- [ ] End-to-end: Frontend → Express → Swarm → Response with files

### Final Integration Test
- [ ] Upload lab report → trigger deep analysis → receive PDF report with charts
- [ ] Complete neuro assessment → generate research-backed protocol → download PDF
- [ ] Generate meal plan → verified with USDA data → download printable PDF
- [ ] Request fitness analysis → receive statistical charts + monthly report
- [ ] Complex chat query → swarm research → cited response in chat
- [ ] Full health report → comprehensive PDF with all domains
