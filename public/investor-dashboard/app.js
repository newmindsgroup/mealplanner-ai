/* ============================================================
   NourishAI Investor Dashboard | App Logic
   ============================================================ */

// ── DATA ──────────────────────────────────────────────────────

const FEATURES = [
  { icon: 'dna', name: 'Blood Type Meal Planning', desc: 'AI generates 7-day personalized meal plans for all 8 blood type variants with grocery auto-generation.', value: '$180K' },
  { icon: 'utensils', name: 'Recipe Library (101+)', desc: '6 curated recipe databases spanning international cuisines, blood type diets, smoothies, and desserts.', value: '$65K' },
  { icon: 'scan-line', name: 'OCR Label Scanner', desc: 'Camera-powered food label scanning with Tesseract.js OCR and AI ingredient analysis with health scoring.', value: '$120K' },
  { icon: 'brain', name: 'Braverman Neuro Assessment', desc: '120-question neurotransmitter profiling with AI Dr. Neura conversational mode and daily check-ins.', value: '$150K' },
  { icon: 'dumbbell', name: 'Fitness & Training (33 components)', desc: 'Full workout tracking, 978KB exercise library, muscle heatmap, body analysis, and AI coaching.', value: '$200K' },
  { icon: 'microscope', name: 'Lab Report Analysis', desc: 'OCR lab scanning, 50+ biomarker tracking, trend visualization, and clinical alert system.', value: '$140K' },
  { icon: 'message-square', name: 'AI Chat Assistant', desc: 'Context-aware chatbot with 12+ intent categories, tool calling, voice I/O, and swarm analysis.', value: '$160K' },
  { icon: 'home', name: 'Household Management', desc: 'Multi-person family management with roles (Owner/Admin/Member/Viewer) and email invitations.', value: '$80K' },
  { icon: 'package', name: 'Pantry Management', desc: 'Full inventory tracking with barcode scanning, expiration alerts, CSV import, and usage history.', value: '$90K' },
  { icon: 'shopping-cart', name: 'Smart Grocery Lists', desc: 'Auto-generated categorized shopping lists from meal plans with pantry deduction.', value: '$40K' },
  { icon: 'pill', name: 'Supplement Schedule', desc: 'Time-of-day supplement planning with interaction warnings and blood-type-specific dosing.', value: '$70K' },
  { icon: 'file-bar-chart', name: 'Cross-Domain Health Report', desc: 'Multi-domain health analysis combining labs, neuro, fitness, and nutrition with PDF export.', value: '$95K' },
  { icon: 'sparkles', name: 'Proactive Insights Engine', desc: 'AI continuously scans all health data and surfaces urgent, warning, and informational alerts.', value: '$110K' },
  { icon: 'git-compare', name: 'Food Comparison Matrix', desc: 'Side-by-side blood type compatibility for all family members with universal safe food identification.', value: '$45K' },
  { icon: 'mail', name: 'Weekly Email Digest', desc: 'Branded HTML email generator with inline CSS summarizing weekly health data and action items.', value: '$35K' },
  { icon: 'graduation-cap', name: 'Interactive Guided Tours', desc: '10 Driver.js onboarding tours with contextual suggestions, keyboard shortcuts, and progress tracking.', value: '$50K' },
  { icon: 'flask-conical', name: 'PubMed Live Research', desc: 'Direct NCBI E-utilities integration providing verified biomedical citations for clinical protocols.', value: '$75K' },
  { icon: 'mic', name: 'Voice Input/Output', desc: 'Web Speech API integration for hands-free interaction with configurable voice and auto-read.', value: '$30K' },
  { icon: 'file-text', name: 'PDF/CSV Export Suite', desc: '6 export services generating professional meal plans, lab reports, food guides, and health reports.', value: '$55K' },
  { icon: 'award', name: 'Gamification Engine', desc: 'XP system, levels, streaks, badges, and confetti animations for engagement retention.', value: '$40K' },
  { icon: 'credit-card', name: 'Stripe Billing System', desc: 'Multi-tier subscription with Checkout, Customer Portal, webhooks, and subscription gating.', value: '$60K' },
  { icon: 'smartphone', name: 'PWA + Docker Deployment', desc: 'Installable PWA with 72 precached entries plus Docker/NGINX production orchestration.', value: '$45K' },
];

const USE_CASES = [
  { category: 'research', icon: 'network', title: 'Swarm Orchestrator (The Medical Coordinator)', desc: 'When a user asks a complex health question, this main AI acts like a chief medical coordinator. It breaks the question into smaller parts, assigns them to specialized AI experts in the system, and combines their findings into one clear, easy-to-understand answer.', tags: ['Multi-Agent Routing', 'Context Synthesis', 'Fallback Engine'] },
  { category: 'research', icon: 'microscope', title: 'Health Research Agent (The Librarian)', desc: 'Instead of relying on generic internet advice, this AI directly searches verified medical databases like PubMed. If a user wants to know if a new supplement is safe, this agent double-checks it against real medical journals and known drug interactions to ensure total safety.', tags: ['NCBI E-utilities', 'PubMed', 'Interaction Checker'] },
  { category: 'analytics', icon: 'bar-chart-3', title: 'Health Analytics Agent (The Data Scientist)', desc: 'Users can simply take a photo of their blood work, and this AI reads and understands it. It looks for hidden trends across years of lab results, like dropping Vitamin D levels, and connects those dots directly to the user\'s mood, diet, and brain health.', tags: ['Trend Analysis', 'OCR Extraction', 'Biomarker Reference'] },
  { category: 'analytics', icon: 'users', title: 'Family Cohort Analytics (The Household Manager)', desc: 'It analyzes the health needs of the entire family at once. If dad is on a heart-healthy diet, mom is avoiding gluten, and the kids are growing, this AI finds the exact overlap of safe, healthy meals for everyone, saving time and money at the grocery store.', tags: ['Multi-Tenant Data', 'Cohort Analysis', 'Optimization Algorithms'] },
  { category: 'generative', icon: 'file-text', title: 'Report Generator Agent (The Clinical Assistant)', desc: 'It turns complex health data into beautiful, professional PDF documents. Whether it\'s a "Doctor Visit Prep Package" summarizing a user\'s recent symptoms for their physician, or a printable weekly meal plan for the fridge, this AI formats everything perfectly.', tags: ['PDF Generation', 'Clinical Export', 'Printable Plans'] },
  { category: 'generative', icon: 'monitor-play', title: 'Visual & Demo Agents (The Creative Studio)', desc: 'Health data can be confusing, so these AIs make it visual. They instantly draw color-coded "brain maps" to explain mood imbalances, design easy-to-read infographics of meal plans, and even generate custom exercise video clips showing the user exactly how to perform a workout safely.', tags: ['Image Generation', 'Infographics', 'Exercise Demos'] },
  { category: 'generative', icon: 'presentation', title: 'Presentation Agent (The Executive Presenter)', desc: 'Designed for health coaches, dietitians, or families tracking serious progress, this AI automatically builds ready-to-present PowerPoint slide decks. It tells the story of a user\'s health journey, celebrating fitness milestones and lab improvements in a highly visual format.', tags: ['PPTX Generation', 'Data Storytelling', 'Coaching Tools'] },
  { category: 'tools', icon: 'wrench', title: 'Autonomous Diagnostic Tools (The Expert Toolbelt)', desc: 'Our AIs are armed with specialized, professional tools. They have direct access to the USDA food database for perfect nutritional facts, a medical lab-reference tool to know exactly what is healthy for a specific age and gender, and a massive library of blood-type diet rules.', tags: ['USDA API', 'Blood Type Matrix', 'Database Lookups'] },
];

const MARKET_COMPARISONS = [
  { feature: 'AI Meal Planning', competitor: 'Eat This Much Pro', cost: '$8.99' },
  { feature: 'Blood Type Diet Guide', competitor: 'TypeBase / Books', cost: '$14.99' },
  { feature: 'Food Label Scanning', competitor: 'Yuka Premium', cost: '$14.99' },
  { feature: 'Lab Analysis & Tracking', competitor: 'InsideTracker', cost: '$49.00' },
  { feature: 'Neurotransmitter Assessment', competitor: 'BravermanTest.com', cost: '$29.99' },
  { feature: 'Workout Tracking + AI', competitor: 'Fitbod Premium', cost: '$12.99' },
  { feature: 'Pantry Management', competitor: 'Pantry Check Pro', cost: '$4.99' },
  { feature: 'Supplement Scheduling', competitor: 'Pillbox / Care/of', cost: '$19.99' },
  { feature: 'AI Health Chat', competitor: 'Ada Health Premium', cost: '$9.99' },
  { feature: 'Grocery List Manager', competitor: 'AnyList Premium', cost: '$4.99' },
  { feature: 'Health Reports/PDF Export', competitor: 'Custom Development', cost: '$29.99' },
  { feature: 'Family/Household Mgmt', competitor: 'Per-app family tiers', cost: '$14.99' },
];

const COST_BREAKDOWN = [
  { area: 'Frontend (React/TypeScript)', hours: '2,400', rate: '$150/hr', total: '$360,000' },
  { area: 'Backend (Node/Express/MySQL)', hours: '1,200', rate: '$160/hr', total: '$192,000' },
  { area: 'AI/ML Integration', hours: '800', rate: '$200/hr', total: '$160,000' },
  { area: 'OCR & Computer Vision', hours: '400', rate: '$180/hr', total: '$72,000' },
  { area: 'Data Architecture (1.5MB)', hours: '600', rate: '$140/hr', total: '$84,000' },
  { area: 'UI/UX Design', hours: '800', rate: '$130/hr', total: '$104,000' },
  { area: 'QA & Testing', hours: '500', rate: '$120/hr', total: '$60,000' },
  { area: 'DevOps & Deployment', hours: '300', rate: '$170/hr', total: '$51,000' },
  { area: 'PubMed/Clinical Integration', hours: '300', rate: '$190/hr', total: '$57,000' },
  { area: 'Billing (Stripe)', hours: '200', rate: '$160/hr', total: '$32,000' },
  { area: 'Project Management', hours: '400', rate: '$140/hr', total: '$56,000' },
];

// ── RENDER FUNCTIONS ─────────────────────────────────────────

function renderFeatures() {
  const grid = document.getElementById('features-grid');
  grid.innerHTML = FEATURES.map(f => `
    <div class="feature-card fade-up">
      <div class="feature-card-icon"><i data-lucide="${f.icon}"></i></div>
      <h3>${f.name}</h3>
      <p>${f.desc}</p>
      <span class="feature-card-value">≈ ${f.value} to build</span>
    </div>
  `).join('');
}

function renderUseCases(filter = 'all') {
  const grid = document.getElementById('usecases-grid');
  grid.innerHTML = USE_CASES.filter(u => filter === 'all' || u.category === filter).map(u => `
    <div class="usecase-card fade-up visible">
      <div class="usecase-header">
        <div class="usecase-icon"><i data-lucide="${u.icon}"></i></div>
        <div>
          <div class="usecase-category">${u.category === 'research' ? 'Research & Orchestration' : u.category === 'analytics' ? 'Data Analytics' : u.category === 'generative' ? 'Generative & Reports' : 'Custom AI Tools'}</div>
          <h3 class="usecase-title">${u.title}</h3>
        </div>
      </div>
      <p class="usecase-desc">${u.desc}</p>
      <div class="usecase-features">
        ${u.tags.map(tag => `<span class="usecase-feature-tag">${tag}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

function initUseCaseFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Update active state
      buttons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      // Filter cases
      const filter = e.target.dataset.filter;
      renderUseCases(filter);
      if (window.lucide) {
        window.lucide.createIcons();
      }
    });
  });
}

function renderMarketTable() {
  const tbody = document.querySelector('#market-table tbody');
  let total = 0;
  tbody.innerHTML = MARKET_COMPARISONS.map(m => {
    const cost = parseFloat(m.cost.replace('$', ''));
    total += cost;
    return `
      <tr>
        <td>${m.feature}</td>
        <td style="color:var(--text2)">${m.competitor}</td>
        <td style="font-family:var(--mono);font-weight:600;color:var(--rose)">${m.cost}/mo</td>
        <td style="color:var(--accent);font-weight:600">✅ Included</td>
      </tr>
    `;
  }).join('');
  document.getElementById('market-total').textContent = `$${total.toFixed(2)}/mo`;
  document.getElementById('annual-savings').textContent = `$${(total * 12).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/yr`;
}

function renderCostGrid() {
  const grid = document.getElementById('cost-grid');
  let totalCost = 0;
  grid.innerHTML = COST_BREAKDOWN.map(c => {
    totalCost += parseInt(c.total.replace(/[$,]/g, ''));
    return `
      <div class="cost-card fade-up">
        <h4>${c.area}</h4>
        <div class="cost-card-hours">${c.hours} hours</div>
        <div class="cost-card-rate">@ ${c.rate}</div>
        <div class="cost-card-total">${c.total}</div>
      </div>
    `;
  }).join('');
  document.getElementById('total-eng-cost').textContent = `$${totalCost.toLocaleString()}`;
}

// ── COUNTER ANIMATION ────────────────────────────────────────

function animateCounters() {
  document.querySelectorAll('.hero-stat').forEach(stat => {
    const target = parseInt(stat.dataset.count);
    const numEl = stat.querySelector('.hero-stat-num');
    let current = 0;
    const step = Math.ceil(target / 40);
    const interval = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(interval); }
      numEl.textContent = current + (target === 100 ? '+' : target === 52 ? '+' : '');
    }, 30);
  });
}

// ── SCROLL ANIMATIONS ────────────────────────────────────────

function initScrollObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

// ── NAV ACTIVE STATE ─────────────────────────────────────────

function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 100) current = s.id;
    });
    links.forEach(l => {
      l.style.color = l.getAttribute('href') === '#' + current ? 'var(--accent)' : '';
      l.style.background = l.getAttribute('href') === '#' + current ? 'rgba(16,185,129,0.1)' : '';
    });
  });
}

// ── INIT ─────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  renderFeatures();
  renderUseCases();
  initUseCaseFilters();
  renderMarketTable();
  renderCostGrid();
  animateCounters();
  setTimeout(initScrollObserver, 100);
  initNavHighlight();
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
