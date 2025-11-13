import type { AssessmentContext } from './assessmentUtils';

interface CaptionData {
  score: number;
  totalPossible: number;
  level: string;
  topDimensions: Array<{ name: string; score: number }>;
  verificationUrl: string;
  passed?: boolean;
  assessmentContext?: AssessmentContext;
}

export function generateCaption(data: CaptionData): string {
  const { score, totalPossible, topDimensions, verificationUrl, passed = true, assessmentContext } = data;

  const dimensionList = topDimensions
    .map((dim) => `✅ ${dim.name} (${dim.score.toFixed(1)})`)
    .join('\n');
  
  const percentage = (score / totalPossible) * 100;

  // Adolescent-specific captions
  if (assessmentContext?.isAdolescent) {
    if (!passed) {
      return `📚 Completed my ${assessmentContext.assessmentName}!

Scored ${score.toFixed(1)}/${totalPossible} points and learned so much about responsible AI use!

This assessment measures AI literacy across 8 key areas using student-friendly, research-validated methods.

Current strengths:
${dimensionList}

Excited to keep learning and growing my AI skills! 🚀

Verify: ${verificationUrl}

#StudentAchievement #AILiteracy #FutureReady #STEMEducation #AILearning`;
    }
    
    if (percentage >= 80) {
      return `🎓 Proud to share my ${assessmentContext.assessmentName} results!

Scored ${score.toFixed(1)}/${totalPossible} demonstrating strong AI literacy skills!

This comprehensive assessment measures understanding across 8 dimensions of responsible AI use for students.

Top strengths:
${dimensionList}

Ready to apply these skills in school projects and future learning! 🌟

Verify: ${verificationUrl}

#StudentSuccess #AILiteracy #FutureReady #STEMEducation #AIForStudents`;
    }
    
    if (percentage >= 60) {
      return `📊 Completed my ${assessmentContext.assessmentName}!

Scored ${score.toFixed(1)}/${totalPossible} and gained valuable insights into AI collaboration!

Learning how to use AI responsibly and effectively is an important 21st century skill.

Key strengths:
${dimensionList}

Excited to continue developing these capabilities! 💪

Verify: ${verificationUrl}

#StudentLearning #AILiteracy #FutureSkills #Education #AIForStudents`;
    }
    
    return `🌱 Took my ${assessmentContext.assessmentName} to learn about AI!

Scored ${score.toFixed(1)}/${totalPossible} and discovered areas where I can grow.

Current strengths:
${dimensionList}

Every expert started as a beginner. Looking forward to developing these important skills! 🚀

Verify: ${verificationUrl}

#LearningJourney #AILiteracy #StudentGrowth #Education #AIForStudents`;
  }
  
  // Role-specific captions
  if (assessmentContext?.type === 'role-specific') {
    const roleName = assessmentContext.role || 'Professional';
    
    if (percentage >= 80) {
      return `🌟 Thrilled to share my ${assessmentContext.assessmentName} results!

Scored ${score.toFixed(1)}/${totalPossible} demonstrating advanced ${roleName} AI collaboration skills.

This role-specific assessment measures real-world AI capabilities across 8 research-validated dimensions tailored for ${roleName} professionals.

Top strengths:
${dimensionList}

Proud to validate my expertise in this rapidly evolving field!

Verify: ${verificationUrl}

#AIQ #${roleName}AI #ProfessionalDevelopment #AIExcellence #FutureOfWork`;
    }
    
    if (percentage >= 60) {
      return `🎯 Just completed the ${assessmentContext.assessmentName}!

Scored ${score.toFixed(1)}/${totalPossible} as a ${roleName} AI Collaborator. This specialized assessment evaluates role-specific AI competencies using research-backed methods.

Top strengths:
${dimensionList}

Excited to continue developing these critical ${roleName} AI skills!

Verify: ${verificationUrl}

#${roleName} #AICollaboration #ProfessionalGrowth #AISkills`;
    }
    
    return `📈 Completed the ${assessmentContext.assessmentName} to benchmark my AI collaboration skills!

Scored ${score.toFixed(1)}/${totalPossible}. Ready to enhance these ${roleName}-specific capabilities as AI transforms our field.

Key focus areas:
${dimensionList}

Taking intentional steps to grow in this critical skill area!

Verify: ${verificationUrl}

#${roleName} #AILearning #SkillDevelopment #AICollaboration`;
  }

  // General assessment captions (original logic)
  // For non-passing users, focus on progress and learning journey
  if (!passed) {
    return `📊 Completed my AIQ Assessment™ and scored ${score.toFixed(1)}/${totalPossible} (${data.level} level)!

This comprehensive assessment measures AI collaboration skills across 8 research-validated dimensions using psychometric methodologies.

Current strengths:
${dimensionList}

Working on continuous improvement in my AI collaboration journey! Every expert was once a beginner. 🚀

Verify my results: ${verificationUrl}

#AILearning #SkillDevelopment #ContinuousImprovement #AICollaboration #ProfessionalGrowth`;
  }
  
  if (percentage >= 80) {
    return `🌟 Thrilled to share my AIQ Assessment™ results!

Scored ${score.toFixed(1)}/${totalPossible} as an Exceptional AI Collaborator across 8 research-validated dimensions.

This assessment measures real-world AI collaboration skills using 400 psychometrically calibrated items and adaptive Item Response Theory (IRT) methodology.

Top strengths:
${dimensionList}

Proud to validate my expertise in this rapidly evolving field!

Verify my results: ${verificationUrl}

#AIQ #AIExcellence #ProfessionalDevelopment #ArtificialIntelligence #FutureOfWork`;
  }

  if (percentage >= 60) {
    return `🎯 Just completed the AIQ Assessment™!

Scored ${score.toFixed(1)}/${totalPossible} as a Proficient AI Collaborator. This comprehensive test evaluates 8 key dimensions of AI collaboration competency using research-backed psychometric methods.

Excited to continue developing these critical skills as AI becomes integral to every profession.

Top strengths:
${dimensionList}

Verify my results: ${verificationUrl}

#AICollaboration #ContinuousLearning #ProfessionalGrowth #AISkills`;
  }

  if (percentage >= 40) {
    return `📈 Completed the AIQ Assessment™ to benchmark my AI collaboration skills!

Scored ${score.toFixed(1)}/${totalPossible} as a Developing AI Collaborator across 8 dimensions. Ready to enhance these capabilities as AI transforms the workplace.

Key focus areas:
${dimensionList}

Taking intentional steps to grow in this critical skill area!

Verify my results: ${verificationUrl}

#AILearning #SkillDevelopment #GrowthMindset #AICollaboration`;
  }

  return `🌱 Started my AI collaboration journey with the AIQ Assessment™!

Scored ${score.toFixed(1)}/${totalPossible} as an Emerging AI Collaborator. Excited to develop these essential skills for the AI-powered future of work.

Current strengths:
${dimensionList}

Every expert was once a beginner. Looking forward to growing these capabilities!

Verify my results: ${verificationUrl}

#AILearning #SkillBuilding #ProfessionalGrowth #AICollaboration`;
}
