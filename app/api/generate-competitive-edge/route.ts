import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { businessContext, competitors, budget, technical, time } = await request.json();

    const prompt = `Based on the business concept, customer persona, and competitive landscape already generated, create a deep Competitive Edge analysis:

BUSINESS CONTEXT:
${businessContext}

COMPETITIVE LANDSCAPE:
${competitors}

FOUNDER/BUSINESS CONSTRAINTS:
- Budget: ${budget}
- Technical Ability: ${technical}
- Time Available: ${time}

## Your Unfair Advantages
Identify 3-5 unfair advantages this business could have. Be specific to their situation (budget: ${budget}, technical ability: ${technical}, time: ${time}). Examples: founder expertise, geographic advantage, timing, unique access, cost structure.

## Defensibility Analysis
Rate defensibility from 1-10 and explain:
- How easy is it for competitors to copy this?
- What would create switching costs for customers?
- What network effects or data advantages could develop over time?

## Positioning Against Each Competitor
For each direct competitor mentioned above:
- Their weakness you can exploit
- Specific messaging to win their customers
- What NOT to compete on (where they're too strong)

## First-Mover Opportunities
3-5 specific opportunities to capture ground before competitors react:
- Underserved niches
- Emerging channels or platforms
- Timing advantages (trends, regulations, market shifts)

## Your Wedge
The single sharpest angle of attack - your wedge into the market. One paragraph on exactly how to position against incumbents.

Be specific and actionable. No generic advice. Format as clean, well-structured markdown.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error generating competitive edge:', error);
    return NextResponse.json(
      { error: 'Failed to generate competitive edge analysis' },
      { status: 500 }
    );
  }
}
