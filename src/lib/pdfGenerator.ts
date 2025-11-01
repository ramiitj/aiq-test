import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

interface DimensionScore {
  code: string;
  name: string;
  score: number;
  description?: string;
}

const dimensionNames: Record<string, string> = {
  SAU: "Strategic AI Understanding",
  PEI: "Prompt Engineering & Interaction",
  CEC: "Critical Evaluation & Calibration",
  II: "Intelligent Task Integration",
  ALC: "Adaptive Learning & Capability",
  EJC: "Ethical Judgment & Usage",
  CS: "Context Sensitivity",
  CRS: "Creative Synthesis",
};

const beginnerRecommendations: Record<string, string[]> = {
  SAU: [
    "Begin by studying how leading companies leverage AI to enhance business decision-making and competitive positioning.",
    "Develop understanding of AI system capabilities and limitations through structured coursework or online learning platforms.",
    "Review case studies documenting both successful AI implementations and notable failures to build practical judgment.",
  ],
  PEI: [
    "Practice crafting clear, specific prompts by experimenting with various AI tools and documenting effective patterns.",
    "Systematically test different question formats and observe how variations in phrasing affect response quality and relevance.",
    "Maintain a personal prompt library that catalogs successful approaches for different task types and contexts.",
  ],
  CEC: [
    "Establish a routine practice of verifying AI-generated outputs against authoritative sources before accepting conclusions.",
    "Learn to identify common failure modes such as hallucinations, outdated information, and logical inconsistencies in AI responses.",
    "Evaluate whether AI outputs adequately consider multiple perspectives and potential biases in their analysis.",
  ],
  II: [
    "Identify routine tasks within your workflow that could benefit from AI assistance while maintaining quality standards.",
    "Practice decomposing complex projects into discrete subtasks that can be effectively delegated to AI systems.",
    "Develop verification checklists to systematically review and validate AI-assisted work products.",
  ],
  ALC: [
    "Create a structured system for documenting insights gained from each AI interaction to accelerate learning.",
    "Schedule regular knowledge-sharing sessions with colleagues to exchange AI usage strategies and lessons learned.",
    "Build a comprehensive personal reference guide capturing effective prompts, common pitfalls, and best practices.",
  ],
  EJC: [
    "Study fundamental concepts of fairness, bias, and transparency in AI systems through reputable educational resources.",
    "Understand organizational and professional standards regarding disclosure of AI involvement in your work products.",
    "Review and internalize ethical AI usage guidelines specific to your industry and professional context.",
  ],
  CS: [
    "Recognize that AI system performance and appropriateness varies significantly across different cultural and organizational contexts.",
    "Research AI-related regulations and compliance requirements that apply to your specific industry and geographic region.",
    "Develop strategies for adapting AI usage approaches based on varying organizational cultures and stakeholder expectations.",
  ],
  CRS: [
    "Experiment with using AI as a collaborative brainstorming partner to generate novel ideas and creative solutions.",
    "Explore diverse applications of AI for creative problem-solving beyond conventional use cases in your field.",
    "Practice generating multiple solution alternatives using AI assistance and synthesizing the most promising approaches.",
  ],
};

const professionalRecommendations: Record<string, string[]> = {
  SAU: [
    "Conduct systematic analysis of AI adoption patterns across your industry to identify competitive opportunities and strategic gaps.",
    "Develop comprehensive 12-18 month AI capability roadmaps that align with organizational strategy and resource constraints.",
    "Assess organizational readiness for AI adoption using established maturity frameworks and create targeted improvement plans.",
  ],
  PEI: [
    "Master advanced prompting techniques including meta-prompting, chain-of-thought reasoning, and systematic constraint engineering.",
    "Build domain-specific prompt libraries containing 20+ tested variations for common tasks, documented with performance metrics.",
    "Establish rigorous prompt optimization processes incorporating systematic A/B testing and continuous refinement cycles.",
  ],
  CEC: [
    "Design and conduct fairness audits that evaluate AI system outputs across diverse demographic groups and use cases.",
    "Implement comprehensive verification protocols with clearly defined criteria for output quality and reliability thresholds.",
    "Study and apply advanced techniques for uncertainty quantification to improve decision-making under AI-assisted conditions.",
  ],
  II: [
    "Design sophisticated workflows that strategically optimize the complementary strengths of human judgment and AI capabilities.",
    "Develop role evolution strategies that prepare team members for effective collaboration in AI-integrated work environments.",
    "Establish robust governance frameworks defining quality standards, review processes, and accountability for human-AI collaboration.",
  ],
  ALC: [
    "Build organizational learning systems with documented processes for capturing, sharing, and scaling AI capabilities across teams.",
    "Create cross-functional knowledge-sharing forums and communities of practice focused on AI capability development.",
    "Implement systematic capability maturity tracking with defined metrics, milestones, and assessment mechanisms.",
  ],
  EJC: [
    "Develop enterprise-wide AI ethics governance frameworks addressing fairness, transparency, accountability, and stakeholder impact.",
    "Create comprehensive stakeholder impact assessment protocols with regular review cycles and clear escalation procedures.",
    "Design decision support tools that help teams navigate trade-offs between AI capability optimization and ethical considerations.",
  ],
  CS: [
    "Develop differentiated AI strategies tailored to specific markets, regions, and cultural contexts based on systematic analysis.",
    "Design implementation approaches that account for regulatory variance, data governance requirements, and local compliance needs.",
    "Build cultural intelligence frameworks that guide appropriate AI deployment across diverse organizational and geographic contexts.",
  ],
  CRS: [
    "Identify and analyze AI capability inflection points that could enable significant business model innovation and competitive differentiation.",
    "Design systematic approaches for transferring successful AI patterns across domains to unlock new sources of competitive advantage.",
    "Build strategic foresight processes that anticipate AI-enabled market transformations and position organizations for emerging opportunities.",
  ],
};

const expertRecommendations: Record<string, string[]> = {
  SAU: [
    "Publish peer-reviewed research on AI strategic positioning, competitive dynamics, and organizational transformation in leading journals.",
    "Mentor industry peers and executives on enterprise AI governance frameworks, transformation roadmaps, and change management.",
    "Actively contribute to development of industry standards and best practices for responsible AI strategy and deployment.",
  ],
  PEI: [
    "Conduct and publish novel research advancing theoretical understanding and practical applications of prompt engineering techniques.",
    "Design comprehensive organizational certification programs that develop and credential prompt engineering expertise at scale.",
    "Develop influential frameworks for optimizing AI reasoning architectures and cognitive augmentation approaches.",
  ],
  CEC: [
    "Research and publish innovations in AI trustworthiness assessment methodologies and evaluation framework design.",
    "Lead development of industry standards for AI system evaluation, validation, and continuous monitoring approaches.",
    "Build enterprise-scale evaluation infrastructure and governance models that others can adapt and implement.",
  ],
  II: [
    "Publish groundbreaking research on human-AI organizational design principles and effective integration strategies.",
    "Lead industry-wide discussions on responsible AI integration through conference presentations, panels, and thought leadership.",
    "Contribute substantively to regulatory frameworks and policy discussions shaping AI governance at organizational and societal levels.",
  ],
  ALC: [
    "Research and publish on organizational learning dynamics in AI-augmented systems and their implications for capability development.",
    "Publish thought leadership on AI-driven culture transformation and change management in professional and academic forums.",
    "Develop field-advancing learning infrastructure models and frameworks that influence organizational practice broadly.",
  ],
  EJC: [
    "Contribute actively to AI ethics standards development through participation in professional bodies and policy advisory committees.",
    "Publish research on effective ethical AI governance mechanisms and their impact on organizational and societal outcomes.",
    "Shape the regulatory landscape by participating in policy forums, submitting comments on proposed regulations, and advising policymakers.",
  ],
  CS: [
    "Research and publish on how contextual factors shape AI strategy effectiveness and implementation outcomes across settings.",
    "Contribute substantively to geopolitical AI policy discussions and international framework development initiatives.",
    "Mentor emerging leaders across the ecosystem on principles and practices of context-sensitive AI deployment.",
  ],
  CRS: [
    "Research and publish on AI-enabled business model discontinuities and the patterns underlying successful innovation.",
    "Publish influential frameworks on leveraging emerging AI capabilities for innovation that shape industry understanding.",
    "Shape industry and academic understanding of AI transformation possibilities through high-impact research and thought leadership.",
  ],
};

export async function generatePDFReport(
  overallScore: number, // This is now actual points earned, not percentage
  dimensionScores: DimensionScore[],
  verificationCode: string,
  issueDate: Date,
  expiryDate: Date,
  userEmail?: string,
  testDurationSeconds?: number,
  assessmentLevel: string = 'professional',
  scoringResult?: any // Required for accurate total and passing info
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Validate passing score if scoringResult provided
  if (scoringResult && !scoringResult.passed) {
    throw new Error(`Certificate requires passing score of ${scoringResult.passingScore} points. Current score: ${scoringResult.overallScore} points.`);
  }

  // Calculate percentage for display
  const totalPossible = scoringResult?.totalPossiblePoints || 600;
  const percentageScore = scoringResult?.percentageScore || ((overallScore / totalPossible) * 100);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  const maxY = pageHeight - 15; // Maximum Y position before footer

  const colors = {
    primaryBlue: [25, 46, 110] as [number, number, number],
    accentBlue: [41, 98, 255] as [number, number, number],
    lightGray: [243, 244, 246] as [number, number, number],
    mediumGray: [100, 116, 139] as [number, number, number],
    darkText: [15, 23, 42] as [number, number, number],
    green: [22, 163, 74] as [number, number, number],
    orange: [234, 88, 12] as [number, number, number],
    red: [220, 38, 38] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
  };

  const levelType =
    assessmentLevel?.toLowerCase() === "beginner"
      ? "beginner"
      : assessmentLevel?.toLowerCase() === "expert"
        ? "expert"
        : "professional";

  // Get recommendations based on dimension performance percentage
  const getRecommendations = (code: string, percentage: number): string[] => {
    // Select recommendation set based on performance
    let recs: { [key: string]: string[] };
    
    if (percentage >= 80) {
      // High performers get expert/thought leadership recommendations
      recs = levelType === 'expert' ? expertRecommendations : professionalRecommendations;
    } else if (percentage < 40) {
      // Low performers get beginner/foundational recommendations
      recs = beginnerRecommendations;
    } else {
      // Mid performers get level-appropriate recommendations
      recs = levelType === 'beginner' ? beginnerRecommendations :
             levelType === 'expert' ? expertRecommendations :
             professionalRecommendations;
    }
    
    return recs[code] || [];
  };

  // Get proficiency level based on percentage (not raw score)
  const getProficiencyLevel = (percentage: number): string => {
    if (levelType === 'beginner') {
      if (percentage >= 90) return 'Advanced';
      if (percentage >= 80) return 'Proficient';
      if (percentage >= 60) return 'Developing';
      if (percentage >= 40) return 'Beginner';
      return 'Novice';
    } else if (levelType === 'expert') {
      if (percentage >= 90) return 'Thought Leader';
      if (percentage >= 80) return 'Senior Expert';
      if (percentage >= 65) return 'Expert';
      if (percentage >= 50) return 'Advanced Professional';
      return 'Emerging Expert';
    } else {
      // Professional
      if (percentage >= 90) return 'Expert';
      if (percentage >= 80) return 'Advanced';
      if (percentage >= 60) return 'Proficient';
      if (percentage >= 40) return 'Developing';
      return 'Emerging';
    }
  };

  const getLevelColor = (percentage: number): [number, number, number] => {
    if (percentage >= 80) return colors.green;
    if (percentage >= 60) return colors.accentBlue;
    if (percentage >= 40) return colors.orange;
    return colors.red;
  };

  const addFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(...colors.mediumGray);
    const footerY = pageHeight - 8;

    // AIQ™ Trademark notice (left aligned)
    doc.text("AIQ™ is a trademark of AI Works Pvt Ltd. All Rights Reserved.", margin, footerY);
    
    // Verification URL (right aligned)
    doc.text("Verify at: aiq.works/verify", pageWidth - margin, footerY, { align: "right" });
  };

  const addPageNumber = (pageNum: number, totalPages: number) => {
    doc.setFontSize(10);
    doc.setTextColor(...colors.mediumGray);
    doc.text(`${pageNum}/${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
  };

  // Helper function to add wrapped text with proper margins
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 5): number => {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string, index: number) => {
      doc.text(line, x, y + index * lineHeight);
    });
    return y + lines.length * lineHeight;
  };

  let currentY = 0;

  // PAGE 1: Header and Overview
  doc.setFillColor(...colors.primaryBlue);
  doc.rect(0, 0, pageWidth, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("AIQ", pageWidth / 2 - 8, 14, { align: "center" });
  
  // Add ™ symbol
  doc.setFontSize(12);
  doc.text("™", pageWidth / 2 + 12, 11);
  
  doc.setFontSize(14);
  doc.text("ASSESSMENT", pageWidth / 2, 22, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Official AI Collaboration Capability Certificate", pageWidth / 2, 28, { align: "center" });

  doc.setFontSize(9);
  doc.setTextColor(220, 220, 255);
  const issueDateStr = issueDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`${assessmentLevel || "Professional"} Level • Issued ${issueDateStr}`, pageWidth / 2, 30, {
    align: "center",
  });

  currentY = 48;

  // Overall Score Box
  const centerX = pageWidth / 2;

  doc.setDrawColor(...colors.primaryBlue);
  doc.setLineWidth(0.5);
  doc.setFillColor(250, 251, 255);
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2, "FD");

  currentY += 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.mediumGray);
  doc.text("OVERALL SCORE", centerX, currentY + 3, { align: "center" });

  currentY += 9;

  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  const scoreColor = getLevelColor(percentageScore);
  doc.setTextColor(...scoreColor);
  // Display actual points with total possible
  doc.setFontSize(28);
  doc.text(`${overallScore.toFixed(1)} / ${totalPossible.toFixed(0)}`, centerX, currentY + 5, { align: "center" });

  currentY += 15;

  const level = getProficiencyLevel(percentageScore);
  doc.setFillColor(...scoreColor);
  const badgeWidth = 75;
  const badgeHeight = 10;
  doc.roundedRect(centerX - badgeWidth / 2, currentY - 3, badgeWidth, badgeHeight, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(level, centerX, currentY + 1.5, { align: "center", baseline: "middle" });

  currentY += 11;

  doc.setFontSize(8.5);
  doc.setTextColor(...colors.mediumGray);
  doc.setFont("helvetica", "normal");
  doc.text(`Certificate ID: ${verificationCode}`, centerX, currentY, { align: "center" });

  currentY += 11;

  // Performance Summary Table
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("Performance Summary", margin, currentY);

  currentY += 8;

  const perfData = dimensionScores.map((dim) => {
    const fullName = dimensionNames[dim.code] || dim.name;
    // Calculate percentage for dimension (assuming equal weighting)
    const dimPercentage = (dim.score / (totalPossible / dimensionScores.length)) * 100;
    return [fullName, dim.score.toFixed(1), getProficiencyLevel(dimPercentage)];
  });

  autoTable(doc, {
    startY: currentY,
    head: [["Dimension", "Score", "Proficiency Level"]],
    body: perfData,
    theme: "plain",
    headStyles: {
      fillColor: colors.primaryBlue,
      fontStyle: "bold",
      fontSize: 10,
      textColor: colors.white,
      halign: "center",
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: colors.darkText,
      cellPadding: 3,
      lineWidth: 0.1,
      lineColor: [220, 220, 220],
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 90, halign: "left" },
      1: { cellWidth: 20, halign: "center", fontStyle: "bold" },
      2: { cellWidth: 35, halign: "center" },
    },
    margin: { left: margin, right: margin },
    didParseCell: function (data) {
      if (data.column.index === 1 && data.section === "body") {
        const score = parseFloat(data.cell.text[0]);
        // Calculate percentage for color coding
        const dimPercentage = (score / (totalPossible / dimensionScores.length)) * 100;
        const cellColor = getLevelColor(dimPercentage);
        data.cell.styles.textColor = cellColor;
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 11;

  // Performance Visualization
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("Performance Visualization", margin, currentY);

  currentY += 7;

  const barMaxWidth = contentWidth - 60;
  const barHeight = 7;
  const barSpacing = 10;

  dimensionScores.forEach((dim) => {
    const fullName = dimensionNames[dim.code] || dim.name;
    
    // Calculate percentage for visualization
    const dimPercentage = (dim.score / (totalPossible / dimensionScores.length)) * 100;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.darkText);
    const label = fullName.length > 25 ? fullName.substring(0, 22) + "..." : fullName;
    doc.text(label, margin, currentY + 4);

    doc.setFillColor(238, 238, 238);
    doc.roundedRect(margin + 55, currentY, barMaxWidth, barHeight, 1.5, 1.5, "F");

    const scoreWidth = (dimPercentage / 100) * barMaxWidth;
    const barColor = getLevelColor(dimPercentage);
    doc.setFillColor(...barColor);
    if (scoreWidth > 0) {
      doc.roundedRect(margin + 55, currentY, scoreWidth, barHeight, 1.5, 1.5, "F");
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...barColor);
    doc.text(`${dim.score.toFixed(1)}`, pageWidth - margin - 2, currentY + 4);

    currentY += barSpacing;
  });

  addFooter();
  addPageNumber(1, 3);

  // Add prominent verification box on page 1
  currentY += 5;
  if (currentY + 30 < maxY) {
    doc.setFillColor(240, 249, 255); // Light blue background
    doc.roundedRect(margin, currentY, contentWidth, 28, 3, 3, "F");

    doc.setFontSize(10);
    doc.setTextColor(...colors.darkText);
    doc.setFont("helvetica", "bold");
    doc.text("Verify This Certificate Online", margin + 5, currentY + 7);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 102, 204); // Blue color for URL
    doc.text("aiq.works/verify", margin + 5, currentY + 16);

    doc.setFontSize(8);
    doc.setTextColor(...colors.mediumGray);
    doc.setFont("helvetica", "normal");
    doc.text(`Code: ${verificationCode}`, margin + 5, currentY + 23);
  }

  // PAGE 2: Recommendations Part 1
  doc.addPage();
  currentY = 18;

  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("Development Recommendations", margin, currentY);

  currentY += 7;

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.mediumGray);

  let levelDesc = "";
  if (levelType === "beginner") {
    levelDesc = "Foundational development pathways to build essential AI collaboration competencies";
  } else if (levelType === "expert") {
    levelDesc = "Advanced opportunities for thought leadership and field-advancing contributions";
  } else {
    levelDesc = "Strategic development priorities for professional AI capability advancement";
  }

  // Use proper text wrapping for description
  currentY = addWrappedText(levelDesc, margin, currentY, contentWidth, 5);
  currentY += 5;

  const allDimsSorted = [...dimensionScores].sort((a, b) => a.score - b.score);

  const halfPoint = Math.ceil(allDimsSorted.length / 2);
  const firstHalf = allDimsSorted.slice(0, halfPoint);
  const secondHalf = allDimsSorted.slice(halfPoint);

  const createRecData = (dims: DimensionScore[]) => {
    return dims.map((dim) => {
      const fullName = dimensionNames[dim.code] || dim.name;
      // Calculate percentage for this dimension
      const dimPercentage = (dim.score / (totalPossible / dimensionScores.length)) * 100;
      const recs = getRecommendations(dim.code, dimPercentage);

      const recText =
        recs.length > 0
          ? recs.map((r, idx) => `${idx + 1}. ${r}`).join("\n\n")
          : "1. Establish foundational knowledge through structured learning programs and mentorship.\n\n2. Engage with practical exercises and real-world case studies to build applied competency.\n\n3. Seek feedback from experienced practitioners to accelerate skill development.";

      return [fullName, dim.score.toFixed(1), getProficiencyLevel(dimPercentage), recText];
    });
  };

  const recData1 = createRecData(firstHalf);

  autoTable(doc, {
    startY: currentY,
    head: [["Dimension", "Score", "Level", "Recommended Actions"]],
    body: recData1,
    theme: "grid",
    headStyles: {
      fillColor: colors.primaryBlue,
      fontStyle: "bold",
      fontSize: 10,
      textColor: colors.white,
      halign: "center",
      cellPadding: 3.5,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: colors.darkText,
      cellPadding: 4,
      lineColor: [215, 215, 215],
      lineWidth: 0.1,
      valign: "top",
      halign: "left", // Changed from justify to left alignment
    },
    columnStyles: {
      0: {
        cellWidth: 38,
        halign: "left",
        fontStyle: "bold",
      },
      1: {
        cellWidth: 15,
        halign: "center",
        fontStyle: "bold",
      },
      2: {
        cellWidth: 22,
        halign: "center",
      },
      3: {
        cellWidth: contentWidth - 80,
        halign: "left", // Left-aligned for better readability
      },
    },
    margin: { left: margin, right: margin },
    didParseCell: function (data) {
      if (data.column.index === 1 && data.section === "body") {
        const score = parseFloat(data.cell.text[0]);
        const cellColor = getLevelColor(score);
        data.cell.styles.textColor = cellColor;
      }
    },
  });

  addFooter();
  addPageNumber(2, 3);

  // PAGE 3: Recommendations Part 2 and Verification
  doc.addPage();
  currentY = 18;

  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("Development Recommendations (continued)", margin, currentY);

  currentY += 10;

  const recData2 = createRecData(secondHalf);

  autoTable(doc, {
    startY: currentY,
    head: [["Dimension", "Score", "Level", "Recommended Actions"]],
    body: recData2,
    theme: "grid",
    headStyles: {
      fillColor: colors.primaryBlue,
      fontStyle: "bold",
      fontSize: 10,
      textColor: colors.white,
      halign: "center",
      cellPadding: 3.5,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: colors.darkText,
      cellPadding: 4,
      lineColor: [215, 215, 215],
      lineWidth: 0.1,
      valign: "top",
      halign: "left", // Changed from justify to left alignment
    },
    columnStyles: {
      0: {
        cellWidth: 38,
        halign: "left",
        fontStyle: "bold",
      },
      1: {
        cellWidth: 15,
        halign: "center",
        fontStyle: "bold",
      },
      2: {
        cellWidth: 22,
        halign: "center",
      },
      3: {
        cellWidth: contentWidth - 80,
        halign: "left", // Left-aligned for better readability
      },
    },
    margin: { left: margin, right: margin },
    didParseCell: function (data) {
      if (data.column.index === 1 && data.section === "body") {
        const score = parseFloat(data.cell.text[0]);
        const cellColor = getLevelColor(score);
        data.cell.styles.textColor = cellColor;
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Ensure we don't go past the maximum Y position
  if (currentY > maxY - 50) {
    doc.addPage();
    currentY = 18;
  }

  // Verification Section
  doc.setDrawColor(...colors.primaryBlue);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 10;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("Certificate Verification", margin, currentY);

  currentY += 8;

  const verificationUrl = `https://aiq.works/verify/${verificationCode}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 200,
    margin: 1,
    color: { dark: "#192e6e", light: "#ffffff" },
  });

  const qrSize = 30;
  doc.addImage(qrDataUrl, "PNG", margin, currentY, qrSize, qrSize);

  const textX = margin + qrSize + 8;
  const textWidth = contentWidth - qrSize - 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.darkText);
  doc.text("Scan QR code or visit:", textX, currentY + 5);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.accentBlue);
  doc.setFontSize(11);
  doc.text("aiq.works/verify", textX, currentY + 11);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.mediumGray);
  doc.setFontSize(9);
  doc.text(`Certificate ID: ${verificationCode}`, textX, currentY + 17);

  const expiryDateCalc = new Date(issueDate);
  expiryDateCalc.setDate(expiryDateCalc.getDate() + 180);
  doc.text(
    `Valid Through: ${expiryDateCalc.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    textX,
    currentY + 23,
  );

  currentY += qrSize + 12;

  // About Section
  doc.setDrawColor(...colors.primaryBlue);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 8;

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("About This Assessment", margin, currentY);

  currentY += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.darkText);

  const assessmentInfo = [
    "Assessment employs adaptive Item Response Theory (IRT) methodology with 380+ psychometrically calibrated items",
    "Evaluates competency across 8 core dimensions of AI collaboration capability",
    "Results remain valid for 180 days from date of issue",
    "Based on peer-reviewed research published in Discover Artificial Intelligence journal",
  ];

  assessmentInfo.forEach((info) => {
    currentY = addWrappedText(`• ${info}`, margin + 2, currentY, contentWidth - 4, 4.5);
    currentY += 1;
  });

  currentY += 5;

  // Research Reference
  doc.setDrawColor(...colors.lightGray);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 7;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("Research Reference", margin, currentY);

  currentY += 7;

  doc.setFontSize(8.5);
  doc.setTextColor(...colors.darkText);
  doc.setFont("helvetica", "normal");

  const citation =
    "Ganuthula, V.R.R., Balaraman, K.K. (2025). Development and validation of the AIQ assessment framework: measuring AI collaboration capabilities across eight dimensions. Discover Artificial Intelligence, 5, Article 29.";
  currentY = addWrappedText(citation, margin, currentY, contentWidth, 4.5);

  currentY += 3;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.accentBlue);
  doc.setFontSize(9);
  doc.text("https://doi.org/10.1007/s44163-025-00516-1", margin, currentY);

  addFooter();
  addPageNumber(3, 3);

  return doc.output("blob");
}
