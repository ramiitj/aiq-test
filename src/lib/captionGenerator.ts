interface CaptionData {
  score: number;
  level: string;
  topDimensions: Array<{ name: string; score: number }>;
  verificationUrl: string;
  percentile?: number | null;
}

export function generateCaption(data: CaptionData): string {
  const { score, topDimensions, verificationUrl, percentile } = data;

  const dimensionList = topDimensions
    .map((dim) => `✅ ${dim.name} (${dim.score.toFixed(1)})`)
    .join('\n');

  const percentileText = percentile !== null && percentile !== undefined
    ? `\n\n📊 Ranking: Top ${(100 - percentile).toFixed(0)}% (${percentile.toFixed(1)}th percentile)`
    : '';

  if (score >= 80) {
    return `🌟 Thrilled to share my AIQ Assessment™ results!

Scored ${score.toFixed(1)}/100 as an Exceptional AI Collaborator across 8 research-validated dimensions.

This assessment measures real-world AI collaboration skills using 400 psychometrically calibrated items and adaptive Item Response Theory (IRT) methodology.

Top strengths:
${dimensionList}${percentileText}

Proud to validate my expertise in this rapidly evolving field!

Verify my results: ${verificationUrl}

#AIQ #AIExcellence #ProfessionalDevelopment #ArtificialIntelligence #FutureOfWork`;
  }

  if (score >= 60) {
    return `🎯 Just completed the AIQ Assessment™!

Scored ${score.toFixed(1)}/100 as a Proficient AI Collaborator. This comprehensive test evaluates 8 key dimensions of AI collaboration competency using research-backed psychometric methods.

Excited to continue developing these critical skills as AI becomes integral to every profession.

Top strengths:
${dimensionList}

Verify my results: ${verificationUrl}

#AICollaboration #ContinuousLearning #ProfessionalGrowth #AISkills`;
  }

  if (score >= 40) {
    return `📈 Completed the AIQ Assessment™ to benchmark my AI collaboration skills!

Scored ${score.toFixed(1)}/100 as a Developing AI Collaborator across 8 dimensions. Ready to enhance these capabilities as AI transforms the workplace.

Key focus areas:
${dimensionList}

Taking intentional steps to grow in this critical skill area!

Verify my results: ${verificationUrl}

#AILearning #SkillDevelopment #GrowthMindset #AICollaboration`;
  }

  return `🌱 Started my AI collaboration journey with the AIQ Assessment™!

Scored ${score.toFixed(1)}/100 as an Emerging AI Collaborator. Excited to develop these essential skills for the AI-powered future of work.

Current strengths:
${dimensionList}

Every expert was once a beginner. Looking forward to growing these capabilities!

Verify my results: ${verificationUrl}

#AILearning #SkillBuilding #ProfessionalGrowth #AICollaboration`;
}
