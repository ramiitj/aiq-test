import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import { getRecommendations, getProficiencyLevel } from "./recommendationsSelector";
import { dimensionNames as sharedDimensionNames } from "./recommendationsData";

interface DimensionScore {
  code: string;
  name: string;
  score: number;
  description?: string;
}

// Dimension names and recommendations now imported from shared data files

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

  // Now using imported getRecommendations and getProficiencyLevel from recommendationsSelector

  const getLevelColor = (percentage: number): [number, number, number] => {
    if (percentage >= 80) return colors.green;
    if (percentage >= 60) return colors.accentBlue;
    if (percentage >= 40) return colors.orange;
    return colors.red;
  };

  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setFontSize(7);
    doc.setTextColor(...colors.mediumGray);
    const footerY = pageHeight - 8;

    // AIQ™ Trademark notice (left aligned)
    doc.text("AIQ™ is a trademark of AI Works Pvt Ltd. All Rights Reserved.", margin, footerY);
    
    // Verification URL (centered)
    doc.text(`Verify: https://aiq.works/verify-certificate/${verificationCode}`, pageWidth / 2, footerY, { align: "center" });
    
    // Page number (right aligned)
    doc.setFontSize(8);
    doc.text(`${pageNum}/${totalPages}`, pageWidth - margin, footerY, { align: "right" });
  };

  // Helper function to add wrapped text with proper margins
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 5.5): number => {
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
  const capitalizedLevel = assessmentLevel ? assessmentLevel.charAt(0).toUpperCase() + assessmentLevel.slice(1) : "Professional";
  doc.text(`${capitalizedLevel} Level • Issued ${issueDateStr}`, pageWidth / 2, 30, {
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

  const level = getProficiencyLevel(percentageScore, assessmentLevel || 'professional');
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
  
  // Show certification level with proper thresholds
  const capitalizedAssessmentLevel = assessmentLevel ? assessmentLevel.charAt(0).toUpperCase() + assessmentLevel.slice(1) : 'Professional';
  const certificationLevel = assessmentLevel === 'expert' 
    ? `${capitalizedAssessmentLevel} Level (${percentageScore.toFixed(1)}% - Requires 80% minimum)`
    : assessmentLevel === 'professional'
      ? `${capitalizedAssessmentLevel} Level (${percentageScore.toFixed(1)}% - Requires 70% minimum)`
      : `${capitalizedAssessmentLevel} Level (${percentageScore.toFixed(1)}% - Requires 70% minimum)`;
  
  doc.text(certificationLevel, centerX, currentY, { align: "center" });

  currentY += 4;
  doc.text(`Certificate ID: ${verificationCode}`, centerX, currentY, { align: "center" });

  currentY += 11;

  // Performance Summary Table
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primaryBlue);
  doc.text("Performance Summary", margin, currentY);

  currentY += 8;

  const perfData = dimensionScores.map((dim) => {
    const fullName = sharedDimensionNames[dim.code] || dim.name;
    // Calculate percentage for dimension (assuming equal weighting)
    const dimPercentage = (dim.score / (totalPossible / dimensionScores.length)) * 100;
    return [fullName, dim.score.toFixed(1), getProficiencyLevel(dimPercentage, assessmentLevel || 'professional')];
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
      fontSize: 9.5,
      textColor: colors.darkText,
      cellPadding: 4,
      lineWidth: 0.1,
      lineColor: [220, 220, 220],
      minCellHeight: 10,
      cellWidth: 'wrap',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 95, halign: "left" },
      1: { cellWidth: 25, halign: "center", fontStyle: "bold" },
      2: { cellWidth: 45, halign: "center" },
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

  const barHeight = 8;
  const barSpacing = 11;
  const barStartX = margin + 52;
  const adjustedBarMaxWidth = contentWidth - 65;

  dimensionScores.forEach((dim, index) => {
    // Check if we need a new page (leave 50mm for footer and safety)
    if (currentY + barSpacing > maxY - 10) {
      addFooter(1, 3);
      doc.addPage();
      currentY = 18;
      
      // Add section title on new page
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...colors.primaryBlue);
      doc.text("Performance Visualization (continued)", margin, currentY);
      currentY += 10;
    }

    const fullName = sharedDimensionNames[dim.code] || dim.name;
    
    // Calculate percentage for visualization
    const dimPercentage = (dim.score / (totalPossible / dimensionScores.length)) * 100;

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.darkText);
    
    // Smarter label handling with proper width calculation
    const label = fullName.length > 30 ? fullName.substring(0, 27) + "..." : fullName;
    doc.text(label, margin, currentY + 4.5);

    doc.setFillColor(238, 238, 238);
    doc.roundedRect(barStartX, currentY, adjustedBarMaxWidth, barHeight, 1.5, 1.5, "F");

    const scoreWidth = (dimPercentage / 100) * adjustedBarMaxWidth;
    const barColor = getLevelColor(dimPercentage);
    doc.setFillColor(...barColor);
    if (scoreWidth > 0) {
      doc.roundedRect(barStartX, currentY, scoreWidth, barHeight, 1.5, 1.5, "F");
    }

    // Score display with better positioning
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...barColor);
    doc.text(`${dim.score.toFixed(1)}`, pageWidth - margin, currentY + 4.5, { align: "right" });

    currentY += barSpacing;
  });

  addFooter(1, 3);

  // Add prominent verification box on page 1
  currentY += 5;
  if (currentY + 30 < maxY) {
    doc.setFillColor(240, 249, 255); // Light blue background
    doc.roundedRect(margin, currentY, contentWidth, 28, 3, 3, "F");

    doc.setFontSize(10);
    doc.setTextColor(...colors.darkText);
    doc.setFont("helvetica", "bold");
    doc.text("Verify This Certificate Online", margin + 5, currentY + 7);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 102, 204);
    const fullVerifyUrl = `https://aiq.works/verify-certificate/${verificationCode}`;
    // Split URL if too long
    const urlLines = doc.splitTextToSize(fullVerifyUrl, contentWidth - 10);
    urlLines.forEach((line: string, idx: number) => {
      doc.text(line, margin + 5, currentY + 16 + (idx * 5));
    });
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
      const fullName = sharedDimensionNames[dim.code] || dim.name;
      // Calculate percentage for this dimension
      const dimPercentage = (dim.score / (totalPossible / dimensionScores.length)) * 100;
      const recs = getRecommendations(dim.code, dimPercentage, assessmentLevel || 'professional');

      const recText =
        recs.length > 0
          ? recs.map((r, idx) => `${idx + 1}. ${r}`).join("\n\n")
          : "1. Establish foundational knowledge through structured learning programs and mentorship.\n\n2. Engage with practical exercises and real-world case studies to build applied competency.\n\n3. Seek feedback from experienced practitioners to accelerate skill development.";

      return [fullName, dim.score.toFixed(1), getProficiencyLevel(dimPercentage, assessmentLevel || 'professional'), recText];
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
      fontSize: 9,
      textColor: colors.darkText,
      cellPadding: 5,
      lineColor: [215, 215, 215],
      lineWidth: 0.1,
      valign: "top",
      halign: "left",
      minCellHeight: 12,
      cellWidth: 'wrap',
      overflow: 'linebreak',
    },
    columnStyles: {
      0: {
        cellWidth: 42,
        halign: "left",
        fontStyle: "bold",
      },
      1: {
        cellWidth: 18,
        halign: "center",
        fontStyle: "bold",
      },
      2: {
        cellWidth: 28,
        halign: "center",
      },
      3: {
        cellWidth: 82,
        halign: "left",
      },
    },
    tableWidth: 'auto',
    styles: {
      overflow: 'linebreak',
      cellWidth: 'wrap',
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

  addFooter(2, 3);

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
      fontSize: 9,
      textColor: colors.darkText,
      cellPadding: 5,
      lineColor: [215, 215, 215],
      lineWidth: 0.1,
      valign: "top",
      halign: "left",
      minCellHeight: 12,
      cellWidth: 'wrap',
      overflow: 'linebreak',
    },
    columnStyles: {
      0: {
        cellWidth: 42,
        halign: "left",
        fontStyle: "bold",
      },
      1: {
        cellWidth: 18,
        halign: "center",
        fontStyle: "bold",
      },
      2: {
        cellWidth: 28,
        halign: "center",
      },
      3: {
        cellWidth: 82,
        halign: "left",
      },
    },
    tableWidth: 'auto',
    styles: {
      overflow: 'linebreak',
      cellWidth: 'wrap',
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

  const verificationUrl = `https://aiq.works/verify-certificate/${verificationCode}`;
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
  doc.text("aiq.works/verify-certificate", textX, currentY + 11);

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

  addFooter(3, 3);

  return doc.output("blob");
}
