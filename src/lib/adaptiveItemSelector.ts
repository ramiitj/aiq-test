// src/lib/adaptiveItemSelector.ts

export type TestVersion = "beginner" | "professional" | "expert";
export interface TestItem {
  id: string;
  level: number;
  type: "multiple-choice" | "true-false" | "scenario-based" | "multiple-response" | "scenario-ranking" | "matching" | "rank-ordering" | "open-ended";
  dimension?: string;
  dimensionCode?: string;
  points: number;
  difficulty: number;
  question: string;
  options?: string[];
  correctAnswer?: number | boolean;
  correctAnswers?: number[];
  correctOrder?: number[];
  leftColumn?: string[];
  rightColumn?: string[];
  correctPairs?: [number, number][];
  items?: string[];
  rationale?: string;
  explanation?: string;
  bloomLevel?: string;
  discrimination?: number;
  tags?: string[];
}
export interface Dimension {
  name: string;
  code: string;
  items: TestItem[];
}
export interface AssessmentData {
  version: TestVersion;
  dimensions: Dimension[];
}

export const VERSION_CONFIGS = {
  beginner: { itemsPerDimension: 8, totalQuestions: 60, totalTime: 90 * 60, totalPoints: 600 },
  professional: { itemsPerDimension: 10, totalQuestions: 80, totalTime: 120 * 60, totalPoints: 800 },
  expert: { itemsPerDimension: 10, totalQuestions: 80, totalTime: 150 * 60, totalPoints: 800 },
};

export async function loadTestItems(version: TestVersion): Promise<AssessmentData> {
  const path = `/test-items/${version}-assessment.json`;
  const resp = await fetch(path);
  return await resp.json();
}

export function getVersionInfo(version: TestVersion) {
  if (version === "beginner")
    return { totalQuestions: 60, description: "Foundational AI literacy assessment (60 items, 90 minutes, 600 points)" };
  if (version === "professional")
    return { totalQuestions: 80, description: "Full assessment for professionals/adaptive (80 items, 120 minutes, 800 points)" };
  return { totalQuestions: 80, description: "Expert, adaptive (80 items, 150 minutes, 800 points)" };
}
