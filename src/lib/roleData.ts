import { Briefcase, Code, BarChart3, TrendingUp, Stethoscope, DollarSign, Building2, Users, Scale, Target, Cog, Package, ShoppingCart, Laptop, GraduationCap, Calculator, Landmark } from "lucide-react";

export interface RoleData {
  slug: string;
  name: string;
  icon: any;
  description: string;
  longDescription: string;
  targetAudience: string[];
  dimensions: {
    code: string;
    name: string;
    description: string;
  }[];
  careerBenefits: string[];
  beginnerSlug: string;
  advancedSlug: string;
}

export const professionalRoles: RoleData[] = [
  {
    slug: "product-manager",
    name: "Product Manager",
    icon: Package,
    description: "Master AI-powered product development and strategic innovation",
    longDescription: "Product managers shape the future of products using AI for data-driven decisions, user insights, and strategic roadmapping. This assessment evaluates your ability to leverage AI across the entire product lifecycle.",
    targetAudience: ["Product Managers", "Product Owners", "Product Leaders", "Innovation Directors"],
    dimensions: [
      { code: "PAI", name: "Product AI Understanding", description: "Understanding AI capabilities in product development" },
      { code: "UII", name: "User Insights & Intelligence", description: "Leveraging AI for user research and behavior analysis" },
      { code: "PDM", name: "Product Data & Metrics", description: "Using AI to analyze product metrics and KPIs" },
      { code: "ARP", name: "AI in Roadmap Planning", description: "Integrating AI tools into strategic product planning" },
      { code: "CPE", name: "Collaborative Product Execution", description: "AI-powered cross-functional collaboration" },
      { code: "EFI", name: "Ethical Feature Innovation", description: "Responsible AI feature development and ethics" },
      { code: "CSP", name: "Competitive Strategy & Positioning", description: "AI-driven competitive analysis" },
      { code: "TPI", name: "Technical Product Integration", description: "Understanding AI technical feasibility and integration" }
    ],
    careerBenefits: [
      "Build AI-native products with confidence",
      "Make data-driven product decisions faster",
      "Lead cross-functional teams with AI expertise",
      "Stand out in competitive PM job markets"
    ],
    beginnerSlug: "pm-beginner",
    advancedSlug: "pm-advanced"
  },
  {
    slug: "software-engineer",
    name: "Software Engineer",
    icon: Code,
    description: "Excel in AI-assisted development and intelligent coding workflows",
    longDescription: "Software engineers leverage AI for code generation, debugging, testing, and architecture. This assessment measures your ability to collaborate with AI coding assistants and build AI-powered applications.",
    targetAudience: ["Software Developers", "Full-Stack Engineers", "Backend Engineers", "DevOps Engineers"],
    dimensions: [
      { code: "AIC", name: "AI-Assisted Coding", description: "Using AI tools for code generation and completion" },
      { code: "MIA", name: "Model Integration & APIs", description: "Integrating AI models and APIs into applications" },
      { code: "DPM", name: "Data & Prompt Management", description: "Managing training data and optimizing prompts" },
      { code: "PAO", name: "Performance & Optimization", description: "Optimizing AI model performance and efficiency" },
      { code: "TDE", name: "Testing & Debugging with AI", description: "AI-powered testing and debugging workflows" },
      { code: "SRC", name: "Security & Responsible Coding", description: "Secure AI implementation and ethical coding" },
      { code: "UIF", name: "UI/UX for AI Features", description: "Designing interfaces for AI-powered features" },
      { code: "AIM", name: "AI in Maintenance & Scalability", description: "Scaling and maintaining AI systems" }
    ],
    careerBenefits: [
      "10x your coding productivity with AI",
      "Build cutting-edge AI-powered applications",
      "Debug and optimize code faster",
      "Command higher salaries in AI-driven companies"
    ],
    beginnerSlug: "sde-beginner",
    advancedSlug: "sde-advanced"
  },
  {
    slug: "data-scientist",
    name: "Data Scientist",
    icon: BarChart3,
    description: "Master advanced machine learning and AI model development",
    longDescription: "Data scientists build, train, and deploy AI models. This assessment evaluates your expertise in machine learning workflows, model evaluation, and production deployment of AI systems.",
    targetAudience: ["Data Scientists", "ML Engineers", "AI Researchers", "Analytics Leaders"],
    dimensions: [
      { code: "MAI", name: "Machine Learning & AI", description: "Core ML algorithms and AI techniques" },
      { code: "MDE", name: "Model Development & Experimentation", description: "Building and iterating on ML models" },
      { code: "MEV", name: "Model Evaluation & Validation", description: "Testing model performance and accuracy" },
      { code: "DPP", name: "Data Preprocessing & Pipelines", description: "Preparing data for model training" },
      { code: "MPD", name: "Model Production & Deployment", description: "Deploying models to production environments" },
      { code: "ERM", name: "Ethics & Responsible ML", description: "Addressing bias and fairness in AI" },
      { code: "CCE", name: "Cross-functional Collaboration", description: "Communicating insights to stakeholders" },
      { code: "TIO", name: "Tools & Infrastructure Optimization", description: "Leveraging ML platforms and tools" }
    ],
    careerBenefits: [
      "Build state-of-the-art ML models",
      "Deploy AI systems at scale",
      "Lead data science teams with confidence",
      "Work on cutting-edge AI research"
    ],
    beginnerSlug: "ds-beginner",
    advancedSlug: "ds-advanced"
  },
  {
    slug: "business-analyst",
    name: "Business Analyst",
    icon: Target,
    description: "Leverage AI for requirements analysis and business intelligence",
    longDescription: "Business analysts use AI to gather insights, analyze requirements, and optimize business processes. This assessment measures your ability to leverage AI throughout the business analysis lifecycle.",
    targetAudience: ["Business Analysts", "Requirements Analysts", "Systems Analysts", "Process Improvement Specialists"],
    dimensions: [
      { code: "BAI", name: "Business AI Integration", description: "Understanding AI applications in business contexts" },
      { code: "RDA", name: "Requirements & Data Analysis", description: "AI-powered requirements gathering and analysis" },
      { code: "DIA", name: "Data Insights & Analytics", description: "Using AI for business intelligence" },
      { code: "PSM", name: "Process & Systems Modeling", description: "AI-assisted process mapping and optimization" },
      { code: "STE", name: "Stakeholder & Team Engagement", description: "Communicating AI insights to stakeholders" },
      { code: "ABV", name: "AI for Business Validation", description: "Validating solutions with AI-driven testing" },
      { code: "CCI", name: "Change & Continuous Improvement", description: "AI-powered change management" },
      { code: "TDA", name: "Tools & Documentation Automation", description: "Using AI for documentation and reporting" }
    ],
    careerBenefits: [
      "Accelerate requirements gathering with AI",
      "Make data-driven business recommendations",
      "Optimize processes using AI insights",
      "Bridge technical and business stakeholders"
    ],
    beginnerSlug: "ba-beginner",
    advancedSlug: "ba-advanced"
  },
  {
    slug: "digital-marketer",
    name: "Digital Marketer",
    icon: TrendingUp,
    description: "Drive growth with AI-powered marketing strategies",
    longDescription: "Digital marketers leverage AI for campaign optimization, content generation, audience targeting, and performance analytics. This assessment evaluates your ability to use AI across all marketing channels.",
    targetAudience: ["Digital Marketers", "Marketing Managers", "Growth Hackers", "Content Marketers"],
    dimensions: [
      { code: "MAI", name: "Marketing AI Integration", description: "Applying AI tools to marketing workflows" },
      { code: "CAC", name: "Content & Ad Creation", description: "AI-generated content and ad copy" },
      { code: "CSI", name: "Customer Segmentation & Insights", description: "AI-powered audience targeting" },
      { code: "CPO", name: "Campaign Performance Optimization", description: "Using AI to optimize campaign ROI" },
      { code: "PMM", name: "Predictive Marketing & Modeling", description: "AI forecasting and predictive analytics" },
      { code: "PEC", name: "Personalization & Customer Experience", description: "AI-driven personalization strategies" },
      { code: "ETC", name: "Ethics, Trust & Compliance", description: "Responsible AI marketing practices" },
      { code: "TAP", name: "Tools & Automation Platforms", description: "Marketing automation and AI platforms" }
    ],
    careerBenefits: [
      "10x your marketing content output",
      "Optimize campaigns with AI-driven insights",
      "Personalize customer experiences at scale",
      "Lead marketing teams into the AI era"
    ],
    beginnerSlug: "dm-beginner",
    advancedSlug: "dm-advanced"
  },
  {
    slug: "hr-professional",
    name: "HR Professional",
    icon: Users,
    description: "Transform talent management with AI-powered HR strategies",
    longDescription: "HR professionals use AI for recruitment, talent development, engagement, and workforce planning. This assessment measures your ability to leverage AI across the employee lifecycle.",
    targetAudience: ["HR Managers", "Talent Acquisition Specialists", "L&D Professionals", "People Operations"],
    dimensions: [
      { code: "HAI", name: "HR AI Integration", description: "Understanding AI applications in HR" },
      { code: "TAA", name: "Talent Acquisition & Assessment", description: "AI-powered recruiting and candidate screening" },
      { code: "PDA", name: "Performance & Development Analytics", description: "Using AI for performance management" },
      { code: "HRA", name: "HR Analytics & Reporting", description: "AI-driven workforce analytics" },
      { code: "EEC", name: "Employee Experience & Engagement", description: "AI tools for employee satisfaction" },
      { code: "CEG", name: "Compliance, Ethics & Governance", description: "Responsible AI in HR practices" },
      { code: "SCS", name: "Succession & Career Strategy", description: "AI-powered succession planning" },
      { code: "VTO", name: "Vendor & Tech Optimization", description: "Selecting and managing HR AI tools" }
    ],
    careerBenefits: [
      "Streamline recruiting with AI screening",
      "Make data-driven people decisions",
      "Improve employee engagement and retention",
      "Lead HR transformation initiatives"
    ],
    beginnerSlug: "hr-beginner",
    advancedSlug: "hr-advanced"
  },
  {
    slug: "sales-professional",
    name: "Sales Professional",
    icon: ShoppingCart,
    description: "Accelerate sales with AI-powered prospecting and closing",
    longDescription: "Sales professionals leverage AI for lead generation, pipeline management, personalized outreach, and closing optimization. This assessment evaluates your ability to use AI throughout the sales cycle.",
    targetAudience: ["Sales Representatives", "Account Executives", "Sales Managers", "Business Development"],
    dimensions: [
      { code: "SAI", name: "Sales AI Integration", description: "Understanding AI applications in sales" },
      { code: "LPO", name: "Lead Prioritization & Optimization", description: "AI-powered lead scoring and routing" },
      { code: "CII", name: "Customer Intelligence & Insights", description: "Using AI for customer research" },
      { code: "SFP", name: "Sales Forecasting & Pipeline", description: "AI-driven pipeline and revenue forecasting" },
      { code: "CAE", name: "Communication & AI-Enhanced Engagement", description: "AI-assisted personalized outreach" },
      { code: "PWO", name: "Proposal Writing & Optimization", description: "AI-generated proposals and presentations" },
      { code: "ETC", name: "Ethics, Trust & Compliance", description: "Responsible AI selling practices" },
      { code: "TSI", name: "Tools & System Integration", description: "CRM and sales AI platforms" }
    ],
    careerBenefits: [
      "Close more deals with AI-powered insights",
      "Automate repetitive prospecting tasks",
      "Personalize outreach at scale",
      "Hit quota consistently with AI"
    ],
    beginnerSlug: "sales-beginner",
    advancedSlug: "sales-advanced"
  },
  {
    slug: "operations-manager",
    name: "Operations Manager",
    icon: Cog,
    description: "Optimize operations with AI-driven efficiency and automation",
    longDescription: "Operations managers leverage AI for process optimization, resource allocation, quality control, and supply chain management. This assessment measures your ability to drive operational excellence with AI.",
    targetAudience: ["Operations Managers", "COOs", "Supply Chain Managers", "Process Improvement Leaders"],
    dimensions: [
      { code: "OAI", name: "Operations AI Integration", description: "Understanding AI in operations management" },
      { code: "PAO", name: "Process Automation & Optimization", description: "AI-driven process improvement" },
      { code: "RAD", name: "Resource Allocation & Decision-making", description: "AI-optimized resource planning" },
      { code: "QCA", name: "Quality Control & Assurance", description: "AI-powered quality monitoring" },
      { code: "SCS", name: "Supply Chain & Scheduling", description: "AI for supply chain optimization" },
      { code: "DAI", name: "Data Analytics & Insights", description: "Using AI for operational analytics" },
      { code: "RCM", name: "Risk & Compliance Management", description: "AI for risk mitigation and compliance" },
      { code: "TIM", name: "Tools & Integration Management", description: "Operations AI platforms and integration" }
    ],
    careerBenefits: [
      "Reduce operational costs with AI automation",
      "Optimize resource allocation and scheduling",
      "Improve quality and reduce defects",
      "Lead digital transformation initiatives"
    ],
    beginnerSlug: "ops-beginner",
    advancedSlug: "ops-advanced"
  },
  {
    slug: "accounting-finance",
    name: "Accounting & Finance Professional",
    icon: Calculator,
    description: "Automate accounting workflows and corporate financial operations with AI",
    longDescription: "Corporate finance and accounting professionals use AI for financial reporting, auditing, fraud detection, budgeting, and regulatory compliance. This assessment evaluates your ability to leverage AI in back-office financial operations and corporate accounting workflows.",
    targetAudience: ["Accountants", "Financial Analysts", "CFOs", "Controllers", "Auditors", "Bookkeepers"],
    dimensions: [
      { code: "AAI", name: "Accounting AI Integration", description: "Understanding AI in accounting and finance" },
      { code: "FAA", name: "Financial Analysis & Automation", description: "AI-powered financial analysis" },
      { code: "ATP", name: "AI Tools & Platforms", description: "Financial AI software and platforms" },
      { code: "ADA", name: "Anomaly Detection & Auditing", description: "AI for fraud detection and auditing" },
      { code: "CRA", name: "Compliance & Regulatory Adherence", description: "AI for regulatory compliance" },
      { code: "EGC", name: "Ethics, Governance & Control", description: "Responsible AI in financial practices" },
      { code: "SAC", name: "Strategic Analysis & Collaboration", description: "AI-driven strategic financial planning" },
      { code: "TAS", name: "Technology Adoption & Security", description: "Secure AI implementation in finance" }
    ],
    careerBenefits: [
      "Automate routine accounting tasks",
      "Detect financial anomalies and fraud faster",
      "Generate accurate forecasts with AI",
      "Lead finance digital transformation"
    ],
    beginnerSlug: "ac-beginner",
    advancedSlug: "ac-advanced"
  },
  {
    slug: "doctors",
    name: "Doctors",
    icon: Stethoscope,
    description: "Enhance clinical practice with AI-powered diagnostics and care",
    longDescription: "Medical professionals leverage AI for diagnostics, treatment planning, patient monitoring, and medical research. This assessment measures your ability to integrate AI into clinical workflows responsibly.",
    targetAudience: ["Physicians", "Surgeons", "Specialists", "Medical Directors"],
    dimensions: [
      { code: "MDA", name: "Medical Diagnostics with AI", description: "AI-assisted diagnostic tools and imaging" },
      { code: "CDM", name: "Clinical Decision-Making", description: "Using AI for treatment recommendations" },
      { code: "PDM", name: "Precision Diagnostics & Medical Imaging", description: "AI in radiology and pathology" },
      { code: "DSA", name: "Data Security & Compliance", description: "HIPAA-compliant AI implementation" },
      { code: "CRD", name: "Clinical Research & Development", description: "AI in medical research and trials" },
      { code: "EGC", name: "Ethics, Governance & Control", description: "Ethical AI use in healthcare" },
      { code: "RAC", name: "Regulatory & Administrative Compliance", description: "Meeting healthcare AI regulations" },
      { code: "TAS", name: "Technology Adoption & Security", description: "Secure medical AI systems" }
    ],
    careerBenefits: [
      "Improve diagnostic accuracy with AI",
      "Personalize treatment plans using data",
      "Stay current with medical AI advances",
      "Lead healthcare innovation initiatives"
    ],
    beginnerSlug: "doc-beginner",
    advancedSlug: "doc-advanced"
  },
  {
    slug: "financial-advisors",
    name: "Wealth & Investment Advisor",
    icon: Landmark,
    description: "Personalize client wealth management and investment strategies with AI insights",
    longDescription: "Wealth managers and investment advisors use AI for portfolio optimization, client profiling, risk assessment, and personalized financial planning. This assessment evaluates your ability to leverage AI in client-facing advisory services and investment management.",
    targetAudience: ["Financial Advisors", "Wealth Managers", "Financial Planners", "Investment Advisors", "Private Bankers"],
    dimensions: [
      { code: "FAI", name: "Financial Advisory AI Integration", description: "Understanding AI in wealth management" },
      { code: "CPA", name: "Client Profiling & Analysis", description: "AI-powered client insights and segmentation" },
      { code: "RIA", name: "Risk & Investment Analysis", description: "AI for portfolio risk assessment" },
      { code: "PFA", name: "Portfolio & Financial Analytics", description: "AI-driven portfolio optimization" },
      { code: "CRE", name: "Client Relationship & Engagement", description: "AI-enhanced client communication" },
      { code: "EGC", name: "Ethics, Governance & Control", description: "Ethical AI in financial advisory" },
      { code: "RAC", name: "Regulatory & Administrative Compliance", description: "Compliance with financial AI regulations" },
      { code: "TAP", name: "Tools & Automation Platforms", description: "FinTech and AI advisory platforms" }
    ],
    careerBenefits: [
      "Personalize advice with AI-driven insights",
      "Optimize portfolios using predictive models",
      "Scale your advisory practice efficiently",
      "Differentiate with cutting-edge AI tools"
    ],
    beginnerSlug: "fa-beginner",
    advancedSlug: "fa-advanced"
  },
  {
    slug: "healthcare-admin",
    name: "Healthcare Administrator",
    icon: Building2,
    description: "Optimize healthcare operations with AI-powered management",
    longDescription: "Healthcare administrators leverage AI for patient flow optimization, resource allocation, financial management, and quality improvement. This assessment measures your ability to lead AI transformation in healthcare settings.",
    targetAudience: ["Hospital Administrators", "Healthcare Managers", "Medical Practice Managers", "Healthcare Operations"],
    dimensions: [
      { code: "HAI", name: "Healthcare AI Integration", description: "Understanding AI in healthcare administration" },
      { code: "OPM", name: "Operations & Patient Management", description: "AI for patient flow and scheduling" },
      { code: "FRM", name: "Financial & Resource Management", description: "AI-optimized resource allocation" },
      { code: "QPS", name: "Quality & Patient Safety", description: "AI for quality monitoring and safety" },
      { code: "WFM", name: "Workforce Management", description: "AI-powered staff scheduling and planning" },
      { code: "EGC", name: "Ethics, Governance & Control", description: "Ethical AI governance in healthcare" },
      { code: "SIM", name: "Systems Integration & Management", description: "Healthcare IT and AI integration" },
      { code: "TAS", name: "Technology Adoption & Security", description: "Secure healthcare AI implementation" }
    ],
    careerBenefits: [
      "Reduce operational costs with AI automation",
      "Improve patient outcomes and satisfaction",
      "Optimize resource utilization",
      "Lead healthcare digital transformation"
    ],
    beginnerSlug: "ha-beginner",
    advancedSlug: "ha-advanced"
  },
  {
    slug: "lawyers",
    name: "Lawyers",
    icon: Scale,
    description: "Transform legal practice with AI-powered research and strategy",
    longDescription: "Legal professionals leverage AI for legal research, document review, contract analysis, and case strategy. This assessment evaluates your ability to use AI throughout the legal workflow while maintaining ethical standards.",
    targetAudience: ["Lawyers", "Attorneys", "Legal Counsel", "Paralegals", "Legal Operations"],
    dimensions: [
      { code: "LAI", name: "Legal AI Integration", description: "Understanding AI applications in law" },
      { code: "PEL", name: "Precedent & E-Discovery with AI", description: "AI-powered legal research and discovery" },
      { code: "CER", name: "Contract Evaluation & Review", description: "AI for contract analysis and review" },
      { code: "IAV", name: "Intelligent Argument & Validation", description: "AI-assisted legal argumentation" },
      { code: "LLC", name: "Legal Literacy & Communication", description: "Using AI for legal writing and briefs" },
      { code: "EGC", name: "Ethics, Governance & Control", description: "Ethical AI use in legal practice" },
      { code: "CSL", name: "Compliance & Statutory Learning", description: "AI for regulatory compliance" },
      { code: "TLS", name: "Technology & Legal Systems", description: "Legal tech platforms and AI tools" }
    ],
    careerBenefits: [
      "Conduct legal research 10x faster",
      "Review contracts and documents efficiently",
      "Improve case strategy with AI insights",
      "Lead law firm innovation initiatives"
    ],
    beginnerSlug: "lawyer-beginner",
    advancedSlug: "lawyer-advanced"
  },
  {
    slug: "management-consultants",
    name: "Management Consultants",
    icon: Briefcase,
    description: "Deliver strategic insights with AI-powered consulting methodologies",
    longDescription: "Management consultants leverage AI for strategic analysis, problem-solving, data-driven recommendations, and client transformation. This assessment measures your ability to integrate AI into consulting engagements.",
    targetAudience: ["Management Consultants", "Strategy Consultants", "Business Consultants", "Consulting Partners"],
    dimensions: [
      { code: "CAI", name: "Consulting AI Integration", description: "Understanding AI in consulting workflows" },
      { code: "STA", name: "Strategic Thinking & Analysis", description: "AI-powered strategic frameworks" },
      { code: "CDA", name: "Client & Data Analysis", description: "Using AI for client insights and analytics" },
      { code: "PIA", name: "Problem-solving & AI-Assisted Research", description: "AI for complex problem-solving" },
      { code: "CMA", name: "Change Management & Adoption", description: "AI-driven change strategies" },
      { code: "DDA", name: "Data-Driven Delivery & Analytics", description: "AI for recommendations and reporting" },
      { code: "EIS", name: "Ethics & Industry Specialization", description: "Responsible AI consulting practices" },
      { code: "CIT", name: "Collaboration & Integration Tools", description: "Consulting AI platforms and tools" }
    ],
    careerBenefits: [
      "Deliver data-driven recommendations faster",
      "Solve complex business problems with AI",
      "Differentiate your consulting practice",
      "Lead client AI transformation projects"
    ],
    beginnerSlug: "mc-beginner",
    advancedSlug: "mc-advanced"
  },
  {
    slug: "teachers",
    name: "Teachers",
    icon: GraduationCap,
    description: "Personalize education with AI-powered teaching strategies",
    longDescription: "Educators leverage AI for personalized learning, assessment automation, content creation, and student engagement. This assessment evaluates your ability to integrate AI into teaching while maintaining pedagogical excellence.",
    targetAudience: ["Teachers", "Educators", "Instructional Designers", "Education Leaders"],
    dimensions: [
      { code: "TAI", name: "Teaching AI Integration", description: "Understanding AI in education" },
      { code: "PLA", name: "Personalized Learning & Adaptation", description: "AI for differentiated instruction" },
      { code: "CAC", name: "Content & Curriculum Creation", description: "AI-assisted lesson planning and materials" },
      { code: "ASF", name: "Assessment & Student Feedback", description: "AI-powered grading and feedback" },
      { code: "SEE", name: "Student Engagement & Experience", description: "Using AI to boost engagement" },
      { code: "DII", name: "Digital Literacy & Innovation", description: "Teaching students about AI" },
      { code: "EPI", name: "Ethics & Professional Integration", description: "Responsible AI use in classrooms" },
      { code: "TLP", name: "Tools & Learning Platforms", description: "EdTech and AI learning platforms" }
    ],
    careerBenefits: [
      "Personalize learning for every student",
      "Automate grading and administrative tasks",
      "Create engaging AI-powered lessons",
      "Prepare students for an AI-driven world"
    ],
    beginnerSlug: "teachers-beginner",
    advancedSlug: "teachers-advanced"
  }
];

export const getRoleBySlug = (slug: string): RoleData | undefined => {
  return professionalRoles.find(role => role.slug === slug);
};
