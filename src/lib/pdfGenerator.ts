import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

interface DimensionScore {
  name: string;
  score: number;
}

export async function generatePDFReport(
  overallScore: number,
  dimensionScores: DimensionScore[],
  verificationCode: string,
  issueDate: Date,
  expiryDate: Date,
  userName?: string,
  testDurationSeconds?: number,
  percentileRank?: number | null
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Helper function to get proficiency level
  const getProficiencyLevel = (score: number): string => {
    if (score >= 80) return 'Exceptional';
    if (score >= 60) return 'Proficient';
    if (score >= 40) return 'Developing';
    return 'Emerging';
  };

  // Helper function to add page number
  const addPageNumber = (pageNum: number) => {
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${pageNum} of 4`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  };

  // ========== PAGE 1: RESULTS SUMMARY ==========
  // Header with gradient effect
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 55, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('AIQ™ Assessment Results', pageWidth / 2, 22, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Certificate of Completion', pageWidth / 2, 32, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Verification Code: ${verificationCode}`, pageWidth / 2, 45, { align: 'center' });

  // User name in bold
  if (userName) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(userName, pageWidth / 2, 55, { align: 'center' });
  }

  // Issue and expiry dates with test duration
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Issued: ${issueDate.toLocaleDateString()}`, margin, userName ? 68 : 68);
  doc.text(`Valid Until: ${expiryDate.toLocaleDateString()}`, pageWidth - margin, userName ? 68 : 68, { align: 'right' });
  
  if (testDurationSeconds) {
    const minutes = Math.floor(testDurationSeconds / 60);
    const seconds = testDurationSeconds % 60;
    const durationText = `Duration: ${minutes}m ${seconds}s`;
    doc.text(durationText, pageWidth / 2, userName ? 75 : 75, { align: 'center' });
  }

  // Overall Score Circle
  const centerX = pageWidth / 2;
  const centerY = 105;
  const radius = 28;

  // Draw circle
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(3);
  doc.circle(centerX, centerY, radius, 'S');

  // Score text
  doc.setTextColor(59, 130, 246);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text(overallScore.toFixed(1), centerX, centerY, { align: 'center', baseline: 'middle' });

  doc.setFontSize(12);
  doc.text('AIQ', centerX, centerY + 10, { align: 'center', baseline: 'middle' });

  // Proficiency Level
  const level = getProficiencyLevel(overallScore);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const yOffset = userName && testDurationSeconds ? 10 : 0;
  doc.text(`${level} AI Collaborator`, centerX, centerY + radius + 15 + yOffset, { align: 'center' });

  // Percentile Ranking
  if (percentileRank !== null && percentileRank !== undefined) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(59, 130, 246);
    doc.text(`Top ${(100 - percentileRank).toFixed(0)}% of test-takers`, centerX, centerY + radius + 25 + yOffset, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`${percentileRank.toFixed(1)}th Percentile`, centerX, centerY + radius + 33 + yOffset, { align: 'center' });
  }

  // Interpretation
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const interpretationY = percentileRank !== null ? 180 : 160;
  const interpretation = `This score represents ${level.toLowerCase()} proficiency in AI collaboration across eight research-validated dimensions. The assessment utilizes adaptive testing with Item Response Theory (IRT) to provide precise measurement of real-world AI collaboration capabilities.`;
  
  const interpretationLines = doc.splitTextToSize(interpretation, pageWidth - 2 * margin);
  doc.text(interpretationLines, centerX, interpretationY, { align: 'center', maxWidth: pageWidth - 2 * margin });

  // Top 3 Dimensions
  const topDimensions = [...dimensionScores].sort((a, b) => b.score - a.score).slice(0, 3);
  
  const topDimY = percentileRank !== null ? 205 : 185;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Top Strengths', margin, topDimY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  topDimensions.forEach((dim, idx) => {
    doc.text(`• ${dim.name}: ${dim.score.toFixed(1)}`, margin + 3, topDimY + 8 + idx * 7);
  });

  addPageNumber(1);

  // ========== PAGE 2: DIMENSION BREAKDOWN ==========
  doc.addPage();

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('Dimension Breakdown', margin, 30);

  // Table with dimension scores
  autoTable(doc, {
    startY: 40,
    head: [['Dimension', 'Score', 'Level']],
    body: dimensionScores.map(dim => [
      dim.name,
      dim.score.toFixed(1),
      getProficiencyLevel(dim.score)
    ]),
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      fontSize: 11,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 40, halign: 'center' },
    },
    margin: { left: margin, right: margin },
  });

  // Visual bars for each dimension
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Visual Performance Overview', margin, finalY);

  dimensionScores.forEach((dim, idx) => {
    const yPos = finalY + 15 + idx * 12;
    const barMaxWidth = pageWidth - 2 * margin - 40;
    const barWidth = (dim.score / 100) * barMaxWidth;

    // Dimension name
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    // Draw bar background
    doc.setFillColor(230, 230, 230);
    doc.rect(margin, yPos, barMaxWidth, 6, 'F');

    // Draw score bar
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPos, barWidth, 6, 'F');

    // Score text
    doc.text(dim.score.toFixed(1), margin + barMaxWidth + 5, yPos + 4);
  });

  addPageNumber(2);

  // ========== PAGE 3: RESEARCH VALIDATION & AUTHENTICITY ==========
  doc.addPage();

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('Research Validation & Authenticity', margin, 30);

  // Test Design Foundation
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Test Design Foundation', margin, 45);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  
  const foundationText = `The AIQ Assessment is grounded in rigorous research on AI collaboration competencies. The test design incorporates Item Response Theory (IRT) principles with the following specifications:

• 400 calibrated items across eight validated dimensions
• Adaptive difficulty selection based on individual response patterns
• Psychometric validation through comprehensive pilot studies
• Discrimination parameters ranging from 0.44 to 0.79
• Difficulty parameters calibrated across three proficiency levels
• Ten items per dimension selected adaptively for optimal precision`;

  const foundationLines = doc.splitTextToSize(foundationText, pageWidth - 2 * margin);
  doc.text(foundationLines, margin, 55);

  // Authenticity Features
  const authY = 105;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Authenticity Features', margin, authY);

  // Generate QR code
  const verificationUrl = `${window.location.origin}/verify/${verificationCode}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 200,
    margin: 1,
  });

  doc.addImage(qrDataUrl, 'PNG', margin, authY + 5, 40, 40);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  
  const qrX = margin + 45;
  doc.text('Unique Verification Code:', qrX, authY + 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(verificationCode, qrX, authY + 18);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Scan QR code or visit:', qrX, authY + 26);
  doc.setTextColor(59, 130, 246);
  doc.textWithLink(verificationUrl, qrX, authY + 32, { url: verificationUrl });

  // Disclaimer
  const disclaimerY = authY + 55;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Important Notice', margin, disclaimerY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(80, 80, 80);
  const disclaimerText = `This assessment measures AI collaboration capabilities at a specific point in time. Results should be interpreted alongside other evaluation methods and professional judgment. AI collaboration skills can be enhanced through deliberate practice, structured training, and ongoing experience. This certificate remains valid for twelve months from the issue date.`;
  
  const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 2 * margin);
  doc.text(disclaimerLines, margin, disclaimerY + 8);

  // Methodology
  const methodY = disclaimerY + 35;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Methodology Reference', margin, methodY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const methodText = `Item Response Theory (IRT) is a contemporary psychometric framework that provides more precise ability estimates than classical test theory. IRT models the probability of correct responses based on both item difficulty and individual ability, enabling adaptive testing that selects optimal items for each respondent based on their demonstrated proficiency level.`;
  
  const methodLines = doc.splitTextToSize(methodText, pageWidth - 2 * margin);
  doc.text(methodLines, margin, methodY + 8);

  addPageNumber(3);

  // ========== PAGE 4: DEVELOPMENT RESOURCES ==========
  doc.addPage();

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('Your Growth Opportunities', margin, 30);

  // Identify lowest scoring dimensions
  const lowestDimensions = [...dimensionScores].sort((a, b) => a.score - b.score).slice(0, 3);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Recommended focus areas for continued development:', margin, 45);

  let currentY = 55;
  lowestDimensions.forEach((dim, idx) => {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`${idx + 1}. ${dim.name} (${dim.score.toFixed(1)})`, margin, currentY);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    const resources = [
      'Practice with AI tools in real-world scenarios',
      'Engage in structured learning programs',
      'Seek feedback from experienced AI collaborators',
      'Review case studies and best practices',
    ];
    
    resources.forEach((resource, resIdx) => {
      doc.text(`  • ${resource}`, margin + 5, currentY + 7 + resIdx * 5);
    });
    
    currentY += 32;
  });

  // Retake Policy
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('Retake Policy', margin, currentY + 10);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const retakeText = `You may retake this assessment after thirty days to measure your progress. We recommend focused practice in identified development areas before retaking to observe meaningful improvement in your AI collaboration capabilities.`;
  const retakeLines = doc.splitTextToSize(retakeText, pageWidth - 2 * margin);
  doc.text(retakeLines, margin, currentY + 20);

  // Contact Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('Questions?', margin, currentY + 45);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('For questions about your results or the assessment methodology,', margin, currentY + 55);
  doc.text('please visit our website or contact support.', margin, currentY + 62);

  addPageNumber(4);

  // Generate and return PDF blob
  return doc.output('blob');
}
