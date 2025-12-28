import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const industryLabels: Record<string, string> = {
  'ecommerce': 'E-commerce / Physical Products',
  'saas': 'SaaS / Software',
  'coaching': 'Coaching / Consulting',
  'local-service': 'Local Service Business',
  'content-creator': 'Content Creator / Influencer',
  'agency': 'Agency / Freelance',
  'other': 'Other',
};

export async function POST(request: NextRequest) {
  try {
    const { type, businessContext, brandVoice, idea, industry, projectName } = await request.json();

    const effectiveName = projectName || idea.split(' ').slice(0, 5).join(' ');
    const nameInstruction = projectName
      ? `\n\nIMPORTANT: The business/product is called "${projectName}". Use this name consistently throughout all content. This is the brand name that should appear in posts.`
      : '';

    const industryContext = industry
      ? `\n\nINDUSTRY: ${industryLabels[industry] || industry}\nTailor all content, channels, tactics, and examples specifically to this industry. Use industry-specific terminology and best practices.`
      : '';

    let prompt = '';

    if (type === 'twitter') {
      prompt = `You are a Twitter marketing expert. Generate a 7-day Twitter launch plan for this business:

BUSINESS: ${idea}${nameInstruction}

CONTEXT:
${businessContext}

BRAND VOICE:
${brandVoice}${industryContext}

Create a detailed 7-day content calendar. Format EXACTLY like this using pipe delimiters:

---TWITTER---
1|9:00 AM|Your compelling tweet copy here (max 280 chars)|launch
2|2:00 PM|Another engaging tweet for day 2|value
3|10:00 AM|Day 3 tweet content here|engagement
4|1:00 PM|Day 4 tweet content here|social-proof
5|11:00 AM|Day 5 tweet content here|value
6|3:00 PM|Day 6 tweet content here|engagement
7|10:00 AM|Day 7 tweet content here|urgency
---END TWITTER---

Each line format: Day|Time|Tweet Copy|Type

Post Types to use (one post per day):
- launch: Launch announcement, value proposition (day 1)
- value: Educational content, tips, value-adds (days 2, 5)
- engagement: Questions, polls, community building (days 3, 6)
- social-proof: Testimonials, case studies (day 4)
- urgency: Special offers, final push (day 7)

Make each tweet actionable, engaging, and aligned with the brand voice. Use emojis strategically but sparingly. Keep tweets under 280 characters.`;
    } else if (type === 'instagram') {
      prompt = `You are an Instagram marketing expert. Generate a 7-day Instagram launch campaign for this business:

BUSINESS: ${idea}${nameInstruction}

CONTEXT:
${businessContext}

BRAND VOICE:
${brandVoice}${industryContext}

Create a 7-day posting schedule. Format EXACTLY like this using the delimiter pattern:

---INSTAGRAM---
1|Carousel|Your engaging caption here (150-200 words with emojis and storytelling)|#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5 #hashtag6 #hashtag7 #hashtag8 #hashtag9 #hashtag10|6:00 PM|Professional photo showing [specific visual description: composition, colors, style, mood]. Square format 1080x1080.
2|Single|Caption for day 2 post...|#hashtags here...|7:00 PM|Visual description here...
3|Reel|Caption for reel...|#hashtags here...|5:30 PM|Video description for reel...
4|Carousel|Caption for day 4...|#hashtags here...|6:00 PM|Visual description here...
5|Single|Caption for day 5...|#hashtags here...|7:00 PM|Visual description here...
6|Reel|Caption for day 6...|#hashtags here...|5:30 PM|Visual description here...
7|Single|Caption for day 7...|#hashtags here...|6:00 PM|Visual description here...
---END INSTAGRAM---

Each line format: Day|Type|Caption|Hashtags|Time|Visual Description

Post Types to use (7 posts total):
- Carousel: Educational, multi-slide content (2-3 posts)
- Single: Inspirational single images (3-4 posts)
- Reel: Trending, entertaining video content (1-2 posts)

Include strategic mix:
- 40% Educational/Value content
- 30% Engagement/Community building
- 20% Behind-the-scenes/Brand story
- 10% Promotional/Sales

Make captions engaging with 150-200 words, include 10 relevant hashtags per post, and provide detailed visual descriptions that can be used to generate images.`;
    } else if (type === 'email') {
      prompt = `You are an email marketing expert. Generate a high-converting 5-email launch sequence for this business:

BUSINESS: ${idea}${nameInstruction}

CONTEXT:
${businessContext}

BRAND VOICE:
${brandVoice}${industryContext}

Create a 5-email sequence. Format EXACTLY like this using the delimiter pattern:

---EMAIL---
1|The Announcement|Day 1 - 10:00 AM|🎉 We're launching something special for you|Get ready for what's next...|Hi there!\n\nWe've been working on something exciting, and I can't wait to share it with you.\n\n[Full email body with opening hook, value proposition, and soft CTA to learn more. Keep paragraphs short. Use conversational tone.]\n\nTalk soon,\n[Signature]|Learn More
2|Problem/Solution Deep Dive|Day 3 - 2:00 PM|Subject line here...|Preview text here...|Email body here...|Get Started
3|Social Proof & Credibility|Day 5 - 10:00 AM|Subject line here...|Preview text here...|Email body here...|Join Others
4|FAQ & Objection Handling|Day 7 - 11:00 AM|Subject line here...|Preview text here...|Email body here...|Start Your Journey
5|Final Push|Day 10 - 9:00 AM|Subject line here...|Preview text here...|Email body here...|Claim Your Spot
---END EMAIL---

Each line format: Number|Name|Timing|Subject|Preview|Body|CTA

THE 5 EMAILS SHOULD BE:

Email 1 - The Announcement: Introduce solution, create excitement, tease what's coming, soft CTA
Email 2 - Problem/Solution: Agitate problem, present solution, show transformation, CTA to get started
Email 3 - Social Proof: Share testimonials (hypothetical), case studies, results, trust-building, CTA to join
Email 4 - FAQ & Objections: Address concerns, answer questions, remove barriers, reassurance, strong CTA
Email 5 - Final Push: Create urgency, recap benefits, final chance messaging, strongest CTA, PS with nudge

Make each email conversational and persuasive (250-400 words). Keep paragraphs short. Use \\n\\n for paragraph breaks in the body field.`;
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 16000,
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
    console.error('Error generating marketing content:', error);
    return NextResponse.json(
      { error: 'Failed to generate marketing content' },
      { status: 500 }
    );
  }
}
