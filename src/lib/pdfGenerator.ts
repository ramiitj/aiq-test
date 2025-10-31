import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

interface DimensionScore {
  code: string;
  name: string;
  score: number;
  description?: string;
}

// Dimension full names mapping
const dimensionNames: Record<string, string> = {
  SAU: "Strategic AI Understanding",
  PEI: "Prompt Engineering & Interaction",
  CEC: "Critical Evaluation & Calibration",
  II: "Intelligent Task Integration",
  ALC: "Adaptive Learning & Capability",
  EJC: "Ethical Judgment & Usage",
  CS: "Context Sensitivity",
  CRS: "Creative Synthesis"
};

// BEGINNER Level Recommendations
const beginnerRecommendations: Record<string, string[]> = {
  SAU: [
    "Study how companies use AI for business decisions",
    "Learn about AI strengths and limitations in your field",
    "Read case studies of AI implementation successes and failures"
  ],
  PEI: [
    "Practice writing clear, specific prompts for AI tools",
    "Experiment with different question formats to improve responses",
    "Keep a notebook of prompts that work well for your tasks"
  ],
  CEC: [
    "Always verify AI outputs against reliable sources",
    "Learn to spot common AI errors like hallucinations",
    "Check if AI responses consider diverse perspectives"
  ],
  II: [
    "Identify routine tasks in your work suitable for AI assistance",
    "Practice breaking down complex tasks into AI-manageable steps",
    "Create simple checklists to verify AI-assisted work"
  ],
  ALC: [
    "Document what you learn from each AI interaction",
    "Share your AI learnings with teammates regularly",
    "Build a personal reference guide of AI tips and tricks"
  ],
  EJC: [
    "Learn the basics of fairness and bias in AI systems",
    "Know when and how to disclose AI involvement in your work",
    "Study ethical AI use guidelines in your organization"
  ],
  CS: [
    "Understand that AI behaves differently across contexts",
    "Learn basic AI regulations affecting your industry",
    "Adapt your AI approach based on your work environment"
  ],
  CRS: [
    "Use AI as a brainstorming partner for new ideas",
    "Explore how AI can help solve problems creatively",
    "Experiment with AI for generating multiple solution options"
  ]
};

// PROFESSIONAL Level Recommendations
const professionalRecommendations: Record<string, string[]> = {
  SAU: [
    "Analyze industry AI adoption patterns and competitive positioning",
    "Build 12-18 month AI capability roadmaps aligned with business strategy",
    "Assess and document organizational readiness using maturity frameworks"
  ],
  PEI: [
    "Master advanced techniques: meta-prompting, chain-of-thought, constraint engineering",
    "Build domain-specific prompt libraries with 20+ tested variations",
    "Establish systematic prompt optimization and A/B testing processes"
  ],
  CEC: [
    "Conduct fairness audits across demographic groups for AI outputs",
    "Implement comprehensive verification protocols with clear criteria",
    "Study and apply uncertainty quantification in decision-making"
  ],
  II: [
    "Design workflows that optimize human-AI complementary strengths",
    "Develop role evolution strategies for AI-integrated teams",
    "Establish governance frameworks for human-AI collaboration quality"
  ],
  ALC: [
    "Build organizational learning systems to scale AI capabilities",
    "Create cross-functional knowledge-sharing forums and practices",
    "Implement capability maturity tracking with defined milestones"
  ],
  EJC: [
    "Develop enterprise-wide AI ethics governance frameworks",
    "Create stakeholder impact assessment protocols and review cycles",
    "Design fairness-capability trade-off matrices for decision support"
  ],
  CS: [
    "Develop context-specific AI strategies for different markets/regions",
    "Design implementation approaches accounting for regulatory variance",
    "Build cultural intelligence frameworks for global AI deployment"
  ],
  CRS: [
    "Identify AI capability inflection points for business model innovation",
    "Design cross-domain pattern transfer strategies for competitive advantage",
    "Build strategic foresight processes for AI-enabled market shifts"
  ]
};

// EXPERT Level Recommendations
const expertRecommendations: Record<string, string[]> = {
  SAU: [
    "Publish research on AI strategic positioning and competitive dynamics",
    "Mentor industry peers on enterprise AI governance and transformation",
    "Contribute to standards development for responsible AI strategy"
  ],
  PEI: [
    "Conduct and publish novel prompting research advancing the field",
    "Design organizational prompt engineering certification programs",
    "Develop frameworks for AI reasoning architecture optimization"
  ],
  CEC: [
    "Research and publish AI trustworthiness assessment innovations",
    "Lead contributions to industry standards for AI evaluation",
    "Build enterprise evaluation infrastructure and governance models"
  ],
  II: [
    "Publish research on human-AI organizational design innovations",
    "Lead industry-wide discussions on responsible AI integration",
    "Contribute to regulatory frameworks shaping AI governance policy"
  ],
  ALC: [
    "Research organizational learning dynamics in AI-augmented systems",
    "Publish thought leadership on AI-driven culture transformation",
    "Develop field-advancing learning infrastructure and models"
  ],
  EJC: [
    "Contribute actively to AI ethics standards and policy discussions",
    "Publish research on effective ethical AI governance mechanisms",
    "Shape regulatory landscape through participation in policy forums"
  ],
  CS: [
    "Research and publish on context effects in AI strategy outcomes",
    "Contribute to geopolitical AI policy and framework discussions",
    "Mentor ecosystem leaders on context-sensitive AI deployment"
  ],
  CRS: [
    "Research AI-enabled business model discontinuities and patterns",
    "Publish frameworks on innovation leveraging emerging AI capabilities",
    "Shape industry understanding of AI transformation possibilities"
  ]
};

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
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  // Brand colors
  const colors = {
    primaryBlue: [30, 58, 138] as [number, number, number],
    accentBlue: [59, 130, 246] as [number, number, number],
    darkBlue: [15, 23, 42] as [number, number, number],
    lightGray: [243, 244, 246] as [number, number, number],
    mediumGray: [107, 114, 128] as [number, number, number],
    darkText: [17, 24, 39] as [number, number, number],
    green: [34, 197, 94] as [number, number, number],
    orange: [251, 146, 60] as [number, number, number],
    red: [239, 68, 68] as [number, number, number],
  };

  // Determine level type for recommendations
  const levelType = assessmentLevel?.toLowerCase() === "beginner" 
    ? "beginner" 
    : assessmentLevel?.toLowerCase() === "expert" 
    ? "expert" 
    : "professional";

  const getRecommendations = (code: string): string[] => {
    if (levelType === "beginner") {
      return beginnerRecommendations[code] || [];
    } else if (levelType === "expert") {
      return expertRecommendations[code] || [];
    } else {
      return professionalRecommendations[code] || [];
    }
  };

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

  const addFooter = () => {
    doc.setFontSize(6.5);
    doc.setTextColor(...colors.mediumGray);
    doc.text(
      "Research by Venkat Ram Reddy Ganuthula & Krishna Kumar Balaraman | IIT Jodhpur",
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" }
    );
  };

  const addPageNumber = (pageNum: number, totalPages: number) => {
    doc.setFontSize(8);
    doc.setTextColor(...colors.mediumGray);
    doc.text(
      `${pageNum}/${totalPages}`,
      pageWidth - margin - 5,
      pageHeight - 8,
      { align: "right" }
    );
  };

  // ========== PAGE 1: HEADER + SCORE + COMPACT TABLE + VISUAL CHART ==========
  let currentY = 0;

  // Header
  doc.setFillColor(...colors.primaryBlue);
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("AIQ Assessment Certificate", pageWidth / 2, 13, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${assessmentLevel || "Professional"} Level`, pageWidth / 2, 21, { align: "center" });

  doc.setFontSize(7.5);
  doc.setTextColor(220, 220, 220);
  const issueDateStr = issueDate.toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "short", 
    day: "numeric" 
  });
  doc.text(`Issued: ${issueDateStr} | Code: ${verificationCode}`, pageWidth / 2, 28, { align: "center" });

  currentY = 43;

  // Overall Score - centered
  const centerX = pageWidth / 2;
  
  // Score circle
  doc.setLineWidth(3);
  const scoreColor = getLevelColor(overallScore);
  doc.setDrawColor(...scoreColor);
  doc.circle(centerX, currentY, 18, "D");

  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...scoreColor);
  doc.text(overallScore.toFixed(1), centerX, currentY + 2, { 
    align: "center", 
    baseline: "middle" 
  });

  currentY += 23;

  // Level badge
  const level = getProficiencyLevel(overallScore);
  doc.setFillColor(...scoreColor);
  const badgeWidth = 60;
  doc.roundedRect(centerX - badgeWidth / 2, currentY - 4, badgeWidth, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(level, centerX, currentY + 1, { align: "center", baseline: "middle" });

  currentY += 15;

  // Performance Summary
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("Performance Summary", margin, currentY);

  currentY += 8;

  // Compact performance table
  const perfData = dimensionScores.map((dim) => {
    const fullName = dimensionNames[dim.code] || dim.name;
    return [
      fullName,
      dim.score.toFixed(1),
      getProficiencyLevel(dim.score),
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [["Dimension", "Score", "Level"]],
    body: perfData,
    theme: "striped",
    headStyles: {
      fillColor: colors.primaryBlue,
      fontStyle: "bold",
      fontSize: 8,
      textColor: [255, 255, 255],
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: colors.darkText,
      cellPadding: 1.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 90, halign: "left" },
      1: { cellWidth: 25, halign: "center", fontStyle: "bold" },
      2: { cellWidth: 35, halign: "center" },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Performance Visualization
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("Performance Visualization", margin, currentY);

  currentY += 7;

  // Clean horizontal bar chart
  const barMaxWidth = contentWidth - 55;
  const barHeight = 6;
  const barSpacing = 9;

  dimensionScores.forEach((dim) => {
    const fullName = dimensionNames[dim.code] || dim.name;
    
    // Dimension label
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.darkText);
    const label = fullName.length > 25 ? fullName.substring(0, 22) + "..." : fullName;
    doc.text(label, margin, currentY + 3.5);

    // Background bar
    doc.setFillColor(235, 235, 235);
    doc.roundedRect(margin + 52, currentY, barMaxWidth, barHeight, 1, 1, "F");

    // Score bar with color
    const scoreWidth = (dim.score / 100) * barMaxWidth;
    const barColor = getLevelColor(dim.score);
    doc.setFillColor(...barColor);
    if (scoreWidth > 0) {
      doc.roundedRect(margin + 52, currentY, scoreWidth, barHeight, 1, 1, "F");
    }

    // Score text
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...barColor);
    doc.text(
      `${dim.score.toFixed(1)}`, 
      pageWidth - margin - 3, 
      currentY + 3.5
    );

    currentY += barSpacing;
  });

  addFooter();
  addPageNumber(1, 2);

  // ========== PAGE 2: GROWTH RECOMMENDATIONS + VERIFICATION ==========
  doc.addPage();
  currentY = 15;

  // Section header
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("Personalized Growth Recommendations", margin, currentY);

  currentY += 7;

  // Level-specific subtitle
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.mediumGray);
  
  let levelDesc = "";
  if (levelType === "beginner") {
    levelDesc = "Foundational learning paths to build core AI collaboration skills";
  } else if (levelType === "expert") {
    levelDesc = "Advanced pathways for thought leadership and field-advancing contributions";
  } else {
    levelDesc = "Strategic development priorities for professional AI capability advancement";
  }
  doc.text(levelDesc, margin, currentY);

  currentY += 8;

  // CRITICAL FIX: Show ALL dimensions, not just those with score < 80
  // Sort by score (lowest first) to prioritize areas needing most improvement
  const allDimsSorted = [...dimensionScores].sort((a, b) => a.score - b.score);

  // Build recommendations table for ALL dimensions
  const recData = allDimsSorted.map((dim) => {
    const fullName = dimensionNames[dim.code] || dim.name;
    const recs = getRecommendations(dim.code);
    
    // Format recommendations with bullet points
    const recText = recs.map((r, idx) => `${idx + 1}. ${r}`).join("\n");
    
    return [
      fullName,
      dim.score.toFixed(1),
      getProficiencyLevel(dim.score),
      recText
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [["Dimension", "Score", "Level", "Action Steps"]],
    body: recData,
    theme: "grid",
    headStyles: {
      fillColor: colors.primaryBlue,
      fontStyle: "bold",
      fontSize: 8,
      textColor: [255, 255, 255],
      halign: "center",
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: colors.darkText,
      cellPadding: 3,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { 
        cellWidth: 45, 
        halign: "left",
        fontStyle: "bold",
        valign: "top"
      },
      1: { 
        cellWidth: 18, 
        halign: "center",
        fontStyle: "bold",
        valign: "top"
      },
      2: { 
        cellWidth: 25, 
        halign: "center",
        valign: "top"
      },
      3: { 
        cellWidth: contentWidth - 93, 
        halign: "left",
        valign: "top"
      },
    },
    margin: { left: margin, right: margin },
    didParseCell: function(data) {
      // Color coding for score column
      if (data.column.index === 1 && data.section === 'body') {
        const score = parseFloat(data.cell.text[0]);
        const scoreColor = getLevelColor(score);
        data.cell.styles.textColor = scoreColor;
      }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Divider line
  doc.setDrawColor(...colors.lightGray);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 8;

  // Verification Section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("Certificate Verification", margin, currentY);

  currentY += 8;

  // QR Code and verification info
  const verificationUrl = `https://aiq.works/verify/${verificationCode}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 200,
    margin: 1,
    color: { dark: "#1e3a8a", light: "#ffffff" },
  });

  const qrSize = 28;
  doc.addImage(qrDataUrl, "PNG", margin, currentY, qrSize, qrSize);

  // Verification text
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.darkText);
  doc.text("Scan QR code or visit:", margin + qrSize + 5, currentY + 6);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.accentBlue);
  doc.text("aiq.works/verify", margin + qrSize + 5, currentY + 12);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.mediumGray);
  doc.setFontSize(8);
  doc.text(`Verification Code: ${verificationCode}`, margin + qrSize + 5, currentY + 18);
  doc.text(`Valid through: ${expiryDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`, margin + qrSize + 5, currentY + 23);

  currentY += qrSize + 10;

  // Assessment Information
  doc.setDrawColor(...colors.lightGray);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("About This Assessment", margin, currentY);

  currentY += 6;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.darkText);

  const assessmentInfo = [
    "• Uses adaptive Item Response Theory (IRT) with 380+ calibrated items",
    "• Evaluates 8 core dimensions of AI collaboration capability",
    "• Results valid for 12 months from issue date",
    "• Based on research published in Discover Artificial Intelligence journal"
  ];

  assessmentInfo.forEach((info, idx) => {
    doc.text(info, margin + 2, currentY + (idx * 5));
  });

  currentY += 25;

  // Research citation at bottom
  currentY = pageHeight - 25;
  doc.setDrawColor(...colors.lightGray);
  doc.setLineWidth(0.2);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 5;

  doc.setFontSize(7.5);
  doc.setTextColor(...colors.mediumGray);
  doc.setFont("helvetica", "italic");
  doc.text(
    "Research Reference: Ganuthula, V.R.R., Balaraman, K.K. (2025). Development and validation of the AIQ",
    margin,
    currentY
  );
  doc.text(
    "assessment framework. Discover Artificial Intelligence. https://doi.org/10.1007/s44163-025-00516-1",
    margin,
    currentY + 4
  );

  addFooter();
  addPageNumber(2, 2);

  return doc.output("blob");
}