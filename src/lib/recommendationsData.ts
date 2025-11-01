/**
 * Recommendation sets for each AIQ dimension across different performance levels
 */

export const beginnerRecommendations: { [key: string]: string[] } = {
  "SAU": [
    "Start by understanding AI limitations - practice identifying when AI-generated responses might be incomplete or biased",
    "Learn to verify AI outputs by cross-checking facts and claims with reliable sources",
    "Develop awareness of common AI errors such as hallucinations, outdated information, or contextual misunderstandings"
  ],
  "QFP": [
    "Practice breaking down complex problems into specific, clear questions that AI can effectively address",
    "Learn to provide context in your prompts - include relevant background information and desired output format",
    "Experiment with different phrasings of the same question to understand how prompt structure affects AI responses"
  ],
  "IPT": [
    "Start iterating on AI responses by asking follow-up questions to refine and improve initial outputs",
    "Learn to identify gaps or weaknesses in AI-generated content and prompt for improvements",
    "Practice providing feedback to AI by pointing out specific issues and requesting targeted corrections"
  ],
  "CTR": [
    "Begin thinking critically about AI suggestions - don't accept them at face value without evaluation",
    "Develop a habit of questioning the reasoning behind AI responses and looking for potential biases",
    "Practice comparing multiple AI-generated solutions to identify the most appropriate option"
  ],
  "TAS": [
    "Learn to break down your workflow into discrete tasks that can be delegated to AI tools",
    "Start with simple automation - identify repetitive tasks that AI can handle effectively",
    "Experiment with AI for basic content generation, data organization, or information summarization"
  ],
  "ETH": [
    "Familiarize yourself with basic AI ethics principles including fairness, transparency, and accountability",
    "Learn to recognize potential ethical issues in AI use such as privacy violations or bias amplification",
    "Develop awareness of when human oversight is necessary to prevent AI-related harms"
  ],
  "ADA": [
    "Start exploring different AI tools to understand their varying capabilities and limitations",
    "Learn to choose appropriate AI tools based on task requirements and context",
    "Practice adapting your communication style when working with different AI systems"
  ],
  "COL": [
    "Begin sharing AI-generated insights with team members and gathering feedback",
    "Learn to document your AI workflows so others can replicate successful approaches",
    "Practice explaining AI capabilities and limitations to colleagues who may be less familiar"
  ]
};

export const professionalRecommendations: { [key: string]: string[] } = {
  "SAU": [
    "Develop systematic approaches to validate AI outputs across different domains and use cases",
    "Build expertise in recognizing subtle AI errors and implementing verification workflows",
    "Create personal guidelines for when to trust AI responses and when additional verification is needed"
  ],
  "QFP": [
    "Master advanced prompting techniques including chain-of-thought reasoning and few-shot learning",
    "Develop expertise in crafting prompts that elicit specific formats, tones, and levels of detail",
    "Build a personal library of effective prompt templates for common professional tasks"
  ],
  "IPT": [
    "Develop sophisticated iteration strategies involving multi-turn conversations with strategic refinement",
    "Learn to guide AI through complex problem-solving by breaking solutions into manageable steps",
    "Build skills in recognizing when to pivot approaches versus when to continue refining current outputs"
  ],
  "CTR": [
    "Strengthen analytical skills to evaluate AI reasoning quality and identify logical fallacies",
    "Develop frameworks for assessing AI-generated solutions against professional standards and requirements",
    "Build expertise in synthesizing insights from multiple AI-generated perspectives"
  ],
  "TAS": [
    "Design comprehensive AI-augmented workflows that integrate multiple tools and platforms",
    "Develop strategies for managing complex projects where AI handles significant portions of tasks",
    "Build skills in quality control and oversight of AI-generated work products"
  ],
  "ETH": [
    "Develop organizational guidelines for ethical AI use aligned with professional standards",
    "Build expertise in identifying and mitigating bias in AI-generated outputs",
    "Create frameworks for balancing efficiency gains with ethical considerations in AI deployment"
  ],
  "ADA": [
    "Master the ability to rapidly learn and integrate new AI tools into existing workflows",
    "Develop strategies for staying current with AI capabilities and best practices",
    "Build expertise in customizing AI tools through fine-tuning or configuration for specific needs"
  ],
  "COL": [
    "Lead team initiatives to establish AI collaboration standards and best practices",
    "Develop training programs to elevate team members' AI collaboration capabilities",
    "Build communities of practice around effective AI use within your organization"
  ]
};

export const expertRecommendations: { [key: string]: string[] } = {
  "SAU": [
    "Contribute to industry discourse on AI reliability and develop novel validation methodologies",
    "Mentor others in building sophisticated AI verification frameworks for critical applications",
    "Pioneer approaches to AI safety and reliability in your domain of expertise"
  ],
  "QFP": [
    "Innovate novel prompting techniques and share them with the professional community",
    "Develop meta-prompting strategies that help others improve their prompting skills",
    "Contribute to research and best practices around advanced prompt engineering"
  ],
  "IPT": [
    "Design innovative iteration frameworks that push the boundaries of human-AI collaboration",
    "Teach advanced iteration strategies through workshops, publications, or mentorship",
    "Research and document best practices for complex multi-stage AI-human workflows"
  ],
  "CTR": [
    "Develop thought leadership around critical evaluation of AI systems and outputs",
    "Create frameworks and tools that help others strengthen their AI critical thinking skills",
    "Contribute to academic or industry research on human oversight of AI systems"
  ],
  "TAS": [
    "Architect enterprise-scale AI integration strategies that transform organizational capabilities",
    "Develop innovative AI-human collaboration models that others can learn from and adopt",
    "Lead research into optimal division of labor between humans and AI systems"
  ],
  "ETH": [
    "Shape industry standards and policies around ethical AI development and deployment",
    "Lead initiatives to address systemic ethical challenges in AI across your organization or industry",
    "Contribute to academic research or policy development on AI ethics and governance"
  ],
  "ADA": [
    "Pioneer new approaches to AI adoption and change management in professional contexts",
    "Develop frameworks that accelerate others' ability to adapt to emerging AI technologies",
    "Lead organizational transformation initiatives centered on AI capability building"
  ],
  "COL": [
    "Build cross-organizational or industry-wide communities focused on AI collaboration excellence",
    "Develop innovative models for human-AI team collaboration that advance the field",
    "Mentor emerging leaders in building strong AI collaboration capabilities within their teams"
  ]
};

export const dimensionNames: { [key: string]: string } = {
  "SAU": "Strategic AI Understanding",
  "QFP": "Query Formulation & Prompting",
  "IPT": "Iterative Problem-Solving & Refinement",
  "CTR": "Critical Thinking & Reasoning",
  "TAS": "Task Structuring & Delegation",
  "ETH": "Ethics & Responsible AI Use",
  "ADA": "Adaptability & Continuous Learning",
  "COL": "Collaboration & Knowledge Sharing"
};
