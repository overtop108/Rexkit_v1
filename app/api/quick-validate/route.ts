import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { businessIdea } = await request.json();

    if (!businessIdea || typeof businessIdea !== 'string') {
      return NextResponse.json(
        { error: 'Business idea is required' },
        { status: 400 }
      );
    }

    const prompt = `You are a brutally honest startup advisor. Evaluate this business idea in 30 seconds:

Business idea: ${businessIdea}

Respond with ONLY this format:

VIABILITY SCORE: [1-10]/10

VERDICT: [One sentence: Viable / Risky / Not recommended]

TOP 3 RISKS:
1. [Risk]
2. [Risk]
3. [Risk]

QUICK TAKE: [2-3 sentences - honest assessment, biggest concern, one thing that could make it work]

RECOMMENDATION: [Generate full plan / Refine your idea first / Try a different direction]`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    const scoreMatch = responseText.match(/VIABILITY SCORE:\s*(\d+)\/10/i);
    const verdictMatch = responseText.match(/VERDICT:\s*(.+?)(?=\n|$)/i);
    const risksMatch = responseText.match(/TOP 3 RISKS:\s*\n1\.\s*(.+?)\n2\.\s*(.+?)\n3\.\s*(.+?)(?=\n\n|$)/is);
    const quickTakeMatch = responseText.match(/QUICK TAKE:\s*(.+?)(?=\n\nRECOMMENDATION:|$)/is);
    const recommendationMatch = responseText.match(/RECOMMENDATION:\s*(.+?)$/is);

    const score = scoreMatch ? parseInt(scoreMatch[1]) : 5;
    const verdict = verdictMatch ? verdictMatch[1].trim() : 'Assessment pending';
    const risks = risksMatch
      ? [risksMatch[1].trim(), risksMatch[2].trim(), risksMatch[3].trim()]
      : ['Unable to assess risks at this time'];
    const quickTake = quickTakeMatch ? quickTakeMatch[1].trim() : 'Unable to provide assessment';
    const recommendation = recommendationMatch
      ? recommendationMatch[1].trim()
      : 'Consider refining your idea';

    return NextResponse.json({
      score,
      verdict,
      risks,
      quickTake,
      recommendation,
    });
  } catch (error) {
    console.error('Error validating idea:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Detailed error:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to validate idea', details: errorMessage },
      { status: 500 }
    );
  }
}
