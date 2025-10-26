interface SocialMediaImageData {
  score: number;
  level: string;
  verificationCode: string;
  dimensions: Array<{ name: string; score: number }>;
  verificationUrl: string;
}

export async function generateSocialMediaImage(data: SocialMediaImageData): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d')!;

  // Load Inter font
  try {
    const font = new FontFace(
      'Inter',
      'url(https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap)'
    );
    await font.load();
    document.fonts.add(font);
  } catch (error) {
    console.warn('Failed to load Inter font, using fallback');
  }

  // Draw gradient background (blue theme)
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, '#3B82F6'); // primary blue
  gradient.addColorStop(1, '#60A5FA'); // lighter blue
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);

  // Add subtle pattern overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      ctx.fillRect(i * 120, j * 63, 60, 31);
    }
  }

  // Draw header text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 28px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AIQ Assessment™ Results', 600, 60);

  // Draw decorative line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(400, 80);
  ctx.lineTo(800, 80);
  ctx.stroke();

  // Draw circular badge
  const badgeX = 600;
  const badgeY = 220;
  const badgeRadius = 90;

  // Badge shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 10;

  // Badge circle
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();

  // Badge border
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Draw score in badge
  ctx.fillStyle = '#3B82F6';
  ctx.font = 'bold 64px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.score.toFixed(1), badgeX, badgeY + 10);

  // Draw "AIQ" text in badge
  ctx.font = '600 20px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#6B7280';
  ctx.fillText('AIQ', badgeX, badgeY + 40);

  // Draw proficiency level
  ctx.fillStyle = 'white';
  ctx.font = 'bold 32px Inter, system-ui, sans-serif';
  ctx.fillText(data.level, 600, 350);

  // Draw top 3 dimensions
  const topDimensions = data.dimensions.slice(0, 3);
  ctx.font = '600 18px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = 'white';

  topDimensions.forEach((dim, idx) => {
    const y = 400 + idx * 35;
    ctx.fillText(`✓ ${dim.name}`, 320, y);
    
    // Draw score
    ctx.textAlign = 'right';
    ctx.fillText(`${dim.score.toFixed(1)}`, 880, y);
    ctx.textAlign = 'left';
  });

  // Draw "plus more" text
  const remainingCount = data.dimensions.length - 3;
  if (remainingCount > 0) {
    ctx.font = '400 16px Inter, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.textAlign = 'center';
    ctx.fillText(`+ ${remainingCount} more dimensions`, 600, 515);
  }

  // Draw verification section
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '600 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`Verify: ${data.verificationCode}`, 600, 570);

  // Draw verification URL
  ctx.font = '400 14px Inter, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  const urlText = data.verificationUrl.replace('https://', '');
  ctx.fillText(urlText, 600, 595);

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image'));
        }
      },
      'image/png',
      0.95
    );
  });
}

export function getLevelText(score: number): string {
  if (score >= 80) return '🌟 Exceptional AI Collaborator';
  if (score >= 60) return '🎯 Proficient AI Collaborator';
  if (score >= 40) return '📈 Developing AI Collaborator';
  return '🌱 Emerging AI Collaborator';
}
