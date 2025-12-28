import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function parseSections(fullResponse: string) {
  const sectionMap: Record<string, string> = {
    'business-concept': '',
    'customer-persona': '',
    'competitive-landscape': '',
    'brand-identity': '',
    'pricing-strategy': '',
    'landing-page-copy': '',
    'launch-roadmap': '',
    'marketing-kit': '',
  };

  // Split by section headers
  const sections = fullResponse.split(/## \d+\. /);

  sections.forEach((section) => {
    const trimmed = section.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('Business Concept')) {
      sectionMap['business-concept'] = trimmed.replace('Business Concept', '').trim();
    } else if (trimmed.startsWith('Customer Persona')) {
      sectionMap['customer-persona'] = trimmed.replace('Customer Persona', '').trim();
    } else if (trimmed.startsWith('Competitive Landscape')) {
      sectionMap['competitive-landscape'] = trimmed.replace('Competitive Landscape', '').trim();
    } else if (trimmed.startsWith('Brand Identity')) {
      sectionMap['brand-identity'] = trimmed.replace('Brand Identity', '').trim();
    } else if (trimmed.startsWith('Pricing Strategy')) {
      sectionMap['pricing-strategy'] = trimmed.replace('Pricing Strategy', '').trim();
    } else if (trimmed.startsWith('Landing Page Copy')) {
      sectionMap['landing-page-copy'] = trimmed.replace('Landing Page Copy', '').trim();
    } else if (trimmed.startsWith('30-Day Launch Roadmap')) {
      sectionMap['launch-roadmap'] = trimmed.replace('30-Day Launch Roadmap', '').trim();
    } else if (trimmed.startsWith('Marketing Starter Kit')) {
      sectionMap['marketing-kit'] = trimmed.replace('Marketing Starter Kit', '').trim();
    }
  });

  return sectionMap;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea, industry, market, location, budget, technical, time } = body;

    if (!idea) {
      return NextResponse.json(
        { error: 'Business idea is required' },
        { status: 400 }
      );
    }

    const industryLabels: Record<string, string> = {
      'ecommerce': 'E-commerce / Physical Products',
      'saas': 'SaaS / Software',
      'coaching': 'Coaching / Consulting',
      'local-service': 'Local Service Business',
      'content-creator': 'Content Creator / Influencer',
      'agency': 'Agency / Freelance',
      'other': 'Other',
    };

    const systemPrompt = "You are a startup strategist and launch expert. Generate a complete business package. Be specific with real numbers, real competitor names, and actionable advice. No generic filler. Be opinionated - make decisions, don't hedge.";

    const contextParts = [];
    if (industry) contextParts.push(`- Industry: ${industryLabels[industry] || industry}`);
    if (market) contextParts.push(`- Target market: ${market}`);
    if (location) contextParts.push(`- Target geography: ${location}`);
    if (budget) contextParts.push(`- Budget: ${budget}`);
    if (technical) contextParts.push(`- Technical ability: ${technical}`);
    if (time) contextParts.push(`- Time commitment: ${time}`);

    const contextSection = contextParts.length > 0
      ? `\n\nContext:\n${contextParts.join('\n')}`
      : '';

    const userPrompt = `I want to build: ${idea}${contextSection}

Generate a complete business launch package with these 8 sections. Use markdown formatting with ## for section headers:

## 1. Business Concept
- The Concept (2-3 sentences, sharpen the idea)
- Problem Being Solved (who feels this pain, what's the current workaround)
- Market Sizing (TAM/SAM/SOM with real numbers and logic)
- Key Assumptions (3-5 that must be true)
- Verdict (viable? biggest risk?)

## 2. Customer Persona
- Primary persona with name, age, role, location, income
- Their typical day and where the problem shows up
- Current workaround
- What success looks like for them
- Where they hang out online (specific communities, accounts, newsletters)
- Their top 3 objections

## 3. Competitive Landscape
- 3-5 direct competitors with pricing, strengths, weaknesses
- 2-3 indirect competitors
- The gap in the market
- Positioning statement: Unlike [competitor], we [differentiator] for [audience]

## 4. Brand Identity
- 5 name options with domain availability notes
- Recommended name with rationale
- 3 tagline options
- Brand voice description
- Color palette suggestion (hex codes)

## 5. Pricing Strategy
- Recommended pricing model
- Specific price points with tiers
- Free tier strategy (if applicable)
- Launch pricing recommendation
- Revenue projection for month 1

## 6. Landing Page Copy
- Hero headline and subheadline
- Problem section (3-4 sentences)
- Solution section (3-4 sentences)
- How it works (3 steps)
- 3 key benefits
- FAQ (5 questions)
- Final CTA

## 7. 30-Day Launch Roadmap
Structure this as 4 weekly sections with task lists:

### Week 1: Foundation
- Task item 1 (time estimate)
- Task item 2 (time estimate)
- [5-7 tasks total]

### Week 2: Soft Launch
- Task item 1 (time estimate)
- Task item 2 (time estimate)
- [5-7 tasks total]

### Week 3: Build Momentum
- Task item 1 (time estimate)
- Task item 2 (time estimate)
- [5-7 tasks total]

### Week 4: Public Launch
- Task item 1 (time estimate)
- Task item 2 (time estimate)
- [5-7 tasks total]

After the weekly tasks, add a metrics section formatted EXACTLY like this:

---METRICS---
Website Visitors|1,000|Month 1
Email Subscribers|200|Month 1
Conversion Rate|3-5%|Month 1
Revenue|$3,000|Month 1
Customer Satisfaction|8.5/10|Month 1
---END METRICS---

Use this exact format with pipe separators (|) between: metric name, target value, and timeframe. Include 3-5 relevant metrics for this specific business.

## 8. Marketing Starter Kit
Click-to-generate interactive marketing content (Twitter launch plan, Instagram campaign, and email sequence will be available as on-demand generators).

Be specific to THIS business idea. Use real competitor names, real pricing, real communities.

${industry ? `IMPORTANT: The user is building a ${industryLabels[industry] || industry} business. Tailor all advice, competitors, pricing models, marketing channels, and examples specifically to this industry. Use industry-specific terminology, benchmarks, and best practices.` : ''}

${location ? `IMPORTANT: Use the target geography (${location}) for all market sizing, competitor analysis, and pricing. If targeting outside the US, use local competitors, local currency, and region-specific market data.` : ''}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = message.content[0];
    const fullResponse = content.type === 'text' ? content.text : '';

    // Parse the response into sections
    const sections = parseSections(fullResponse);

    return NextResponse.json({ sections });
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    return NextResponse.json(
      { error: 'Failed to generate business concept' },
      { status: 500 }
    );
  }
}
