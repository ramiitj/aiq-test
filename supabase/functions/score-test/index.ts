import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[score-test] Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Request failed', code: 'AUTH_001' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('[score-test] Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Request failed', code: 'AUTH_001' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { testId, answers, duration } = await req.json();
    console.log(`[score-test] Scoring test ${testId} for user ${user.id.substring(0, 8)}...`);

    // Verify test ownership and status
    const { data: test, error: testError } = await supabaseClient
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single();

    if (testError || !test) {
      console.error('[score-test] Test lookup failed:', testError?.message);
      return new Response(
        JSON.stringify({ error: 'Request failed', code: 'TEST_001' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (test.user_id !== user.id) {
      console.error('[score-test] Unauthorized test access attempt');
      return new Response(
        JSON.stringify({ error: 'Request failed', code: 'TEST_002' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (test.completed) {
      console.error('[score-test] Attempt to score already completed test');
      return new Response(
        JSON.stringify({ error: 'Request failed', code: 'TEST_003' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[score-test] Loading assessment file for product: ${test.product_slug}`);

    // Load assessment from storage
    const fileName = `${test.product_slug}.json`;
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('aiq-items')
      .download(fileName);

    if (downloadError || !fileData) {
      console.error('[score-test] Failed to load assessment file:', downloadError?.message);
      return new Response(
        JSON.stringify({ error: 'Request failed', code: 'ASSESS_001' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const assessmentText = await fileData.text();
    const assessment = JSON.parse(assessmentText);

    // Handle both JSON formats: itemBank.dimensions[] or itemBank[]
    const dimensions = Array.isArray(assessment.itemBank) 
      ? assessment.itemBank 
      : assessment.itemBank.dimensions;

    // CRITICAL FIX: Handle both scoringConfiguration and assessmentConfiguration formats
    // Some assessment files (like SDE) use assessmentConfiguration instead of scoringConfiguration
    const rawScoringConfig = assessment.scoringConfiguration 
      || assessment.assessmentConfiguration 
      || {};
    
    // Normalize scoring config with safe defaults
    const scoringConfig = {
      passingPercentage: rawScoringConfig.passingPercentage || 70,
      passingScore: rawScoringConfig.passingScore,
      totalPoints: rawScoringConfig.totalPoints || 600,
      scoringGuidelines: rawScoringConfig.scoringGuidelines || null,
      ...rawScoringConfig
    };

    console.log(`[score-test] Assessment loaded with ${dimensions.length} dimensions`);
    console.log(`[score-test] Scoring config: passingPercentage=${scoringConfig.passingPercentage}, hasGuidelines=${!!scoringConfig.scoringGuidelines}`);
    console.log(`[score-test] Total answers received: ${Object.keys(answers).length}`);

    // Server-side scoring logic
    const scores = calculateTestScores(
      answers,
      dimensions,
      scoringConfig,
      test.test_version,
      test.product_slug
    );

    console.log(`[score-test] Scoring complete:`);
    console.log(`[score-test]   - Overall: ${scores.overallScore}/${scores.maxScore} = ${scores.percentageScore.toFixed(1)}%`);
    console.log(`[score-test]   - Passed: ${scores.passed}`);
    console.log(`[score-test]   - Performance Level: ${scores.performanceLevel}`);

    // Calculate percentile - FILTERED BY PRODUCT SLUG
    const { data: allResults } = await supabaseClient
      .from('public_results')
      .select('overall_score, product_slug')
      .not('overall_score', 'is', null);

    const percentile = calculatePercentile(scores.overallScore, test.product_slug, allResults || []);
    console.log(`[score-test] Percentile rank: ${percentile} (compared against ${(allResults || []).filter(r => r.product_slug === test.product_slug).length} same-assessment results)`);

    // Update test with scores and duration
    const { error: updateError } = await supabaseClient
      .from('tests')
      .update({
        completed: true,
        end_time: new Date().toISOString(),
        test_duration_seconds: duration || 0,
        scores: scores.dimensionScores,
        answers: answers,
      })
      .eq('id', testId);

    if (updateError) {
      console.error('[score-test] Failed to update test:', updateError.message);
      throw new Error('Failed to update test');
    }

    console.log(`[score-test] Test ${testId.substring(0, 8)}... scored and saved successfully`);

    return new Response(
      JSON.stringify({ 
        success: true,
        scores: scores,
        percentile: percentile,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[score-test] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Server-side scoring implementation
function calculateTestScores(
  answers: any,
  dimensions: any[],
  scoringConfig: any,
  assessmentLevel: string,
  productSlug: string
): any {
  const dimensionScores: any = {};
  let totalWeightedPoints = 0;
  let maxPossibleWeighted = 0;

  console.log(`[score-test] Calculating scores for ${dimensions.length} dimensions, level: ${assessmentLevel}`);

  dimensions.forEach((dimension, dimIndex) => {
    let dimensionPoints = 0;
    let dimensionMax = 0;
    let correctCount = 0;

    dimension.items.forEach((item: any, itemIndex: number) => {
      // Use dimension-item index format matching Test.tsx answer keys
      const answerKey = `${dimIndex}-${itemIndex}`;
      const userAnswer = answers[answerKey];
      const isCorrect = checkAnswer(item, userAnswer);
      
      if (isCorrect) correctCount++;
      
      // Calculate earned points with weighting
      const itemPoints = calculateItemPoints(item, isCorrect, assessmentLevel);
      
      // Calculate max points WITHOUT weighting (FIXED 10 points per item)
      const maxItemPoints = calculateMaxItemPoints(item);
      
      if (isCorrect) {
        dimensionPoints += itemPoints;
      }
      dimensionMax += maxItemPoints;
    });

    // Calculate percentage and CAP AT 100%
    const rawPercentage = dimensionMax > 0 ? (dimensionPoints / dimensionMax) * 100 : 0;
    const cappedPercentage = Math.min(100, rawPercentage);

    dimensionScores[dimension.dimensionCode] = {
      score: dimensionPoints,
      maxScore: dimensionMax,
      percentage: cappedPercentage,
    };

    console.log(`[score-test] Dimension ${dimension.dimensionCode}: ${correctCount}/${dimension.items.length} correct, ${dimensionPoints.toFixed(1)}/${dimensionMax} points (${cappedPercentage.toFixed(1)}%)`);

    totalWeightedPoints += dimensionPoints;
    maxPossibleWeighted += dimensionMax;
  });

  // Calculate overall percentage and CAP AT 100%
  const rawOverallPercentage = maxPossibleWeighted > 0 
    ? (totalWeightedPoints / maxPossibleWeighted) * 100 
    : 0;
  const overallPercentage = Math.min(100, rawOverallPercentage);

  // Use passing percentage from config, default to 70% (null-safe access)
  const passingPercentage = scoringConfig?.passingPercentage || 70;
  const passed = overallPercentage >= passingPercentage;

  // Use scoringGuidelines for proficiency level if available (null-safe access)
  const performanceLevel = scoringConfig?.scoringGuidelines
    ? determinePerformanceLevel(overallPercentage, scoringConfig.scoringGuidelines)
    : determinePerformanceLevel(overallPercentage);

  return {
    dimensionScores,
    overallScore: totalWeightedPoints,
    maxScore: maxPossibleWeighted,
    percentageScore: overallPercentage,
    passed,
    performanceLevel,
    passingScore: Math.floor(maxPossibleWeighted * (passingPercentage / 100)),
    totalPossiblePoints: maxPossibleWeighted,
  };
}

function checkAnswer(item: any, userAnswer: string): boolean {
  if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
    return false;
  }
  
  if (item.type === 'true-false') {
    return String(userAnswer).toLowerCase() === String(item.correctAnswer).toLowerCase();
  }
  if (item.type === 'multiple-response' && item.correctAnswers) {
    const userAnswers = String(userAnswer).split(',').map((a: string) => parseInt(a.trim())).filter((a: number) => !isNaN(a));
    const correctSet = new Set(item.correctAnswers);
    return userAnswers.length === correctSet.size && 
           userAnswers.every((a: number) => correctSet.has(a));
  }
  // Multiple choice - compare as integers
  const userInt = parseInt(String(userAnswer));
  const correctInt = parseInt(String(item.correctAnswer));
  return !isNaN(userInt) && !isNaN(correctInt) && userInt === correctInt;
}

function calculateItemPoints(item: any, isCorrect: boolean, assessmentLevel: string): number {
  const basePoints = item.points || 10;
  
  if (!isCorrect) return 0;
  
  const difficulty = item.difficulty || 0.5;
  const discrimination = item.discrimination || 1;
  
  // Apply weighting to earned scores only, not to maxScore
  // Advanced uses stronger weighting for difficulty and discrimination
  if (assessmentLevel.includes('advanced') || assessmentLevel === 'professional' || assessmentLevel === 'expert') {
    return basePoints * (1 + difficulty * 0.5 + discrimination * 0.25);
  }
  
  // Beginner uses lighter weighting
  return basePoints * (1 + difficulty * 0.3);
}

// Calculate max possible points for an item (FIXED 10 points per item)
function calculateMaxItemPoints(item: any): number {
  return item.points || 10;
}

function determinePerformanceLevel(percentage: number, scoringGuidelines?: any): string {
  // Use scoringGuidelines if provided
  if (scoringGuidelines) {
    const ranges = Object.entries(scoringGuidelines).sort((a: any, b: any) => {
      const aMin = parseInt(a[0].split('-')[0]);
      const bMin = parseInt(b[0].split('-')[0]);
      return bMin - aMin; // Sort descending
    });
    
    for (const [range, level] of ranges) {
      const [min, max] = (range as string).split('-').map(s => parseInt(s.replace('%', '')));
      if (percentage >= min && percentage <= max) {
        // Extract just the level name (remove point ranges in parentheses)
        const levelStr = level as string;
        const parenIndex = levelStr.indexOf('(');
        return parenIndex > 0 ? levelStr.substring(0, parenIndex).trim() : levelStr.trim();
      }
    }
  }
  
  // Default proficiency levels
  if (percentage >= 90) return 'Advanced';
  if (percentage >= 80) return 'Proficient';
  if (percentage >= 70) return 'Developing';
  if (percentage >= 60) return 'Beginner';
  return 'Novice';
}

/**
 * Calculate percentile rank WITHIN THE SAME ASSESSMENT TYPE
 * This ensures fair comparison between users who took the same test
 */
function calculatePercentile(userScore: number, productSlug: string, allResults: any[]): number {
  // Filter to same assessment type only
  const sameAssessmentResults = allResults.filter(r => r.product_slug === productSlug);
  
  if (sameAssessmentResults.length === 0) {
    console.log(`[score-test] No previous results for ${productSlug}, defaulting to 50th percentile`);
    return 50; // Default for first taker
  }
  
  const lowerCount = sameAssessmentResults.filter(s => s.overall_score < userScore).length;
  const rawPercentile = Math.round((lowerCount / sameAssessmentResults.length) * 100);
  
  // Cap at 99 to reserve 100 for truly exceptional cases, minimum 1
  return Math.min(99, Math.max(1, rawPercentile));
}
