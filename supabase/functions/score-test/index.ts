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
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Request failed', code: 'AUTH_001' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Request failed', code: 'AUTH_001' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { testId, answers } = await req.json();

    // Verify test ownership and status
    const { data: test, error: testError } = await supabaseClient
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single();

    if (testError || !test) {
      console.error('Test lookup failed:', testError?.message);
      return new Response(
        JSON.stringify({ error: 'Request failed', code: 'TEST_001' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (test.user_id !== user.id) {
      console.error('Unauthorized test access attempt');
      return new Response(
        JSON.stringify({ error: 'Request failed', code: 'TEST_002' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (test.completed) {
      console.error('Attempt to score already completed test');
      return new Response(
        JSON.stringify({ error: 'Request failed', code: 'TEST_003' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Load assessment from storage
    const fileName = `${test.product_slug}.json`;
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('aiq-items')
      .download(fileName);

    if (downloadError || !fileData) {
      console.error('Failed to load assessment file:', downloadError?.message);
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

    // Server-side scoring logic
    const scores = calculateTestScores(
      answers,
      dimensions,
      assessment.scoringConfiguration,
      test.test_version
    );

    // Calculate percentile
    const { data: allScores } = await supabaseClient
      .from('public_results')
      .select('overall_score')
      .not('overall_score', 'is', null);

    const percentile = calculatePercentile(scores.overallScore, allScores || []);

    // Update test with scores
    const { error: updateError } = await supabaseClient
      .from('tests')
      .update({
        completed: true,
        end_time: new Date().toISOString(),
        scores: scores.dimensionScores,
        answers: answers,
      })
      .eq('id', testId);

    if (updateError) {
      throw new Error('Failed to update test');
    }

    console.log(`Test ${testId.substring(0, 8)}... scored successfully`);

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
    console.error('Error in score-test:', errorMessage);
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
  assessmentLevel: string
): any {
  const dimensionScores: any = {};
  let totalWeightedPoints = 0;
  let maxPossibleWeighted = 0;

  dimensions.forEach((dimension, dimIndex) => {
    let dimensionPoints = 0;
    let dimensionMax = 0;

    dimension.items.forEach((item: any, itemIndex: number) => {
      // Use dimension-item index format matching Test.tsx answer keys
      const answerKey = `${dimIndex}-${itemIndex}`;
      const userAnswer = answers[answerKey];
      const isCorrect = checkAnswer(item, userAnswer);
      const itemPoints = calculateItemPoints(item, isCorrect, assessmentLevel);
      
      if (isCorrect) {
        dimensionPoints += itemPoints;
      }
      dimensionMax += itemPoints;
    });

    dimensionScores[dimension.dimensionCode] = {
      score: dimensionPoints,
      maxScore: dimensionMax,
      percentage: dimensionMax > 0 ? (dimensionPoints / dimensionMax) * 100 : 0,
    };

    totalWeightedPoints += dimensionPoints;
    maxPossibleWeighted += dimensionMax;
  });

  const overallPercentage = maxPossibleWeighted > 0 
    ? (totalWeightedPoints / maxPossibleWeighted) * 100 
    : 0;

  // Use passing percentage from config, default to 70%
  const passingPercentage = scoringConfig.passingPercentage || 70;
  const passed = overallPercentage >= passingPercentage;

  // Use scoringGuidelines for proficiency level if available
  const performanceLevel = scoringConfig.scoringGuidelines
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
  if (item.type === 'true-false') {
    return String(userAnswer) === String(item.correctAnswer);
  }
  if (item.type === 'multiple-response' && item.correctAnswers) {
    const userAnswers = userAnswer.split(',').map((a: string) => parseInt(a.trim()));
    const correctSet = new Set(item.correctAnswers);
    return userAnswers.length === correctSet.size && 
           userAnswers.every((a: number) => correctSet.has(a));
  }
  return parseInt(userAnswer) === item.correctAnswer;
}

function calculateItemPoints(item: any, isCorrect: boolean, assessmentLevel: string): number {
  if (!isCorrect) return 0;
  
  const basePoints = item.points || 10;
  const difficulty = item.difficulty || 0.5;
  const discrimination = item.discrimination || 1;
  
  // Advanced uses stronger weighting for difficulty and discrimination
  if (assessmentLevel.includes('advanced') || assessmentLevel === 'professional' || assessmentLevel === 'expert') {
    return basePoints * (1 + difficulty * 0.5 + discrimination * 0.25);
  }
  
  // Beginner uses lighter weighting
  return basePoints * (1 + difficulty * 0.3);
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
        // Extract just the level name
        return (level as string).split('(')[0].trim();
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

function calculatePercentile(userScore: number, allScores: any[]): number {
  if (allScores.length === 0) return 50;
  
  const lowerCount = allScores.filter(s => s.overall_score < userScore).length;
  return Math.round((lowerCount / allScores.length) * 100);
}
