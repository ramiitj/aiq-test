import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

interface DimensionScore {
  code: string;
  name: string;
  score: number;
  description?: string;
}

// Rich, actionable, specific recommendations based on score ranges
const dimensionGrowthInsights: Record<
  string,
  {
    emerging: string[];
    developing: string[];
    proficient: string[];
    exceptional: string[];
  }
> = {
  SAU: {
    emerging: [
      "Start with fundamentals: Study 3-5 documented case studies of AI implementation in your industry sector. Focus on understanding business requirements, organizational readiness assessment, and capability gaps.",
      "Develop a personal AI strategy checklist: Define which business processes in your domain are suitable for AI (high-volume, standardized tasks) vs. unsuitable (high-stakes decisions, ethical choices).",
      "Practice strategic mapping: For your top 3 business processes, identify AI capabilities needed, organizational readiness gaps, and potential ROI. Use frameworks like SWOT analysis with AI lens.",
      "Learn competitive positioning: Analyze 2-3 competitors' AI strategies, not to copy but to understand how they align AI with their strategic objectives. Document lessons for your context.",
    ],
    developing: [
      "Deepen strategic thinking: Move beyond tactical pilots to strategic positioning. Study how leading organizations (Microsoft, Salesforce, etc.) aligned AI with competitive advantage. Focus on defensible capabilities vs. commoditized features.",
      "Master capability assessment: Conduct organizational readiness evaluation using validated frameworks. Assess technological maturity, talent capability, process readiness, and cultural alignment. Score each dimension 1-5.",
      "Develop strategic roadmaps: Create 3-year AI capability roadmaps specific to your organization. Include capability development stages, organizational learning milestones, and strategic inflection points.",
      "Study organizational transformation: Deep-dive into how AI adoption requires process redesign, role evolution, and cultural shifts. Research organizations that successfully navigated these changes.",
    ],
    proficient: [
      "Master strategic foresight: Study emerging AI capabilities (multimodal reasoning, autonomous action, strategic planning) and their business implications 18-24 months out. Build scenario plans for capability inflection points.",
      "Develop competitive moat strategy: Design AI-enabled competitive advantages that are difficult to replicate - organizational learning systems, proprietary processes, integrated talent-AI collaboration models.",
      "Build organizational learning: Establish systems for continuous capability development - failure analysis, cross-functional knowledge sharing, innovation incubation. Document and scale learnings.",
      "Become a strategic advisor: Lead organizational discussions on AI strategy, competitive positioning, and long-term capability building. Present to executive leadership quarterly.",
    ],
    exceptional: [
      "Contribute to field advancement: Publish case studies or research on AI strategy and organizational transformation. Share learnings at industry conferences or through thought leadership content.",
      "Mentor strategic leaders: Guide peers and junior leaders in developing their AI strategy capabilities. Create internal training programs on strategic AI thinking for management teams.",
      "Explore emerging frontiers: Investigate cutting-edge strategic implications of breakthroughs in reasoning AI, multimodal capabilities, or autonomous systems. How might these reshape your industry?",
      "Shape organizational culture: Champion AI-positive organizational culture transformations. Build institutions, processes, and incentives that reward strategic AI thinking and continuous learning.",
    ],
  },

  PEI: {
    emerging: [
      "Build foundational prompting skills: Practice 50+ prompts across different tasks (summarization, analysis, creative, technical). Document what works and what doesn't. Build a personal prompt template library.",
      "Master prompt anatomy: Study the components of effective prompts - role definition, context, specific instructions, output format, examples. Create templates for your 5 most-used task types.",
      "Learn iterative refinement: When prompts fail, systematically identify what's missing. Collect feedback on 20 failed prompts and analyze patterns. Build refinement skills through deliberate practice.",
      "Study domain-specific prompting: Select one professional domain (finance, healthcare, law). Build specialized prompts for 10-15 tasks specific to that domain. Document domain-specific patterns discovered.",
    ],
    developing: [
      "Master advanced architectures: Study meta-prompting, chain-of-thought prompting, and multi-step reasoning architectures. Implement 5 advanced prompting patterns and document their effectiveness across different tasks.",
      "Develop specialized prompt systems: Create comprehensive prompt libraries for your domain with 20-30 calibrated prompts. Include success metrics, edge cases, and version history.",
      "Practice constraint engineering: Learn to constrain AI exploration space effectively. Design prompts that guide models toward specific reasoning paths while preventing undesired outputs.",
      "Study prompt calibration: Experiment with uncertainty quantification prompts. Learn when prompts should ask for confidence levels, multiple perspectives, or structured reasoning before conclusions.",
    ],
    proficient: [
      "Build prompt optimization frameworks: Develop systematic approaches to prompt testing and optimization. Create A/B testing frameworks, success metrics, and performance baselines for different task categories.",
      "Master domain adaptation: Deeply optimize prompts for your specialization. Build prompt systems with 50+ domain-specific variations, edge case handling, and performance optimization.",
      "Study emerging prompt techniques: Research latest developments in few-shot learning, in-context learning, and prompt engineering research. Experiment with cutting-edge techniques (as published in recent papers).",
      "Develop prompt architecture patterns: Document and formalize prompt patterns for your organization. Create reusable, tested architectures for complex multi-step reasoning, synthesis, and decision-making.",
    ],
    exceptional: [
      "Contribute research: Test novel prompting approaches systematically. Document findings in structured format suitable for publication or conference presentation. Contribute to prompt engineering research community.",
      "Build organizational capability: Create comprehensive prompt engineering training programs and certifications for your organization. Establish best practices, pattern libraries, and continuous improvement systems.",
      "Study frontier techniques: Investigate meta-prompting (AI improving its own prompts), self-improving prompt systems, and theoretical foundations of why prompts work. Explore AI reasoning limitations.",
      "Innovate prompt techniques: Develop novel prompting approaches for your domain. Combine techniques in new ways that others haven't explored. Publish findings and share with community.",
    ],
  },

  CEC: {
    emerging: [
      "Build verification habits: For every AI output you use, practice systematic verification against 2-3 reliable sources. Create a verification checklist: fact-checking, perspective coverage, statistical validity. Do this for 50+ outputs.",
      "Learn bias identification: Study 10 documented examples of AI bias. For each, understand how bias emerged, how it was detected, and what the impact was. Create personal bias detection framework.",
      "Master basic evaluation: Understand key metrics - accuracy, calibration, fairness across groups, robustness to input variation. For 5 AI outputs, attempt to evaluate these dimensions.",
      "Study AI limitations: Read 5-10 technical papers about AI failure modes, hallucinations, and limitations. Document limitation patterns specific to AI models you use regularly.",
    ],
    developing: [
      "Master calibration assessment: Learn statistical calibration evaluation. For 10+ AI probability estimates, test whether predicted probabilities align with actual outcomes. Spot calibration issues systematically.",
      "Deep-dive bias analysis: Study fairness frameworks (individual fairness, group fairness, procedural fairness). For your domain, analyze 3-5 AI systems for potential fairness violations across demographic groups.",
      "Develop evaluation frameworks: Create systematic evaluation frameworks for your domain. Build checklists, metrics, and processes for evaluating new AI systems before deployment.",
      "Learn adversarial robustness: Study adversarial examples and distributional shift. Test 3-5 AI systems with realistic variations of inputs to identify robustness limitations.",
    ],
    proficient: [
      "Build rigorous assessment systems: Develop comprehensive trustworthiness assessment frameworks for your organization. Include calibration testing, fairness auditing, robustness analysis, and documented baselines.",
      "Master statistical evaluation: Deeply understand statistical validity, confidence intervals, and significance testing for AI evaluation. Design proper control groups and evaluation protocols.",
      "Study uncertainty quantification: Learn methods for AI systems to quantify their own uncertainty. Evaluate whether systems provide proper confidence calibration. Implement uncertainty checks in your workflows.",
      "Develop domain benchmarks: Create meaningful benchmarks and evaluation protocols specific to your domain. Establish baselines and continuous monitoring systems for deployed AI solutions.",
    ],
    exceptional: [
      "Contribute to evaluation standards: Publish evaluation frameworks or benchmarks that others in your industry or field can use. Present at conferences on rigorous AI evaluation.",
      "Build evaluation infrastructure: Create comprehensive evaluation infrastructure for your organization - testing frameworks, monitoring dashboards, continuous evaluation systems for all deployed AI.",
      "Research emerging evaluation methods: Study latest research on AI trustworthiness, causal inference in AI evaluation, and novel uncertainty quantification methods. Implement cutting-edge approaches.",
      "Establish evaluation culture: Champion a culture of rigorous AI evaluation in your organization. Establish standards, training programs, and accountability for evaluation quality.",
    ],
  },

  II: {
    emerging: [
      "Map human-AI task allocation: For 5 key business processes, explicitly map which tasks should be AI-driven vs. human-driven. Document the reasoning: AI strengths (speed, pattern recognition, consistency) vs. human strengths (judgment, context, ethics).",
      "Study collaboration models: Research 3-5 documented examples of effective human-AI teams. Understand role definitions, decision authority, quality control, and escalation procedures in each.",
      "Design basic workflows: Create simplified human-AI workflows for 3 routine tasks in your role. Include AI steps, human oversight points, quality checks, and escalation conditions.",
      "Identify integration challenges: Analyze potential risks from task automation. For each, define human oversight points and safeguards. Build simple quality assurance protocols.",
    ],
    developing: [
      "Master workflow design: Design comprehensive human-AI workflows for complex business processes. Include human judgment points, AI-driven steps, quality control checkpoints, and decision escalation.",
      "Study organizational integration: Learn how successful organizations restructured teams around human-AI collaboration. Understand role evolution, skill requirements, and organizational structure changes needed.",
      "Design role transformation: For your team, design how roles evolve with AI integration. Identify skills that become more valuable, skills that become obsolete, and retraining needs.",
      "Develop quality assurance systems: Build quality control frameworks for human-AI collaborative work. Define metrics, auditing processes, and continuous improvement mechanisms.",
    ],
    proficient: [
      "Build integration architectures: Design enterprise-scale human-AI integration architectures. Coordinate AI systems across teams, departments, and processes. Balance centralization and local adaptation.",
      "Master organizational design: Study how leading organizations redesigned for human-AI collaboration. Understand governance structures, decision-making frameworks, and accountability mechanisms.",
      "Develop leadership strategy: Define how leaders should evolve their approach for AI-integrated teams. Create frameworks for managing hybrid human-AI teams, decision-making, and performance evaluation.",
      "Build capability development: Design organizational learning systems for continuous human-AI collaboration skill development. Create training programs, communities of practice, and knowledge sharing systems.",
    ],
    exceptional: [
      "Contribute organizational design innovation: Document novel human-AI organizational designs your company pioneers. Publish findings or speak at industry forums about your integration innovations.",
      "Build enterprise systems: Create comprehensive systems and processes for organization-wide human-AI integration. Set standards, establish governance, and maintain continuous optimization.",
      "Research integration models: Study frontier models of human-AI collaboration. Explore emerging patterns like self-managing AI teams, fully autonomous systems with human oversight, and distributed decision-making.",
      "Shape industry practices: Contribute to industry-wide standards and best practices for human-AI collaboration. Mentor peers across organizations in effective integration approaches.",
    ],
  },

  ALC: {
    emerging: [
      "Establish learning documentation: Start systematically documenting AI interactions - what worked, what failed, what you learned. Maintain a simple log of 20+ AI experiments with outcomes and insights.",
      "Create failure analysis practice: When AI interactions fail, deliberately analyze why. Document patterns in failures - prompt issues, misunderstandings, capability limitations. Build learning from failures.",
      "Share learnings informally: In team meetings or conversations, share 1-2 lessons you've learned from AI work weekly. Get feedback and build culture of learning from AI experiences.",
      "Start systematic experimentation: Design simple experiments to test AI capabilities or prompting approaches. Document hypotheses, tests, results, and conclusions. Do this for 10+ experiments.",
    ],
    developing: [
      "Build organizational learning systems: Create formal systems for capturing and sharing AI learnings across teams. Establish knowledge repositories, regular sharing forums, and documented best practices.",
      "Develop capability tracking: Establish metrics to track your organization's AI capability progression - skills developed, processes transformed, value created. Create capability maturity assessments.",
      "Master failure analysis: Create structured failure analysis processes - root cause analysis, systemic learning, pattern identification. Apply to 10+ significant AI implementation failures or learnings.",
      "Foster cross-team learning: Build communities of practice for AI learners. Facilitate regular knowledge-sharing sessions, document collective learnings, and establish mentorship pairs.",
    ],
    proficient: [
      "Build learning infrastructure: Create comprehensive organizational learning infrastructure - knowledge management systems, training programs, continuous capability assessment, and innovation incubation.",
      "Develop strategic foresight: Establish processes to anticipate future AI capability changes and their implications. Create scenario planning, skill gap analysis, and proactive capability development strategies.",
      "Create learning culture: Champion organizational culture that values learning, experimentation, and continuous improvement. Establish incentives for sharing knowledge and learning from failures.",
      "Design capability evolution paths: Create clear progression paths for AI skill development. Define stages (beginner to expert), required competencies, and development activities for each.",
    ],
    exceptional: [
      "Contribute thought leadership: Share organizational learning systems and approaches through publications, conferences, or industry forums. Establish your organization as a learning leader.",
      "Build field innovations: Contribute to industry understanding of organizational AI learning. Document novel approaches, patterns, or frameworks that advance the field.",
      "Mentor ecosystem: Help other organizations and leaders build their learning systems. Create training or consulting offerings based on your approaches.",
      "Research learning dynamics: Study how organizations learn differently with AI. Research factors that accelerate or inhibit organizational learning with AI technologies.",
    ],
  },

  EJC: {
    emerging: [
      "Study ethical frameworks: Read foundational ethics literature on fairness, transparency, accountability. Understand different ethical perspectives: consequentialist, deontological, virtue ethics in AI context.",
      "Practice ethical assessment: For 5 AI systems you use, conduct ethical impact assessments - who benefits, who might be harmed, what fairness concerns exist, what transparency is needed.",
      "Learn stakeholder mapping: For your key business processes, map affected stakeholders. Understand whose interests might be impacted by AI decisions and how.",
      "Establish ethical guidelines: Develop preliminary ethical guidelines for AI use in your domain. Document values, principles, and decision-making approaches for ethical AI use.",
    ],
    developing: [
      "Master fairness analysis: Deeply understand different fairness definitions and their trade-offs. Conduct fairness audits of 3+ AI systems for potential discrimination across demographic groups.",
      "Develop governance frameworks: Create formal AI governance frameworks with clear accountability, oversight mechanisms, and ethical review processes. Establish ethics review boards or committees.",
      "Study organizational ethics: Research how ethical AI governance works in different organizational contexts. Understand decision-making structures, accountability chains, and escalation procedures.",
      "Create ethical implementation systems: Design systems to ensure ethical AI deployment - assessment protocols, approval processes, monitoring, and incident response procedures.",
    ],
    proficient: [
      "Build ethical infrastructure: Establish comprehensive ethical AI governance infrastructure across your organization. Create ethics review processes, assessment frameworks, and continuous monitoring systems.",
      "Master complex tradeoffs: Navigate complex ethical trade-offs like fairness vs. performance, transparency vs. competitive advantage, individual vs. group fairness. Develop principled decision frameworks.",
      "Develop ethical leadership: Guide organizational leadership on ethical AI decision-making. Create frameworks for discussing ethical dilemmas and making difficult calls.",
      "Build ethical culture: Foster organizational culture that prioritizes ethical AI. Establish standards, training, and accountability for ethical decision-making across all levels.",
    ],
    exceptional: [
      "Contribute ethical standards: Help define industry standards or best practices for ethical AI governance. Contribute to professional or regulatory discussions on AI ethics.",
      "Research ethics innovations: Advance understanding of how organizations can implement ethical AI effectively. Document novel approaches, frameworks, or governance models.",
      "Build ethical thought leadership: Publish on ethical AI topics, speak at industry forums, mentor peers on ethical decision-making. Establish credibility as ethical AI leader.",
      "Shape regulatory landscape: Engage with regulatory bodies, industry groups, or policy discussions on AI ethics. Help shape responsible AI governance at industry or policy level.",
    ],
  },

  CS: {
    emerging: [
      "Study contextual factors: For your key business domains, document critical contextual factors - regulatory environment, competitive dynamics, organizational culture, technological infrastructure.",
      "Research market differences: Analyze 3 different markets/regions your organization operates in. Document how regulatory, cultural, and business context differs. Understand implications for AI strategy.",
      "Map adaptation needs: For 2-3 AI strategies or approaches, identify what customization is needed across different contexts. Document context-specific variations required.",
      "Learn organizational readiness: Understand your organization's change capacity and AI maturity. Identify organizational factors that will affect AI implementation success.",
    ],
    developing: [
      "Master regulatory intelligence: Deep-dive into regulatory environments relevant to your work. Understand how GDPR, sector-specific regulations, or local requirements affect AI implementation.",
      "Develop cultural intelligence: Study how organizational and national cultures affect AI adoption. Understand communication styles, decision-making preferences, and change readiness across contexts.",
      "Design context-specific strategies: For major markets or business units, develop AI strategies customized to context. Identify local factors that require strategy adjustment.",
      "Build implementation flexibility: Create frameworks that allow strategy adaptation across contexts while maintaining core principles and standards.",
    ],
    proficient: [
      "Build geopolitical strategy: For global operations, develop comprehensive geopolitical AI strategies. Account for regulatory divergence, competitive dynamics, data sovereignty, and market differences.",
      "Master local adaptation: Develop deep expertise in adapting AI strategies across different geographic and business contexts. Become expert on regional factors affecting success.",
      "Create context intelligence systems: Build systems for continuous monitoring of regulatory, competitive, and cultural changes across your markets. Establish early warning systems for strategy adjustments.",
      "Develop contextualized governance: Create AI governance frameworks that maintain ethical and operational standards while allowing appropriate local adaptation.",
    ],
    exceptional: [
      "Contribute regulatory expertise: Help shape regulatory discussions or contribute to industry standards in your domain. Share expertise on how context affects AI governance.",
      "Research context effects: Study how contextual factors affect AI strategy effectiveness. Document findings on organizational culture, regulations, competitive dynamics impact on outcomes.",
      "Build institutional knowledge: Create comprehensive systems documenting context effects on AI strategy. Build organizational knowledge base of what works in different contexts.",
      "Mentor context expertise: Guide peers on developing context-specific AI strategies. Help others understand how to adapt approaches across diverse operational environments.",
    ],
  },

  CRS: {
    emerging: [
      "Explore AI capabilities: Systematically explore what AI can do beyond routine optimization - creative problem-solving, strategic synthesis, cross-domain pattern recognition. Experiment with 20+ exploratory prompts.",
      "Study innovation cases: Research 5-10 cases where AI enabled new business models or approaches rather than incremental improvements. Understand what made these innovations possible.",
      "Practice ideation: Use AI for ideation on 5 strategic challenges in your domain. Capture how AI generates novel possibilities you hadn't considered. Document surprising insights.",
      "Build innovation vocabulary: Learn how leading organizations talk about AI-enabled innovation. Understand concepts like disruption, business model innovation, capability shifts, and strategic inflection.",
    ],
    developing: [
      "Master value creation shifts: Analyze how AI changes value creation mechanisms in your industry. Identify opportunities to enable previously impossible approaches or business models.",
      "Design innovation experiments: Create structured innovation projects using AI. Develop 3-5 experiments to explore how AI could enable new revenue streams, business models, or competitive positioning.",
      "Study cross-domain transfer: Research how solutions or patterns from other domains might apply to your industry. Practice cross-domain analogy and pattern transfer.",
      "Develop innovation frameworks: Create frameworks for identifying and evaluating AI-enabled innovation opportunities. Establish evaluation criteria and decision processes.",
    ],
    proficient: [
      "Build innovation strategy: Develop strategic innovation roadmaps that leverage emerging AI capabilities. Identify multi-year opportunities where AI enables new business models or competitive advantages.",
      "Master capability inflection points: Become expert at recognizing when AI capabilities reach inflection points that enable new possibilities. Anticipate implications and develop response strategies.",
      "Drive organizational innovation: Lead innovation initiatives using AI. Create processes for ideation, experimentation, evaluation, and implementation of AI-enabled innovations.",
      "Build innovation culture: Foster organizational culture that embraces AI-enabled innovation. Establish processes, incentives, and governance for systematic innovation.",
    ],
    exceptional: [
      "Contribute innovation thinking: Publish on AI-enabled innovation opportunities in your domain. Share frameworks or case studies that advance field thinking on AI innovation.",
      "Research emerging possibilities: Study frontier AI capabilities and their innovation implications. Anticipate next-generation possibilities and help organization prepare.",
      "Build innovation ecosystem: Create platforms or programs that enable wider innovation ecosystem - partnerships, startups, research collaborations exploring AI possibilities.",
      "Shape industry transformation: Guide industry discussions on AI-enabled innovation and transformation. Help shape how your industry evolves with advanced AI capabilities.",
    ],
  },
};

interface DimensionScore {
  code: string;
  name: string;
  score: number;
  description?: string;
}

export async function generatePDFReport(
  overallScore: number,
  dimensionScores: DimensionScore[],
  verificationCode: string,
  issueDate: Date,
  expiryDate: Date,
  userEmail?: string,
  testDurationSeconds?: number,
  assessmentLevel?: string
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - 2 * margin;

  // Brand colors
  const colors = {
    primaryBlue: [30, 58, 138] as [number, number, number],
    accentBlue: [37, 99, 235] as [number, number, number],
    darkBlue: [15, 23, 42] as [number, number, number],
    lightGray: [243, 244, 246] as [number, number, number],
    mediumGray: [107, 114, 128] as [number, number, number],
    darkText: [17, 24, 39] as [number, number, number],
    green: [34, 197, 94] as [number, number, number],
    orange: [251, 146, 60] as [number, number, number],
    red: [239, 68, 68] as [number, number, number],
  };

  // Utility functions
  const getProficiencyLevel = (score: number): string => {
    if (score >= 80) return "Exceptional";
    if (score >= 60) return "Proficient";
    if (score >= 40) return "Developing";
    return "Emerging";
  };

  const getLevelColor = (score: number): [number, number, number] => {
    if (score >= 80) return colors.green;
    if (score >= 60) return colors.accentBlue;
    if (score >= 40) return colors.orange;
    return colors.red;
  };

  const getProficiencyKey = (score: number): "exceptional" | "proficient" | "developing" | "emerging" => {
    if (score >= 80) return "exceptional";
    if (score >= 60) return "proficient";
    if (score >= 40) return "developing";
    return "emerging";
  };

  const addPageNumber = (pageNum: number, totalPages: number) => {
    doc.setFontSize(8);
    doc.setTextColor(...colors.mediumGray);
    doc.text(
      `Page ${pageNum} of ${totalPages}`,
      pageWidth - margin - 5,
      pageHeight - 10,
      { align: "right" }
    );
  };

  const addFooter = () => {
    doc.setDrawColor(...colors.lightGray);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 22, pageWidth - margin, pageHeight - 22);
    doc.setFontSize(7);
    doc.setTextColor(...colors.mediumGray);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Research by Venkat Ram Reddy Ganuthula & Krishna Kumar Balaraman",
      pageWidth / 2,
      pageHeight - 16,
      { align: "center" }
    );
    doc.text(
      "School of Management and Entrepreneurship, IIT Jodhpur",
      pageWidth / 2,
      pageHeight - 12,
      { align: "center" }
    );
  };

  // ========== PAGE 1: RESULTS SUMMARY ==========
  let currentY = 0;

  // Header with gradient effect simulation
  doc.setFillColor(...colors.primaryBlue);
  doc.rect(0, 0, pageWidth, 55, "F");

  // Title and subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("AIQ Assessment", pageWidth / 2, 18, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Certificate of Completion", pageWidth / 2, 28, { align: "center" });

  doc.setFontSize(9);
  doc.text(
    `Assessment Level: ${assessmentLevel || "Professional"}`,
    pageWidth / 2,
    35,
    { align: "center" }
  );
  doc.text(`Verification: ${verificationCode}`, pageWidth / 2, 42, {
    align: "center",
  });

  currentY = 65;

  // User information
  if (userEmail) {
    doc.setTextColor(...colors.darkText);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(userEmail, pageWidth / 2, currentY, { align: "center" });
    currentY += 12;
  }

  // Date and duration information
  doc.setTextColor(...colors.mediumGray);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const issueDateStr = issueDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const expiryDateStr = expiryDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  doc.text(`Issued: ${issueDateStr}`, margin, currentY);
  doc.text(`Valid Until: ${expiryDateStr}`, pageWidth - margin, currentY, {
    align: "right",
  });
  currentY += 7;

  if (testDurationSeconds) {
    const minutes = Math.floor(testDurationSeconds / 60);
    const seconds = testDurationSeconds % 60;
    doc.text(`Test Duration: ${minutes}m ${seconds}s`, pageWidth / 2, currentY, {
      align: "center",
    });
    currentY += 8;
  }

  // Overall Score - prominent circle
  currentY += 8;
  const centerX = pageWidth / 2;
  const scoreCircleRadius = 28;
  const scoreCircleY = currentY + scoreCircleRadius;

  // Outer circle border
  doc.setDrawColor(...colors.accentBlue);
  doc.setLineWidth(3);
  doc.circle(centerX, scoreCircleY, scoreCircleRadius, "S");

  // Inner filled circle background
  doc.setFillColor(...colors.accentBlue);
  doc.circle(centerX, scoreCircleY, scoreCircleRadius - 2, "F");

  // Score text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(48);
  doc.setFont("helvetica", "bold");
  doc.text(overallScore.toFixed(1), centerX, scoreCircleY - 3, {
    align: "center",
    baseline: "middle",
  });

  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.text("AIQ Score", centerX, scoreCircleY + 12, {
    align: "center",
    baseline: "middle",
  });

  currentY = scoreCircleY + scoreCircleRadius + 15;

  // Proficiency level badge
  const level = getProficiencyLevel(overallScore);
  const levelColor = getLevelColor(overallScore);
  const levelText = `${level} AI Collaborator`;
  const levelWidth = doc.getTextWidth(levelText) * 1.5;

  doc.setFillColor(...levelColor);
  doc.roundedRect(centerX - levelWidth / 2, currentY - 6, levelWidth, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(levelText, centerX, currentY, {
    align: "center",
    baseline: "middle",
  });

  // Interpretation
  currentY += 18;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.mediumGray);

  const interpretation = `Your score represents ${level.toLowerCase()} proficiency in AI collaboration across eight research-validated dimensions. Results reflect adaptive testing with Item Response Theory (IRT) for precise measurement of your AI collaboration capabilities.`;
  const interpretationLines = doc.splitTextToSize(interpretation, contentWidth - 10);
  doc.text(interpretationLines, centerX, currentY, {
    align: "center",
    maxWidth: contentWidth - 10,
  });

  // Top 3 Strengths
  currentY += 20;
  const sortedDimensions = [...dimensionScores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("Your Top Strengths", margin, currentY);
  currentY += 8;

  sortedDimensions.forEach((dim, idx) => {
    // Background box
    doc.setFillColor(...colors.lightGray);
    doc.roundedRect(margin, currentY - 2, contentWidth, 9, 1, 1, "F");

    // Number and name
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.darkText);
    doc.text(`${idx + 1}. ${dim.name}`, margin + 3, currentY + 3);

    // Score
    doc.setTextColor(...colors.accentBlue);
    doc.text(dim.score.toFixed(1), pageWidth - margin - 3, currentY + 3, {
      align: "right",
    });

    currentY += 11;
  });

  addFooter();
  addPageNumber(1, 5);

  // ========== PAGE 2: DIMENSION BREAKDOWN & PERFORMANCE ==========
  doc.addPage();
  currentY = 20;

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("Dimension Breakdown", margin, currentY);

  currentY += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.mediumGray);
  doc.text("Detailed performance across all eight AI collaboration dimensions", margin, currentY);

  // Dimension scores table
  currentY += 12;
  const tableData = dimensionScores.map((dim) => [
    dim.name,
    dim.score.toFixed(1),
    getProficiencyLevel(dim.score),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["Dimension", "Score", "Proficiency"]],
    body: tableData,
    theme: "plain",
    headStyles: {
      fillColor: colors.primaryBlue,
      fontStyle: "bold",
      fontSize: 10,
      textColor: [255, 255, 255],
      padding: 4,
      halign: "left",
    },
    bodyStyles: {
      fontSize: 9,
      padding: 4,
      textColor: colors.darkText,
    },
    alternateRowStyles: {
      fillColor: colors.lightGray,
    },
    columnStyles: {
      0: { cellWidth: 85, halign: "left" },
      1: { cellWidth: 25, halign: "center", fontStyle: "bold", textColor: colors.accentBlue },
      2: { cellWidth: 50, halign: "center" },
    },
    margin: { left: margin, right: margin },
    tableWidth: contentWidth,
  });

  // Visual performance overview
  currentY = (doc as any).lastAutoTable.finalY + 12;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("Visual Performance Overview", margin, currentY);

  currentY += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.mediumGray);
  doc.text("Your performance visualized across all dimensions", margin, currentY);

  currentY += 8;
  const barMaxWidth = contentWidth - 50;

  dimensionScores.forEach((dim) => {
    // Dimension name
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.darkText);
    const dimNameShort = dim.name.length > 30 ? dim.name.substring(0, 27) + "..." : dim.name;
    doc.text(dimNameShort, margin, currentY + 2);

    // Background bar
    doc.setFillColor(...colors.lightGray);
    doc.rect(margin, currentY + 4, barMaxWidth, 6, "F");

    // Score bar
    const barWidth = (dim.score / 100) * barMaxWidth;
    const barColor = getLevelColor(dim.score);
    doc.setFillColor(...barColor);
    if (barWidth > 0) {
      doc.rect(margin, currentY + 4, barWidth, 6, "F");
    }

    // Score text
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...barColor);
    doc.text(dim.score.toFixed(1), pageWidth - margin - 8, currentY + 6);

    currentY += 9;
  });

  addFooter();
  addPageNumber(2, 5);

  // ========== PAGE 3: RESEARCH VALIDATION ==========
  doc.addPage();
  currentY = 20;

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("Research & Validation", margin, currentY);

  currentY += 12;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.darkText);
  doc.text("Assessment Methodology", margin, currentY);

  currentY += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.mediumGray);

  const methodologyText =
    "The AIQ Assessment employs Item Response Theory (IRT) with adaptive testing across 400+ calibrated items. This enables:\n\n" +
    "• Eight validated dimensions covering AI collaboration competencies\n" +
    "• Adaptive difficulty selection based on response patterns\n" +
    "• Item discrimination parameters: 0.44 to 0.79\n" +
    "• Three-level proficiency calibration\n" +
    "• Comprehensive psychometric validation\n" +
    "• Precise ability estimation through computer adaptive testing";

  const methodLines = doc.splitTextToSize(methodologyText, contentWidth);
  doc.text(methodLines, margin, currentY);

  currentY += 48;

  // Certificate verification section
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin - 2, currentY - 3, contentWidth + 4, 50, 2, 2, "F");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("Certificate Verification", margin + 3, currentY + 2);

  // QR Code
  const verificationUrl = `https://aiq.works/verify/${verificationCode}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 200,
    margin: 1,
    color: {
      dark: "#1e3a8a",
      light: "#ffffff",
    },
  });

  doc.addImage(qrDataUrl, "PNG", margin + 2, currentY + 8, 30, 30);

  // Verification details
  const qrTextX = margin + 35;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.mediumGray);
  doc.text("Code:", qrTextX, currentY + 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...colors.primaryBlue);
  const codeLines = doc.splitTextToSize(verificationCode, 45);
  doc.text(codeLines, qrTextX, currentY + 15);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.mediumGray);
  doc.setFontSize(8);
  doc.text("Visit: aiq.works/verify", qrTextX, currentY + 30);

  currentY += 55;

  // Important notice
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("Important Notice", margin, currentY);

  currentY += 6;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.mediumGray);

  const noticeText =
    "This certificate measures AI collaboration capabilities at assessment time. Results are valid for twelve months. For verification, visit the URL above with your verification code.";
  const noticeLines = doc.splitTextToSize(noticeText, contentWidth - 5);
  doc.text(noticeLines, margin, currentY);

  addFooter();
  addPageNumber(3, 5);

  // ========== PAGE 4 & 5: PERSONALIZED GROWTH PATHS (One per dimension below proficiency) ==========
  const developmentDimensions = dimensionScores
    .filter((d) => d.score < 80)
    .sort((a, b) => a.score - b.score);

  developmentDimensions.forEach((dim, dimIdx) => {
    doc.addPage();
    currentY = 20;

    const profKey = getProficiencyKey(dim.score);
    const recommendations = dimensionGrowthInsights[dim.code]?.[profKey] || [];

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primaryBlue);
    doc.text(`${dim.name}`, margin, currentY);

    currentY += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.mediumGray);
    doc.text(`Current Score: ${dim.score.toFixed(1)} (${getProficiencyLevel(dim.score)})`, margin, currentY);

    currentY += 10;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.darkText);
    doc.text("Your Growth Recommendations", margin, currentY);

    currentY += 8;

    // Display 4 specific, actionable recommendations with proper wrapping
    recommendations.forEach((rec, recIdx) => {
      // Box background
      const estimatedHeight = 18;
      doc.setFillColor(...colors.lightGray);
      doc.roundedRect(margin - 1, currentY - 1, contentWidth + 2, estimatedHeight, 2, 2, "F");

      // Recommendation number and title
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...colors.primaryBlue);
      const recLines = doc.splitTextToSize(`${recIdx + 1}. ${rec}`, contentWidth - 8);

      doc.text(recLines, margin + 2, currentY + 2, {
        maxWidth: contentWidth - 4,
      });

      const lineCount = recLines.length;
      currentY += 2 + lineCount * 5 + 3;

      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = 20;
      }
    });

    // Progress section
    currentY += 5;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primaryBlue);
    doc.text("Implementation Timeline", margin, currentY);

    currentY += 7;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.mediumGray);

    const timeline = [
      "Weeks 1-2: Select first 2 recommendations. Commit 3-4 hours per week.",
      "Weeks 3-4: Implement initial learnings. Document what you're learning.",
      "Weeks 5-8: Deepen practice. Apply learnings to real tasks in your role.",
      "Weeks 9-12: Consolidate learning. Support others in similar development.",
      "Month 4+: Retake assessment to measure progress and identify next growth areas.",
    ];

    timeline.forEach((item, idx) => {
      doc.setFontSize(8);
      doc.setTextColor(...colors.darkText);
      const itemLines = doc.splitTextToSize(item, contentWidth - 5);
      doc.text(itemLines, margin + 2, currentY);
      currentY += 4.5;
    });

    addFooter();
    addPageNumber(4 + dimIdx, 5);
  });

  // Return PDF blob
  return doc.output("blob");
}