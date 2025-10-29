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
  testDurationSeconds?: number
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Brand colors matching the website theme
  const primaryBlue = [30, 58, 138]; // blue-900
  const accentBlue = [37, 99, 235]; // blue-600
  const lightGray = [243, 244, 246]; // gray-100
  const mediumGray = [107, 114, 128]; // gray-500
  const darkText = [17, 24, 39]; // gray-900

  // Helper function to get proficiency level
  const getProficiencyLevel = (score: number): string => {
    if (score >= 80) return 'Exceptional';
    if (score >= 60) return 'Proficient';
    if (score >= 40) return 'Developing';
    return 'Emerging';
  };

  // Helper function to get level color
  const getLevelColor = (score: number): number[] => {
    if (score >= 80) return [34, 197, 94]; // green-500
    if (score >= 60) return [59, 130, 246]; // blue-500
    if (score >= 40) return [251, 146, 60]; // orange-400
    return [239, 68, 68]; // red-500
  };

  // Helper function to add page number
  const addPageNumber = (pageNum: number) => {
    doc.setFontSize(9);
    doc.setTextColor(...mediumGray);
    doc.text(`Page ${pageNum} of 4`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  };

  // Helper function to add footer
  const addFooter = () => {
    doc.setDrawColor(...lightGray);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
    
    doc.setFontSize(8);
    doc.setTextColor(...mediumGray);
    doc.setFont('helvetica', 'normal');
    doc.text('Research by Venkat Ram Reddy Ganuthula & Krishna Kumar Balaraman', pageWidth / 2, pageHeight - 14, { align: 'center' });
    doc.text('School of Management and Entrepreneurship, IIT Jodhpur', pageWidth / 2, pageHeight - 10, { align: 'center' });
  };

  // ========== PAGE 1: RESULTS SUMMARY ==========
  // Enhanced header with deeper blue matching website
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('AIQ Assessment', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Certificate of Completion', pageWidth / 2, 38, { align: 'center' });

  doc.setFontSize(10);
  doc.text('Verification: ' + verificationCode, pageWidth / 2, 50, { align: 'center' });

  // User information section
  let currentY = 75;
  
  if (userName) {
    doc.setTextColor(...darkText);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(userName, pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;
  }

  // Date information
  doc.setTextColor(...mediumGray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Issued: ' + issueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), margin, currentY);
  doc.text('Valid Until: ' + expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - margin, currentY, { align: 'right' });
  currentY += 10;
  
  if (testDurationSeconds) {
    const minutes = Math.floor(testDurationSeconds / 60);
    const seconds = testDurationSeconds % 60;
    const durationText = 'Test Duration: ' + minutes + ' minutes ' + seconds + ' seconds';
    doc.text(durationText, pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;
  }

  // Overall Score - larger and more prominent
  const centerX = pageWidth / 2;
  const centerY = currentY + 35;
  const outerRadius = 32;

  // Outer circle (border)
  doc.setDrawColor(...accentBlue);
  doc.setLineWidth(4);
  doc.circle(centerX, centerY, outerRadius, 'S');

  // Score text - larger and bolder
  doc.setTextColor(...primaryBlue);
  doc.setFontSize(42);
  doc.setFont('helvetica', 'bold');
  doc.text(overallScore.toFixed(1), centerX, centerY - 2, { align: 'center', baseline: 'middle' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('AIQ Score', centerX, centerY + 12, { align: 'center', baseline: 'middle' });

  // Proficiency Level with colored badge
  const level = getProficiencyLevel(overallScore);
  const levelColor = getLevelColor(overallScore);
  
  currentY = centerY + outerRadius + 18;
  
  // Background badge for level
  doc.setFillColor(...levelColor);
  const levelText = level + ' AI Collaborator';
  const levelWidth = doc.getTextWidth(levelText) * 1.4;
  doc.roundedRect(centerX - levelWidth / 2, currentY - 6, levelWidth, 12, 2, 2, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(levelText, centerX, currentY, { align: 'center', baseline: 'middle' });

  // Interpretation text
  currentY += 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mediumGray);
  
  const interpretation = 'This score represents ' + level.toLowerCase() + ' proficiency in AI collaboration across eight research-validated dimensions. The assessment utilizes adaptive testing with Item Response Theory (IRT) to provide precise measurement of your AI collaboration capabilities.';
  
  const interpretationLines = doc.splitTextToSize(interpretation, pageWidth - 2 * margin - 20);
  doc.text(interpretationLines, centerX, currentY, { align: 'center', maxWidth: pageWidth - 2 * margin - 20 });

  // Top 3 Strengths - enhanced visual
  const topDimensions = [...dimensionScores].sort((a, b) => b.score - a.score).slice(0, 3);
  
  currentY += 25;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('Your Top Strengths', margin, currentY);

  currentY += 10;
  topDimensions.forEach((dim, idx) => {
    // Background box
    doc.setFillColor(...lightGray);
    doc.roundedRect(margin, currentY - 3, pageWidth - 2 * margin, 10, 1, 1, 'F');
    
    // Strength name and score
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkText);
    doc.text((idx + 1) + '. ' + dim.name, margin + 3, currentY + 3);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentBlue);
    doc.text(dim.score.toFixed(1), pageWidth - margin - 3, currentY + 3, { align: 'right' });
    
    currentY += 12;
  });

  addFooter();
  addPageNumber(1);

  // ========== PAGE 2: DIMENSION BREAKDOWN ==========
  doc.addPage();

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('Dimension Breakdown', margin, 30);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mediumGray);
  doc.text('Detailed performance across all eight AI collaboration dimensions', margin, 40);

  // Enhanced table with dimension scores
  autoTable(doc, {
    startY: 50,
    head: [['Dimension', 'Score', 'Proficiency Level']],
    body: dimensionScores.map(dim => [
      dim.name,
      dim.score.toFixed(1),
      getProficiencyLevel(dim.score)
    ]),
    theme: 'plain',
    headStyles: {
      fillColor: primaryBlue,
      fontSize: 11,
      fontStyle: 'bold',
      textColor: [255, 255, 255],
      halign: 'left',
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 5,
      textColor: darkText,
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    columnStyles: {
      0: { cellWidth: 100, fontStyle: 'bold' },
      1: { cellWidth: 30, halign: 'center', fontStyle: 'bold', textColor: accentBlue },
      2: { cellWidth: 40, halign: 'center' },
    },
    margin: { left: margin, right: margin },
  });

  // Visual performance bars
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('Visual Performance Overview', margin, finalY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mediumGray);
  doc.text('Your performance visualized across all dimensions', margin, finalY + 7);

  currentY = finalY + 15;
  
  dimensionScores.forEach((dim) => {
    const barMaxWidth = pageWidth - 2 * margin - 45;
    const barWidth = (dim.score / 100) * barMaxWidth;
    const barHeight = 8;

    // Dimension name - truncated if needed
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkText);
    const dimName = dim.name.length > 35 ? dim.name.substring(0, 32) + '...' : dim.name;
    doc.text(dimName, margin, currentY + 4);

    // Bar background
    doc.setFillColor(...lightGray);
    doc.roundedRect(margin, currentY + 6, barMaxWidth, barHeight, 1, 1, 'F');

    // Score bar with gradient effect (simulated with color)
    const barColor = getLevelColor(dim.score);
    doc.setFillColor(...barColor);
    if (barWidth > 0) {
      doc.roundedRect(margin, currentY + 6, barWidth, barHeight, 1, 1, 'F');
    }

    // Score text
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...barColor);
    doc.text(dim.score.toFixed(1), margin + barMaxWidth + 5, currentY + 11);
    
    currentY += 16;
  });

  addFooter();
  addPageNumber(2);

  // ========== PAGE 3: RESEARCH VALIDATION & AUTHENTICITY ==========
  doc.addPage();

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('Research & Validation', margin, 30);

  // Research Foundation
  currentY = 45;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkText);
  doc.text('Assessment Methodology', margin, currentY);

  currentY += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mediumGray);
  
  const foundationText = 'The AIQ Assessment is grounded in rigorous academic research on AI collaboration competencies. Built on Item Response Theory (IRT), this assessment provides:\n\n' +
    '- 400+ calibrated items across eight validated dimensions\n' +
    '- Adaptive difficulty selection based on individual response patterns\n' +
    '- Comprehensive psychometric validation through pilot studies\n' +
    '- Discrimination parameters ranging from 0.44 to 0.79\n' +
    '- Difficulty calibration across three proficiency levels\n' +
    '- Ten items per dimension selected adaptively for precision';

  const foundationLines = doc.splitTextToSize(foundationText, pageWidth - 2 * margin);
  doc.text(foundationLines, margin, currentY);

  // Certificate Authenticity section
  currentY = 115;
  
  // Background box for authenticity section
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin - 5, currentY - 5, pageWidth - 2 * margin + 10, 65, 2, 2, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('Certificate Verification', margin, currentY + 3);

  // Generate QR code
  const verificationUrl = window.location.origin + '/verify/' + verificationCode;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 200,
    margin: 1,
    color: {
      dark: '#1e3a8a', // primaryBlue
      light: '#ffffff',
    },
  });

  doc.addImage(qrDataUrl, 'PNG', margin, currentY + 8, 45, 45);

  const qrX = margin + 52;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mediumGray);
  doc.text('Unique Verification Code:', qrX, currentY + 15);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryBlue);
  doc.text(verificationCode, qrX, currentY + 23);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...mediumGray);
  doc.text('Scan the QR code or visit:', qrX, currentY + 32);
  
  doc.setTextColor(...accentBlue);
  doc.setFont('helvetica', 'normal');
  const urlLines = doc.splitTextToSize(verificationUrl, 85);
  doc.textWithLink(urlLines, qrX, currentY + 38, { url: verificationUrl });

  // Important Notice
  currentY = 185;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('Important Notice', margin, currentY);

  currentY += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mediumGray);
  
  const disclaimerText = 'This assessment measures AI collaboration capabilities at a specific point in time. Results should be interpreted alongside other evaluation methods and professional judgment. AI collaboration skills can be enhanced through deliberate practice, structured training, and ongoing experience. This certificate remains valid for twelve months from the issue date.';
  
  const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 2 * margin);
  doc.text(disclaimerLines, margin, currentY);

  // IRT Methodology explanation
  currentY += 25;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('About Item Response Theory', margin, currentY);

  currentY += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mediumGray);
  
  const methodText = 'Item Response Theory (IRT) is a contemporary psychometric framework that provides more precise ability estimates than classical test theory. IRT models the probability of correct responses based on both item difficulty and individual ability, enabling adaptive testing that selects optimal items for each respondent based on their demonstrated proficiency level.';
  
  const methodLines = doc.splitTextToSize(methodText, pageWidth - 2 * margin);
  doc.text(methodLines, margin, currentY);

  addFooter();
  addPageNumber(3);

  // ========== PAGE 4: DEVELOPMENT RESOURCES ==========
  doc.addPage();

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('Your Growth Path', margin, 30);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mediumGray);
  doc.text('Personalized recommendations for continued development', margin, 40);

  // Identify lowest scoring dimensions
  const lowestDimensions = [...dimensionScores].sort((a, b) => a.score - b.score).slice(0, 3);

  currentY = 55;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkText);
  doc.text('Focus Areas for Development', margin, currentY);

  currentY += 10;
  lowestDimensions.forEach((dim, idx) => {
    // Background box for each development area
    doc.setFillColor(...lightGray);
    doc.roundedRect(margin - 2, currentY - 3, pageWidth - 2 * margin + 4, 30, 2, 2, 'F');
    
    // Dimension name and score
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkText);
    doc.text((idx + 1) + '. ' + dim.name, margin + 2, currentY + 2);
    
    const scoreColor = getLevelColor(dim.score);
    doc.setTextColor(...scoreColor);
    doc.text('Current: ' + dim.score.toFixed(1), pageWidth - margin - 2, currentY + 2, { align: 'right' });
    
    // Development suggestions
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mediumGray);
    
    const resources = [
      '- Practice with AI tools in real-world scenarios',
      '- Engage in structured learning and training programs',
      '- Seek feedback from experienced practitioners',
    ];
    
    resources.forEach((resource, resIdx) => {
      doc.text(resource, margin + 5, currentY + 10 + resIdx * 5);
    });
    
    currentY += 35;
  });

  // Progress Tracking
  currentY += 5;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('Track Your Progress', margin, currentY);

  currentY += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mediumGray);
  
  const progressText = 'You may retake this assessment after thirty days to measure your improvement. We recommend focused practice in your identified development areas before retaking to observe meaningful growth in your AI collaboration capabilities.';
  const progressLines = doc.splitTextToSize(progressText, pageWidth - 2 * margin);
  doc.text(progressLines, margin, currentY);

  // Next Steps
  currentY += 20;
  
  // Background box for next steps
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(margin - 5, currentY - 5, pageWidth - 2 * margin + 10, 35, 2, 2, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('Next Steps', margin, currentY + 3);

  currentY += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  
  doc.text('1. Share your certificate with employers or on LinkedIn', margin + 3, currentY);
  doc.text('2. Focus on developing your identified growth areas', margin + 3, currentY + 6);
  doc.text('3. Revisit the assessment in 30 days to track improvement', margin + 3, currentY + 12);
  doc.text('4. Explore advanced AI collaboration training resources', margin + 3, currentY + 18);

  addFooter();
  addPageNumber(4);

  // Generate and return PDF blob
  return doc.output('blob');
}

  // User information section
  let currentY = 75;
  
  if (userName) {
    doc.setTextColor(...darkText);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(userName, pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;
  }

  // Date information
  doc.setTextColor(...mediumGray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Issued: ${issueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, currentY);
  doc.text(`Valid Until: ${expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 10;
  
  if (testDurationSeconds) {
    const minutes = Math.floor(testDurationSeconds / 60);
    const seconds = testDurationSeconds % 60;
    const durationText = `Test Duration: ${minutes} minutes ${seconds} seconds`;
    doc.text(durationText, pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;
  }

  // Overall Score - larger and more prominent
  const centerX = pageWidth / 2;
  const centerY = currentY + 35;
  const outerRadius = 32;
  const innerRadius = 28;

  // Outer circle (border)
  doc.setDrawColor(...accentBlue);
  doc.setLineWidth(4);
  doc.circle(centerX, centerY, outerRadius, 'S');

  // Score text - larger and bolder
  doc.setTextColor(...primaryBlue);
  doc.setFontSize(42);
  doc.setFont('helvetica', 'bold');
  doc.text(overallScore.toFixed(1), centerX, centerY - 2, { align: 'center', baseline: 'middle' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('AIQ Score', centerX, centerY + 12, { align: 'center', baseline: 'middle' });

  // Proficiency Level with colored badge
  const level = getProficiencyLevel(overallScore);
  const levelColor = getLevelColor(overallScore);
  
  currentY = centerY + outerRadius + 18;
  
  // Background badge for level
  doc.setFillColor(...levelColor);
  const levelText = `${level} AI Collaborator`;
  const levelWidth = doc.getTextWidth(levelText) * 1.4;
  doc.roundedRect(centerX - levelWidth / 2, currentY - 6, levelWidth, 12, 2, 2, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(levelText, centerX, currentY, { align: 'center', baseline: 'middle' });

  // Interpretation text
  currentY += 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mediumGray);
  
  const interpretation = `This score represents ${level.toLowerCase()} proficiency in AI collaboration across eight research-validated dimensions. The assessment utilizes adaptive testing with Item Response Theory (IRT) to provide precise measurement of your AI collaboration capabilities.`;
  
  const interpretationLines = doc.splitTextToSize(interpretation, pageWidth - 2 * margin - 20);
  doc.text(interpretationLines, centerX, currentY, { align: 'center', maxWidth: pageWidth - 2 * margin - 20 });

  // Top 3 Strengths - enhanced visual
  const topDimensions = [...dimensionScores].sort((a, b) => b.score - a.score).slice(0, 3);
  
  currentY += 25;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('Your Top Strengths', margin, currentY);

  currentY += 10;
  topDimensions.forEach((dim, idx) => {
    // Background box
    doc.setFillColor(...lightGray);
    doc.roundedRect(margin, currentY - 3, pageWidth - 2 * margin, 10, 1, 1, 'F');
    
    // Strength name and score
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkText);
    doc.text(`${idx + 1}. ${dim.name}`, margin + 3, currentY + 3);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentBlue);
    doc.text(dim.score.toFixed(1), pageWidth - margin - 3, currentY + 3, { align: 'right' });
    
    currentY += 12;
  });

  addFooter();
  addPageNumber(1);

  // ========== PAGE 2: DIMENSION BREAKDOWN ==========
  doc.addPage();

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('Dimension Breakdown', margin, 30);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mediumGray);
  doc.text('Detailed performance across all eight AI collaboration dimensions', margin, 40);

  // Enhanced table with dimension scores
  autoTable(doc, {
    startY: 50,
    head: [['Dimension', 'Score', 'Proficiency Level']],
    body: dimensionScores.map(dim => [
      dim.name,
      dim.score.toFixed(1),
      getProficiencyLevel(dim.score)
    ]),
    theme: 'plain',
    headStyles: {
      fillColor: primaryBlue,
      fontSize: 11,
      fontStyle: 'bold',
      textColor: [255, 255, 255],
      halign: 'left',
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 5,
      textColor: darkText,
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    columnStyles: {
      0: { cellWidth: 100, fontStyle: 'bold' },
      1: { cellWidth: 30, halign: 'center', fontStyle: 'bold', textColor: accentBlue },
      2: { cellWidth: 40, halign: 'center' },
    },
    margin: { left: margin, right: margin },
  });

  // Visual performance bars
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('Visual Performance Overview', margin, finalY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mediumGray);
  doc.text('Your performance visualized across all dimensions', margin, finalY + 7);

  currentY = finalY + 15;
  
  dimensionScores.forEach((dim, idx) => {
    const barMaxWidth = pageWidth - 2 * margin - 45;
    const barWidth = (dim.score / 100) * barMaxWidth;
    const barHeight = 8;

    // Dimension name - truncated if needed
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkText);
    const dimName = dim.name.length > 35 ? dim.name.substring(0, 32) + '...' : dim.name;
    doc.text(dimName, margin, currentY + 4);

    // Bar background
    doc.setFillColor(...lightGray);
    doc.roundedRect(margin, currentY + 6, barMaxWidth, barHeight, 1, 1, 'F');

    // Score bar with gradient effect (simulated with color)
    const barColor = getLevelColor(dim.score);
    doc.setFillColor(...barColor);
    if (barWidth > 0) {
      doc.roundedRect(margin, currentY + 6, barWidth, barHeight, 1, 1, 'F');
    }

    // Score text
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...barColor);
    doc.text(dim.score.toFixed(1), margin + barMaxWidth + 5, currentY + 11);
    
    currentY += 16;
  });

  addFooter();
  addPageNumber(2);

  // ========== PAGE 3: RESEARCH VALIDATION & AUTHENTICITY ==========
  doc.addPage();

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('Research & Validation', margin, 30);

  // Research Foundation
  currentY = 45;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkText);
  doc.text('Assessment Methodology', margin, currentY);

  currentY += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mediumGray);
  
  const foundationText = `The AIQ Assessment is grounded in rigorous academic research on AI collaboration competencies. Built on Item Response Theory (IRT), this assessment provides:

• 400+ calibrated items across eight validated dimensions
• Adaptive difficulty selection based on individual response patterns
• Comprehensive psychometric validation through pilot studies
• Discrimination parameters ranging from 0.44 to 0.79
• Difficulty calibration across three proficiency levels
• Ten items per dimension selected adaptively for precision`;

  const foundationLines = doc.splitTextToSize(foundationText, pageWidth - 2 * margin);
  doc.text(foundationLines, margin, currentY);

  // Certificate Authenticity section
  currentY = 115;
  
  // Background box for authenticity section
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin - 5, currentY - 5, pageWidth - 2 * margin + 10, 65, 2, 2, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('Certificate Verification', margin, currentY + 3);

  // Generate QR code
  const verificationUrl = `${window.location.origin}/verify/${verificationCode}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 200,
    margin: 1,
    color: {
      dark: '#1e3a8a', // primaryBlue
      light: '#ffffff',
    },
  });

  doc.addImage(qrDataUrl, 'PNG', margin, currentY + 8, 45, 45);

  const qrX = margin + 52;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mediumGray);
  doc.text('Unique Verification Code:', qrX, currentY + 15);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryBlue);
  doc.text(verificationCode, qrX, currentY + 23);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...mediumGray);
  doc.text('Scan the QR code or visit:', qrX, currentY + 32);
  
  doc.setTextColor(...accentBlue);
  doc.setFont('helvetica', 'normal');
  const urlLines = doc.splitTextToSize(verificationUrl, 85);
  doc.textWithLink(urlLines, qrX, currentY + 38, { url: verificationUrl });

  // Important Notice
  currentY = 185;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('Important Notice', margin, currentY);

  currentY += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mediumGray);
  
  const disclaimerText = `This assessment measures AI collaboration capabilities at a specific point in time. Results should be interpreted alongside other evaluation methods and professional judgment. AI collaboration skills can be enhanced through deliberate practice, structured training, and ongoing experience. This certificate remains valid for twelve months from the issue date.`;
  
  const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 2 * margin);
  doc.text(disclaimerLines, margin, currentY);

  // IRT Methodology explanation
  currentY += 25;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('About Item Response Theory', margin, currentY);

  currentY += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mediumGray);
  
  const methodText = `Item Response Theory (IRT) is a contemporary psychometric framework that provides more precise ability estimates than classical test theory. IRT models the probability of correct responses based on both item difficulty and individual ability, enabling adaptive testing that selects optimal items for each respondent based on their demonstrated proficiency level.`;
  
  const methodLines = doc.splitTextToSize(methodText, pageWidth - 2 * margin);
  doc.text(methodLines, margin, currentY);

  addFooter();
  addPageNumber(3);

  // ========== PAGE 4: DEVELOPMENT RESOURCES ==========
  doc.addPage();

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('Your Growth Path', margin, 30);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mediumGray);
  doc.text('Personalized recommendations for continued development', margin, 40);

  // Identify lowest scoring dimensions
  const lowestDimensions = [...dimensionScores].sort((a, b) => a.score - b.score).slice(0, 3);

  currentY = 55;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkText);
  doc.text('Focus Areas for Development', margin, currentY);

  currentY += 10;
  lowestDimensions.forEach((dim, idx) => {
    // Background box for each development area
    doc.setFillColor(...lightGray);
    doc.roundedRect(margin - 2, currentY - 3, pageWidth - 2 * margin + 4, 30, 2, 2, 'F');
    
    // Dimension name and score
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkText);
    doc.text(`${idx + 1}. ${dim.name}`, margin + 2, currentY + 2);
    
    const scoreColor = getLevelColor(dim.score);
    doc.setTextColor(...scoreColor);
    doc.text(`Current: ${dim.score.toFixed(1)}`, pageWidth - margin - 2, currentY + 2, { align: 'right' });
    
    // Development suggestions
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mediumGray);
    
    const resources = [
      'Practice with AI tools in real-world scenarios',
      'Engage in structured learning and training programs',
      'Seek feedback from experienced practitioners',
    ];
    
    resources.forEach((resource, resIdx) => {
      doc.text(`• ${resource}`, margin + 5, currentY + 10 + resIdx * 5);
    });
    
    currentY += 35;
  });

  // Progress Tracking
  currentY += 5;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('Track Your Progress', margin, currentY);

  currentY += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mediumGray);
  
  const progressText = `You may retake this assessment after thirty days to measure your improvement. We recommend focused practice in your identified development areas before retaking to observe meaningful growth in your AI collaboration capabilities.`;
  const progressLines = doc.splitTextToSize(progressText, pageWidth - 2 * margin);
  doc.text(progressLines, margin, currentY);

  // Next Steps
  currentY += 20;
  
  // Background box for next steps
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(margin - 5, currentY - 5, pageWidth - 2 * margin + 10, 35, 2, 2, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('Next Steps', margin, currentY + 3);

  currentY += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  
  doc.text('1. Share your certificate with employers or on LinkedIn', margin + 3, currentY);
  doc.text('2. Focus on developing your identified growth areas', margin + 3, currentY + 6);
  doc.text('3. Revisit the assessment in 30 days to track improvement', margin + 3, currentY + 12);
  doc.text('4. Explore advanced AI collaboration training resources', margin + 3, currentY + 18);

  addFooter();
  addPageNumber(4);

  // Generate and return PDF blob
  return doc.output('blob');
}