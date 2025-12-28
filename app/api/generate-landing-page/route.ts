import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { landingPageCopy, brandColors, businessName } = await request.json();

    const prompt = `You are an expert web developer and designer. Generate a production-ready, single-file HTML landing page based on the following specifications:

LANDING PAGE COPY:
${landingPageCopy}

BRAND COLORS:
${brandColors ? JSON.stringify(brandColors) : 'Use emerald-600 primary, amber-500 accent, slate-50 background, slate-900 text'}

BUSINESS NAME:
${businessName || 'Business'}

REQUIREMENTS:
1. Create a complete, single-file HTML page that includes:
   - Full HTML5 structure with proper meta tags
   - Tailwind CSS via CDN (use <script src="https://cdn.tailwindcss.com"></script>)
   - Responsive design (mobile-first, works on all devices)
   - Modern, beautiful styling with smooth animations and transitions

2. Include these sections in order:
   - Hero section: Eye-catching gradient background, headline, subheadline, prominent CTA button
   - Problem section: Describe the pain points (use content from landing page copy)
   - Solution section: Present your solution (use content from landing page copy)
   - How It Works: 3-step process with numbered icons/badges
   - Benefits section: 3-card grid with icons and descriptions
   - FAQ section: Interactive accordion or expandable details elements
   - Final CTA section: Compelling call-to-action with button
   - Footer: 3-column layout with placeholder links (Product, Company, Legal)

3. Design requirements:
   - Use the provided brand colors throughout (or defaults if not provided)
   - Add subtle animations (fade-ins, hover effects, smooth transitions)
   - Include proper spacing and typography hierarchy
   - Make buttons interactive with hover states
   - Use SVG icons where appropriate (inline SVG or Heroicons-style)
   - Add gradient backgrounds in hero and CTA sections

4. Technical requirements:
   - Valid HTML5 with semantic elements
   - Mobile-responsive using Tailwind breakpoints (sm:, md:, lg:)
   - No external dependencies except Tailwind CDN
   - Include custom Tailwind config for brand colors
   - Add smooth scroll behavior
   - Production-ready code (clean, well-formatted)

5. Important:
   - Extract content from the landing page copy provided
   - Use real content, not placeholders
   - Make it look premium and professional
   - Ensure all interactive elements work (FAQ accordion, buttons)

Return ONLY the complete HTML code, nothing else. No markdown formatting, no explanations, just the raw HTML starting with <!DOCTYPE html>.`;

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

    const htmlContent = message.content[0].type === 'text' ? message.content[0].text : '';

    // Clean up any markdown formatting if present
    let cleanHtml = htmlContent.trim();
    if (cleanHtml.startsWith('```html')) {
      cleanHtml = cleanHtml.replace(/^```html\n/, '').replace(/\n```$/, '');
    } else if (cleanHtml.startsWith('```')) {
      cleanHtml = cleanHtml.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    return NextResponse.json({ html: cleanHtml });
  } catch (error) {
    console.error('Error generating landing page:', error);
    return NextResponse.json(
      { error: 'Failed to generate landing page' },
      { status: 500 }
    );
  }
}
