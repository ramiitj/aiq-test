import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

interface DimensionScore {
  code: string;
  name: string;
  score: number;
  description?: string;
}

// Level-specific, concise recommendations - Beginner (basic, actionable)
const beginnerRecommendations: Record<string, string[]> = {
  SAU: [
    "Study how companies use AI for business decisions",
    "Learn about AI strengths and limitations in your field",
    "Explore AI impact on competitive positioning"
  ],
  PEI: [
    "Practice writing clear prompts for AI tools",
    "Experiment with different question formats",
    "Document what prompts work best for your tasks"
  ],
  CEC: [
    "Verify AI outputs against reliable sources",
    "Learn to spot common AI mistakes",
    "Check if AI respects diverse viewpoints"
  ],
  II: [
    "Identify routine tasks suitable for AI",
    "Design workflows with AI and humans working together",
    "Create quality checks for AI-assisted work"
  ],
  ALC: [
    "Document lessons from using AI tools",
    "Share AI learnings with your team",
    "Build a personal AI playbook"
  ],
  EJC: [
    "Understand fairness in AI systems",
    "Know when to disclose AI involvement",
    "Learn ethical AI use principles"
  ],
  CS: [
    "Understand AI works differently across contexts",
    "Learn regulations affecting AI in your region",
    "Adapt AI approaches to your organization"
  ],
  CRS: [
    "Explore AI for creative problem-solving",
    "Discover new business applications of AI",
    "Ideate with AI as brainstorming partner"
  ]
};

// Professional level - more strategic
const professionalRecommendations: Record<string, string[]> = {
  SAU: [
    "Analyze industry AI adoption patterns and competitive gaps",
    "Build 12-month AI capability roadmaps aligned with strategy",
    "Assess organizational readiness using structured frameworks"
  ],
  PEI: [
    "Master advanced prompting: meta-prompting, constraint engineering",
    "Build domain-specific prompt libraries with 20+ variations",
    "Develop systematic prompt testing and optimization processes"
  ],
  CEC: [
    "Conduct fairness audits across demographic groups",
    "Implement systematic AI verification protocols",
    "Study calibration and uncertainty quantification methods"
  ],
  II: [
    "Design human-AI workflows optimizing complementary strengths",
    "Define role evolution strategies for AI-integrated teams",
    "Establish governance frameworks for human-AI collaboration"
  ],
  ALC: [
    "Build organizational learning systems for AI capability scaling",
    "Create cross-functional knowledge-sharing forums",
    "Establish capability maturity tracking mechanisms"
  ],
  EJC: [
    "Develop enterprise AI ethics governance frameworks",
    "Create stakeholder impact assessment protocols",
    "Design fairness-capability trade-off decision matrices"
  ],
  CS: [
    "Develop geopolitical AI strategies accounting for regulatory variance",
    "Design context-specific implementation approaches by market",
    "Build cultural intelligence for global AI deployment"
  ],
  CRS: [
    "Identify AI capability inflection points for business model innovation",
    "Design cross-domain pattern transfer for competitive advantage",
    "Build strategic foresight for AI-enabled market transformation"
  ]
};

// Expert level - thought leadership
const expertRecommendations: Record<string, string[]> = {
  SAU: [
    "Publish research on AI strategic positioning and competitive advantage",
    "Mentor peers on enterprise AI governance and transformation",
    "Shape industry standards for responsible AI strategy"
  ],
  PEI: [
    "Contribute novel prompting research advancing the field",
    "Build organizational prompt engineering certification programs",
    "Publish frameworks on AI reasoning architecture optimization"
  ],
  CEC: [
    "Research and publish on AI trustworthiness assessment innovations",
    "Contribute to industry standards for AI evaluation",
    "Build enterprise evaluation infrastructure and governance"
  ],
  II: [
    "Publish on human-AI organizational design innovations",
    "Lead industry discussions on responsible AI integration",
    "Contribute to regulatory frameworks for AI governance"
  ],
  ALC: [
    "Research organizational learning dynamics with AI systems",
    "Publish thought leadership on AI-driven culture transformation",
    "Build field-advancing learning infrastructure models"
  ],
  EJC: [
    "Contribute to AI ethics standards and policy discussions",
    "Publish research on effective ethical AI governance",
    "Shape regulatory landscape for responsible AI"
  ],
  CS: [
    "Research context effects on AI strategy and outcomes",
    "Contribute to geopolitical AI policy discussions",
    "Mentor ecosystem on context-sensitive AI deployment"
  ],
  CRS: [
    "Research AI-enabled business model discontinuities",
    "Publish on innovation frameworks leveraging emerging AI",
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
    accentBlue: [37, 99, 235] as [number, number, number],
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

  const addPageNumber = (pageNum: number, totalPages: number) => {
    doc.setFontSize(7);
    doc.setTextColor(...colors.mediumGray);
    doc.text(
      `${pageNum}/${totalPages}`,
      pageWidth - margin - 3,
      pageHeight - 8,
      { align: "right" }
    );
  };

  const addFooter = () => {
    doc.setFontSize(6);
    doc.setTextColor(...colors.mediumGray);
    doc.text(
      "Research by Venkat Ram Reddy Ganuthula & Krishna Kumar Balaraman | IIT Jodhpur",
      pageWidth / 2,
      pageHeight - 5,
      { align: "center" }
    );
  };

  // ========== PAGE 1: HEADER + SCORE + PERFORMANCE CHART ==========
  let currentY = 0;

  // Compact header
  doc.setFillColor(...colors.primaryBlue);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("AIQ Assessment", pageWidth / 2, 12, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`${assessmentLevel || "Professional"} Level | ${verificationCode}`, pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(7);
  doc.setTextColor(200, 200, 200);
  const issueDateStr = issueDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  doc.text(`Issued: ${issueDateStr}`, pageWidth / 2, 27, { align: "center" });

  currentY = 50;

  // Score section - more compact
  const centerX = pageWidth / 2;
  doc.setFillColor(...colors.accentBlue);
  doc.circle(centerX, currentY + 15, 18, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(40);
  doc.setFont("helvetica", "bold");
  doc.text(overallScore.toFixed(1), centerX, currentY + 16, { align: "center", baseline: "middle" });

  currentY += 38;

  const level = getProficiencyLevel(overallScore);
  const levelColor = getLevelColor(overallScore);
  doc.setFillColor(...levelColor);
  const badgeWidth = 45;
  doc.roundedRect(centerX - badgeWidth / 2, currentY - 3, badgeWidth, 8, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`${level} AI Collaborator`, centerX, currentY + 1, { align: "center", baseline: "middle" });

  currentY += 12;

  // Dimension performance - compact table
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("Performance Across Dimensions", margin, currentY);

  currentY += 7;

  // Create performance data
  const perfData = dimensionScores.map((dim) => [
    dim.name.substring(0, 20),
    dim.score.toFixed(1),
    getProficiencyLevel(dim.score),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["Dimension", "Score", "Level"]],
    body: perfData,
    theme: "grid",
    headStyles: {
      fillColor: colors.primaryBlue,
      fontStyle: "bold",
      fontSize: 8,
      textColor: [255, 255, 255],
      padding: 2,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      padding: 2,
      textColor: colors.darkText,
    },
    alternateRowStyles: {
      fillColor: colors.lightGray,
    },
    columnStyles: {
      0: { cellWidth: 60, halign: "left" },
      1: { cellWidth: 25, halign: "center" },
      2: { cellWidth: 35, halign: "center" },
    },
    margin: { left: margin, right: margin },
    tableWidth: contentWidth,
    didDrawPage: () => {
      addFooter();
    }
  });

  addPageNumber(1, 3);

  // ========== PAGE 2: VISUAL BARS CHART (SEPARATED FROM TEXT) ==========
  doc.addPage();
  currentY = 15;

  // Full-width visualization section with clear separation
  doc.setLineWidth(0.5);
  doc.setDrawColor(...colors.primaryBlue);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 5;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("Performance Visualization", margin, currentY);

  currentY += 8;

  // Performance bars - clean and clear
  const barWidth = contentWidth - 50;
  const barHeight = 5;
  const barSpacing = 7;

  dimensionScores.forEach((dim, idx) => {
    // Dimension label
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.darkText);
    const label = dim.name.length > 22 ? dim.name.substring(0, 19) + "..." : dim.name;
    doc.text(label, margin, currentY + 2);

    // Background bar
    doc.setFillColor(240, 240, 240);
    doc.rect(margin + 40, currentY, barWidth, barHeight, "F");

    // Score bar
    const scoreWidth = (dim.score / 100) * barWidth;
    const barColor = getLevelColor(dim.score);
    doc.setFillColor(...barColor);
    if (scoreWidth > 0) {
      doc.rect(margin + 40, currentY, scoreWidth, barHeight, "F");
    }

    // Score text
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primaryBlue);
    doc.text(`${dim.score.toFixed(1)}`, pageWidth - margin - 8, currentY + 2);

    currentY += barSpacing;
  });

  currentY += 8;

  // Clear divider
  doc.setLineWidth(0.5);
  doc.setDrawColor(...colors.lightGray);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 8;

  // Verification QR Code section - compact
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("Verification", margin, currentY);

  currentY += 6;

  const verificationUrl = `https://aiq.works/verify/${verificationCode}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 150,
    margin: 1,
    color: { dark: "#1e3a8a", light: "#ffffff" },
  });

  doc.addImage(qrDataUrl, "PNG", margin + 2, currentY, 22, 22);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.mediumGray);
  doc.text(`Code: ${verificationCode}`, margin + 26, currentY + 3);
  doc.text("Visit: aiq.works/verify", margin + 26, currentY + 8);

  addFooter();
  addPageNumber(2, 3);

  // ========== PAGE 3: GROWTH RECOMMENDATIONS (COMPACT TABULAR) ==========
  doc.addPage();
  currentY = 15;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("Growth Recommendations", margin, currentY);

  currentY += 8;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.mediumGray);

  let levelDesc = "";
  if (levelType === "beginner") {
    levelDesc = "Foundational learning paths for building AI collaboration skills";
  } else if (levelType === "expert") {
    levelDesc = "Thought leadership and field-advancing opportunities";
  } else {
    levelDesc = "Strategic development priorities for advanced AI capabilities";
  }
  doc.text(levelDesc, margin, currentY);

  currentY += 6;

  // Get development dimensions
  const developmentDims = dimensionScores.filter((d) => d.score < 80).sort((a, b) => a.score - b.score);

  if (developmentDims.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...colors.green);
    doc.setFont("helvetica", "bold");
    doc.text("Excellent Performance Across All Dimensions!", margin + 5, currentY + 10);
  } else {
    // Compact recommendation table
    const recData = developmentDims.map((dim) => {
      const recs = getRecommendations(dim.code);
      const recText = recs.slice(0, 2).join(" • ");
      return [
        dim.name.substring(0, 18),
        dim.score.toFixed(1),
        getProficiencyLevel(dim.score),
        recText.substring(0, 60) + (recText.length > 60 ? "..." : "")
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [["Dimension", "Score", "Level", "Growth Path"]],
      body: recData,
      theme: "grid",
      headStyles: {
        fillColor: colors.primaryBlue,
        fontStyle: "bold",
        fontSize: 7,
        textColor: [255, 255, 255],
        padding: 2,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 7,
        padding: 2,
        textColor: colors.darkText,
        valign: "middle",
      },
      alternateRowStyles: {
        fillColor: colors.lightGray,
      },
      columnStyles: {
        0: { cellWidth: 40, halign: "left" },
        1: { cellWidth: 15, halign: "center" },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: contentWidth - 85, halign: "left" },
      },
      margin: { left: margin, right: margin },
      tableWidth: contentWidth,
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Methodology note - compact
  currentY = pageHeight - 35;
  doc.setLineWidth(0.3);
  doc.setDrawColor(...colors.lightGray);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.mediumGray);

  const methodText = "Assessment uses adaptive testing (IRT) with 380+ calibrated items across 8 AI collaboration dimensions. Results valid for 12 months. For details, visit aiq.works/verify with your code.";
  const methodLines = doc.splitTextToSize(methodText, contentWidth);
  doc.text(methodLines, margin, currentY);

  addFooter();
  addPageNumber(3, 3);

  return doc.output("blob");
}
