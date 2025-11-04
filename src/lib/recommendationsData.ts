/**
 * Research-aligned recommendation sets for each AIQ dimension
 * Based on "Artificial Intelligence Quotient Framework" by Ganuthula & Balaraman (2025)
 * 
 * Structure: 72 unique recommendation sets (8 dimensions × 3 assessment levels × 3 performance tiers)
 */

// Dimension Names - Aligned with Research Paper
export const dimensionNames: { [key: string]: string } = {
  SAU: "Strategic AI Understanding",
  QFP: "Prompt Engineering Intelligence",
  IPT: "Critical Evaluation Capability",
  CTR: "Integration Intelligence",
  TAS: "Adaptive Learning Capability",
  ETH: "Ethical Judgment in AI Utilization",
  ADA: "Context Sensitivity",
  COL: "Creative Synthesis",
};

// Performance-Tiered Recommendations Structure
type PerformanceTier = "low" | "medium" | "high";
type AssessmentLevel = "beginner" | "professional" | "expert";

interface TieredRecommendations {
  [dimensionCode: string]: {
    [level in AssessmentLevel]: {
      [tier in PerformanceTier]: string[];
    };
  };
}

// Comprehensive Tiered Recommendations (72 unique sets)
export const tieredRecommendations: TieredRecommendations = {
  SAU: {
    beginner: {
      low: [
        "Start by exploring what AI can and cannot do through hands-on experimentation with basic AI tools",
        "Learn to identify when tasks are suitable for AI assistance versus when human judgment is essential",
        "Practice recognizing AI limitations by testing AI tools with different types of questions and problems"
      ],
      medium: [
        "Study the underlying mechanisms of common AI systems to better understand their strengths",
        "Develop the ability to match specific AI capabilities to appropriate workplace scenarios",
        "Build awareness of AI reliability factors and when to apply additional verification steps"
      ],
      high: [
        "Create mental models for different AI system types and their optimal use cases",
        "Master the art of decomposing complex problems into AI-suitable and human-suitable components",
        "Advance to understanding how AI performance varies across different contexts and data types"
      ]
    },
    professional: {
      low: [
        "Implement systematic approaches to validate AI system outputs before trusting them in professional contexts",
        "Develop frameworks for assessing AI capabilities against your specific domain requirements",
        "Learn to identify edge cases where AI systems may underperform in your field"
      ],
      medium: [
        "Create domain-specific guidelines for when to delegate tasks to AI versus retain human control",
        "Build expertise in recognizing patterns of AI success and failure within your industry",
        "Establish validation protocols for AI-generated insights before applying them to critical decisions"
      ],
      high: [
        "Design comprehensive AI capability assessment frameworks for your organization",
        "Mentor others in developing accurate mental models of AI system strengths and limitations",
        "Lead initiatives to document AI performance patterns across various organizational use cases"
      ]
    },
    expert: {
      low: [
        "Engage with research on AI system architectures to deepen understanding of fundamental capabilities",
        "Contribute to organizational knowledge bases documenting AI reliability across contexts",
        "Develop expertise in communicating AI limitations to stakeholders at various technical levels"
      ],
      medium: [
        "Create advanced frameworks for evaluating emerging AI technologies against organizational needs",
        "Design validation methodologies for high-stakes AI applications in your domain",
        "Publish insights on AI capability patterns within your field to advance industry understanding"
      ],
      high: [
        "Pioneer approaches to AI safety and reliability assessment in critical applications",
        "Shape industry standards for AI capability evaluation and deployment best practices",
        "Lead research initiatives exploring the boundaries of AI system performance in your domain"
      ]
    }
  },
  QFP: {
    beginner: {
      low: [
        "Learn basic prompt structure: clear instructions, specific context, and desired output format",
        "Practice writing prompts with concrete examples of what you want the AI to produce",
        "Start with simple, direct queries and observe how AI responds to different phrasing"
      ],
      medium: [
        "Study effective prompt patterns and templates commonly used in your domain",
        "Develop skills in providing relevant context and constraints to guide AI responses",
        "Practice iterative prompt refinement by analyzing which modifications improve output quality"
      ],
      high: [
        "Master advanced prompting techniques like chain-of-thought reasoning and few-shot learning",
        "Create reusable prompt templates for common tasks in your work",
        "Experiment with prompt engineering strategies to handle complex, multi-step requests"
      ]
    },
    professional: {
      low: [
        "Focus on mastering prompt structure with clear instructions and comprehensive context provision",
        "Build a library of effective prompts for recurring professional tasks",
        "Learn to diagnose why prompts fail and systematically improve them"
      ],
      medium: [
        "Develop expertise in crafting domain-specific prompts that leverage AI capabilities effectively",
        "Master techniques for constraining AI outputs to meet professional standards and requirements",
        "Create standardized prompting guidelines for your team to ensure consistent AI interaction quality"
      ],
      high: [
        "Design sophisticated prompt architectures for complex, multi-stage professional workflows",
        "Train colleagues in advanced prompt engineering techniques specific to your industry",
        "Innovate novel prompting methodologies that push the boundaries of AI task performance"
      ]
    },
    expert: {
      low: [
        "Study cutting-edge research on prompt engineering and large language model behavior",
        "Develop systematic frameworks for prompt optimization in high-stakes applications",
        "Build expertise in prompt security and preventing unintended AI behaviors"
      ],
      medium: [
        "Create advanced prompt engineering methodologies for specialized domain applications",
        "Research and document optimal prompting strategies for emerging AI model architectures",
        "Design training programs to elevate organizational prompt engineering capabilities"
      ],
      high: [
        "Pioneer novel prompt engineering techniques that advance the field's state of the art",
        "Publish research on prompt optimization strategies for critical professional applications",
        "Lead industry initiatives to establish prompt engineering best practices and standards"
      ]
    }
  },
  IPT: {
    beginner: {
      low: [
        "Learn basic fact-checking methods to verify AI-generated information against reliable sources",
        "Develop awareness of common AI errors like factual inaccuracies and logical inconsistencies",
        "Practice questioning AI outputs rather than accepting them at face value"
      ],
      medium: [
        "Study common bias patterns in AI systems and learn to identify them in outputs",
        "Build systematic verification routines for different types of AI-generated content",
        "Develop critical thinking skills specific to evaluating AI reasoning and conclusions"
      ],
      high: [
        "Master techniques for detecting subtle biases and limitations in AI responses",
        "Create personal frameworks for assessing AI output reliability in various contexts",
        "Learn to cross-reference AI outputs with domain knowledge to catch inaccuracies"
      ]
    },
    professional: {
      low: [
        "Implement verification protocols for AI outputs before using them in professional decisions",
        "Develop domain-specific checklists for evaluating AI-generated content quality",
        "Learn to identify when AI outputs require additional expert review before application"
      ],
      medium: [
        "Design comprehensive evaluation frameworks for AI outputs in your professional domain",
        "Build expertise in detecting domain-specific biases and errors in AI-generated work",
        "Create verification standards that balance thoroughness with practical efficiency"
      ],
      high: [
        "Lead the development of organizational standards for AI output validation",
        "Train teams in sophisticated evaluation techniques for detecting AI limitations",
        "Design audit systems that ensure consistent quality control of AI-assisted work"
      ]
    },
    expert: {
      low: [
        "Study research on AI bias detection and develop expertise in systematic evaluation methods",
        "Create advanced frameworks for assessing AI reliability in critical applications",
        "Build knowledge of AI failure modes specific to high-stakes professional contexts"
      ],
      medium: [
        "Develop innovative evaluation methodologies for emerging AI technologies in your field",
        "Design validation systems for AI applications where errors have significant consequences",
        "Contribute to academic or industry research on AI output verification best practices"
      ],
      high: [
        "Pioneer evaluation frameworks for AI systems in safety-critical or regulated domains",
        "Shape industry standards for AI output validation and quality assurance",
        "Lead research on detecting and mitigating sophisticated AI biases in professional applications"
      ]
    }
  },
  CTR: {
    beginner: {
      low: [
        "Start with simple task delegation: identify routine tasks that AI can handle independently",
        "Learn to review and refine AI outputs rather than using them directly without modification",
        "Practice combining your judgment with AI suggestions to produce better outcomes"
      ],
      medium: [
        "Develop workflows that strategically divide work between human and AI capabilities",
        "Learn to use AI outputs as starting points that you enhance with human expertise",
        "Build skills in knowing when to override AI suggestions based on contextual understanding"
      ],
      high: [
        "Master the art of designing human-AI collaborative processes for complex tasks",
        "Create efficient workflows where AI handles data-intensive work while you focus on strategy",
        "Develop expertise in leveraging AI as a cognitive amplifier for your professional capabilities"
      ]
    },
    professional: {
      low: [
        "Implement systematic approaches to task decomposition for human-AI collaboration",
        "Develop clear criteria for which aspects of projects should involve AI assistance",
        "Learn to maintain decision authority while effectively leveraging AI analytical capabilities"
      ],
      medium: [
        "Design sophisticated workflows that optimize the division of labor between human and AI",
        "Build expertise in orchestrating AI tools as cognitive amplifiers for professional tasks",
        "Create integration patterns that preserve human judgment in critical decision points"
      ],
      high: [
        "Architect enterprise-scale human-AI collaborative systems for your organization",
        "Lead initiatives to redesign professional workflows around optimal human-AI integration",
        "Develop innovative approaches to human-AI teaming that maximize synergistic benefits"
      ]
    },
    expert: {
      low: [
        "Study advanced theories of distributed cognition applied to human-AI collaboration",
        "Develop frameworks for optimizing cognitive load distribution between humans and AI",
        "Build expertise in designing integration patterns for specialized professional domains"
      ],
      medium: [
        "Create cutting-edge models for human-AI cognitive partnerships in complex domains",
        "Research and document best practices for maintaining human agency in AI-integrated work",
        "Design training programs that develop advanced integration intelligence across organizations"
      ],
      high: [
        "Pioneer new paradigms for human-AI collaboration that redefine professional practices",
        "Shape industry understanding of optimal human-AI cognitive integration strategies",
        "Lead research on maximizing the synergistic potential of human-AI partnerships"
      ]
    }
  },
  TAS: {
    beginner: {
      low: [
        "Start tracking what works and doesn't work in your AI interactions to build learning patterns",
        "Develop the habit of reflecting on AI collaboration experiences to identify improvement areas",
        "Learn from both successful and unsuccessful AI interactions to refine your approach"
      ],
      medium: [
        "Create a systematic process for reviewing and improving your AI collaboration strategies",
        "Build a personal knowledge base of effective AI interaction patterns in your work",
        "Practice adapting your approach based on feedback from AI interaction outcomes"
      ],
      high: [
        "Develop sophisticated learning loops that continuously enhance your AI collaboration skills",
        "Master the ability to quickly adapt strategies when working with new AI tools or contexts",
        "Create frameworks for documenting and sharing AI collaboration best practices"
      ]
    },
    professional: {
      low: [
        "Implement structured reflection practices to learn from professional AI interactions",
        "Develop systematic approaches to identifying and correcting ineffective AI use patterns",
        "Build expertise in recognizing when strategy adjustments are needed in AI collaboration"
      ],
      medium: [
        "Design organizational learning systems that capture AI collaboration insights",
        "Create feedback mechanisms that drive continuous improvement in AI utilization strategies",
        "Develop expertise in coaching others to improve their AI collaboration approaches"
      ],
      high: [
        "Lead the development of organizational AI collaboration capability building programs",
        "Design advanced learning frameworks that accelerate AI collaboration skill development",
        "Create cultures of continuous improvement in human-AI collaboration practices"
      ]
    },
    expert: {
      low: [
        "Study research on experiential learning theory applied to human-AI collaboration",
        "Develop frameworks for systematic improvement of AI collaboration strategies over time",
        "Build expertise in identifying and addressing barriers to AI collaboration learning"
      ],
      medium: [
        "Create innovative learning methodologies for developing AI collaboration expertise",
        "Design assessment tools that measure and track AI collaboration skill development",
        "Research and document optimal learning pathways for different professional contexts"
      ],
      high: [
        "Pioneer new models of adaptive learning in the context of evolving AI technologies",
        "Shape educational standards for developing AI collaboration capabilities",
        "Lead research on accelerating human adaptation to increasingly sophisticated AI systems"
      ]
    }
  },
  ETH: {
    beginner: {
      low: [
        "Learn basic ethical principles relevant to AI use: privacy, fairness, and transparency",
        "Develop awareness of potential negative impacts when using AI for decisions affecting people",
        "Practice considering the ethical implications before deploying AI in personal or work contexts"
      ],
      medium: [
        "Study common ethical issues in AI applications relevant to your field",
        "Build frameworks for identifying when AI use raises ethical concerns requiring attention",
        "Develop skills in recognizing bias and fairness issues in AI-assisted decisions"
      ],
      high: [
        "Master the ability to conduct ethical analyses of AI applications in various contexts",
        "Create decision frameworks that incorporate ethical considerations into AI adoption choices",
        "Learn to advocate for responsible AI use within your sphere of influence"
      ]
    },
    professional: {
      low: [
        "Implement ethical review processes for AI applications in professional contexts",
        "Develop expertise in identifying privacy, bias, and fairness risks in AI deployments",
        "Learn to balance AI efficiency benefits with ethical considerations and risks"
      ],
      medium: [
        "Design comprehensive ethical frameworks for AI use within your organization",
        "Build capabilities in conducting impact assessments for AI applications on stakeholders",
        "Create guidelines that ensure ethical AI use across professional practices"
      ],
      high: [
        "Lead organizational initiatives to embed ethical considerations into AI adoption processes",
        "Develop sophisticated approaches to managing complex ethical dilemmas in AI applications",
        "Champion responsible AI use and influence organizational policies and practices"
      ]
    },
    expert: {
      low: [
        "Study cutting-edge research on AI ethics and develop deep expertise in ethical frameworks",
        "Build advanced capabilities in identifying subtle ethical issues in AI system design",
        "Develop thought leadership on ethical AI use within your professional domain"
      ],
      medium: [
        "Create innovative ethical frameworks for emerging AI technologies and applications",
        "Design organizational ethics governance systems for AI use across diverse contexts",
        "Contribute to academic or industry discourse on AI ethics best practices"
      ],
      high: [
        "Pioneer ethical frameworks that shape industry standards and regulatory approaches",
        "Lead policy development initiatives for responsible AI use in critical domains",
        "Influence societal understanding of ethical AI deployment through research and advocacy"
      ]
    }
  },
  ADA: {
    beginner: {
      low: [
        "Learn to recognize how different contexts require different approaches to AI use",
        "Develop awareness of organizational policies and constraints affecting AI adoption",
        "Practice adapting AI tools to fit specific situational requirements"
      ],
      medium: [
        "Study how cultural and organizational factors influence effective AI implementation",
        "Build skills in customizing AI approaches to match workplace norms and expectations",
        "Develop sensitivity to context-specific factors that impact AI effectiveness"
      ],
      high: [
        "Master the ability to tailor AI strategies to diverse organizational and cultural contexts",
        "Create context-appropriate implementation plans for AI tools and workflows",
        "Learn to navigate organizational constraints while maximizing AI value"
      ]
    },
    professional: {
      low: [
        "Implement systematic approaches to assessing contextual factors before AI deployment",
        "Develop frameworks for adapting AI solutions to organizational culture and constraints",
        "Build expertise in recognizing when context requires modified AI implementation approaches"
      ],
      medium: [
        "Design context-sensitive AI adoption strategies for diverse organizational environments",
        "Create methodologies for assessing readiness and fit of AI solutions in specific contexts",
        "Develop skills in navigating complex organizational and cultural factors in AI projects"
      ],
      high: [
        "Lead organization-wide initiatives to implement context-aware AI adoption frameworks",
        "Design sophisticated approaches to adapting AI across diverse business units and cultures",
        "Champion context-sensitive AI implementation practices that drive successful outcomes"
      ]
    },
    expert: {
      low: [
        "Study research on contextual intelligence and its application to AI adoption",
        "Develop advanced frameworks for context assessment in AI deployment scenarios",
        "Build expertise in identifying subtle contextual factors that impact AI success"
      ],
      medium: [
        "Create innovative approaches to context-aware AI implementation across industries",
        "Design assessment tools for evaluating contextual fit of AI technologies",
        "Contribute research on cultural and organizational factors in AI adoption success"
      ],
      high: [
        "Pioneer context-aware AI adoption frameworks that influence industry practices",
        "Shape understanding of how contextual factors determine AI implementation success",
        "Lead research on optimizing AI solutions for diverse global and organizational contexts"
      ]
    }
  },
  COL: {
    beginner: {
      low: [
        "Start experimenting with using AI for basic creative tasks and problem-solving",
        "Learn to combine AI-generated ideas with your own creativity to develop solutions",
        "Practice using AI as a brainstorming partner to explore new possibilities"
      ],
      medium: [
        "Develop skills in leveraging AI capabilities to enhance creative problem-solving",
        "Build expertise in using AI to explore solution spaces you wouldn't consider alone",
        "Create workflows that use AI to augment rather than replace human creativity"
      ],
      high: [
        "Master the art of creative synthesis by combining AI insights with human innovation",
        "Develop sophisticated approaches to using AI as a catalyst for novel solutions",
        "Learn to push AI capabilities in creative directions through strategic interaction"
      ]
    },
    professional: {
      low: [
        "Implement AI-augmented ideation processes in professional creative work",
        "Develop frameworks for using AI to explore unconventional solutions to business challenges",
        "Build skills in synthesizing AI-generated possibilities into actionable innovations"
      ],
      medium: [
        "Design innovative workflows that leverage AI for creative problem-solving at scale",
        "Create methodologies for combining AI analytical power with human creative insight",
        "Develop expertise in using AI to unlock novel approaches to professional challenges"
      ],
      high: [
        "Lead initiatives that transform how organizations leverage AI for innovation",
        "Pioneer approaches to AI-augmented creativity that drive breakthrough solutions",
        "Create frameworks that maximize the creative synergy between human and AI capabilities"
      ]
    },
    expert: {
      low: [
        "Study research on computational creativity and human-AI creative collaboration",
        "Develop advanced frameworks for leveraging AI in creative problem-solving processes",
        "Build expertise in identifying AI capabilities that can unlock creative breakthroughs"
      ],
      medium: [
        "Create innovative methodologies for AI-augmented creative synthesis in specialized domains",
        "Design frameworks that systematically leverage AI for novel solution development",
        "Contribute research on maximizing creative potential through human-AI collaboration"
      ],
      high: [
        "Pioneer new paradigms for AI-enhanced creative synthesis with field-wide impact",
        "Shape industry understanding of how AI can amplify human creative capabilities",
        "Lead research on breakthrough applications of AI in creative problem-solving domains"
      ]
    }
  }
};

// Legacy exports for backward compatibility (deprecated - use tieredRecommendations)
export const beginnerRecommendations: { [key: string]: string[] } = {};
export const professionalRecommendations: { [key: string]: string[] } = {};
export const expertRecommendations: { [key: string]: string[] } = {};
