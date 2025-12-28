export interface TwitterPost {
  day: number;
  time: string;
  copy: string;
  type: 'launch' | 'value' | 'social-proof' | 'engagement' | 'urgency';
  image_url?: string;
}

export interface InstagramPost {
  day: number;
  type: 'Carousel' | 'Single' | 'Reel' | 'Story';
  caption: string;
  hashtags: string;
  time: string;
  visualDescription: string;
  image_url?: string;
}

export interface EmailItem {
  number: number;
  name: string;
  timing: string;
  subject: string;
  preview: string;
  body: string;
  cta: string;
}

export function parseTwitterPosts(content: string): TwitterPost[] {
  const posts: TwitterPost[] = [];

  const match = content.match(/---TWITTER---\s*([\s\S]*?)\s*---END TWITTER---/);
  if (!match) return posts;

  const lines = match[1].trim().split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('...')) continue;

    const parts = trimmed.split('|');
    if (parts.length === 4) {
      posts.push({
        day: parseInt(parts[0].trim()),
        time: parts[1].trim(),
        copy: parts[2].trim(),
        type: parts[3].trim() as TwitterPost['type'],
      });
    }
  }

  return posts;
}

export function parseInstagramPosts(content: string): InstagramPost[] {
  const posts: InstagramPost[] = [];

  const match = content.match(/---INSTAGRAM---\s*([\s\S]*?)\s*---END INSTAGRAM---/);
  if (!match) return posts;

  const lines = match[1].trim().split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('...')) continue;

    const parts = trimmed.split('|');
    if (parts.length === 6) {
      posts.push({
        day: parseInt(parts[0].trim()),
        type: parts[1].trim() as InstagramPost['type'],
        caption: parts[2].trim(),
        hashtags: parts[3].trim(),
        time: parts[4].trim(),
        visualDescription: parts[5].trim(),
      });
    }
  }

  return posts;
}

export function parseEmailSequence(content: string): EmailItem[] {
  const emails: EmailItem[] = [];

  const structuredMatch = content.match(/---EMAIL---\s*([\s\S]*?)\s*---END EMAIL---/);
  if (structuredMatch) {
    const lines = structuredMatch[1].trim().split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('...')) continue;

      const parts = trimmed.split('|');
      if (parts.length >= 7) {
        const number = parseInt(parts[0].trim());
        let name = parts[1].trim();
        let timing = parts[2].trim();
        let subject = parts[3].trim();
        let preview = parts[4].trim();
        let body = parts.slice(5, -1).join('|').trim();
        let cta = parts[parts.length - 1].trim();

        if (name.includes('|')) {
          name = name.split('|')[0].trim();
        }

        if (timing.includes('|')) {
          timing = timing.split('|')[0].trim();
        }

        if (subject.includes('|')) {
          subject = subject.split('|')[0].trim();
        }

        timing = timing.replace(/Day\s*(\d+).*/, 'Day $1');

        body = body.replace(/\\n\\n/g, '\n\n').replace(/\\n/g, '\n');

        if (cta === 'Learn more' || cta === 'Learn More') {
          const ctaMatch = body.match(/\[([^\]]+)\]/);
          if (ctaMatch) {
            cta = ctaMatch[1];
          }
        }

        emails.push({
          number,
          name,
          timing,
          subject,
          preview,
          body,
          cta,
        });
      }
    }

    if (emails.length > 0) return emails;
  }

  const emailPatterns = [
    /Email\s+(\d+)[\s:]+([^\n]+)\n/gi,
    /Day\s+(\d+)[\s:-]+([^\n]+)\n/gi,
    /(\d+)\.\s*([^\n]+)\n/g,
  ];

  for (const pattern of emailPatterns) {
    const matches = Array.from(content.matchAll(pattern));
    if (matches.length >= 3) {
      matches.forEach((match, index) => {
        const number = parseInt(match[1]);
        const title = match[2].trim();

        const emailIndex = match.index || 0;
        const nextEmailIndex = matches[index + 1]?.index || content.length;
        const emailSection = content.substring(emailIndex, nextEmailIndex);

        const subjectMatch = emailSection.match(/Subject[\s:]+([^\n]+)/i);
        const previewMatch = emailSection.match(/Preview[\s:]+([^\n]+)/i);
        const ctaMatch = emailSection.match(/CTA[\s:]+([^\n]+)/i) ||
                        emailSection.match(/\[([^\]]+)\]/);

        const timingOptions = ['Day 1', 'Day 3', 'Day 5', 'Day 7', 'Day 10'];
        const timing = timingOptions[Math.min(number - 1, 4)] || `Day ${number * 2 - 1}`;

        let body = emailSection
          .replace(/Email\s+\d+[\s:]+[^\n]+\n/gi, '')
          .replace(/Day\s+\d+[\s:-]+[^\n]+\n/gi, '')
          .replace(/\d+\.\s*[^\n]+\n/, '')
          .replace(/Subject[\s:]+[^\n]+/gi, '')
          .replace(/Preview[\s:]+[^\n]+/gi, '')
          .replace(/CTA[\s:]+[^\n]+/gi, '')
          .replace(/\[[^\]]+\]/, '')
          .trim();

        body = body.substring(0, Math.min(body.length, 800));

        emails.push({
          number,
          name: title,
          timing,
          subject: subjectMatch?.[1]?.trim() || title,
          preview: previewMatch?.[1]?.trim() || body.substring(0, 100) + '...',
          body: body || emailSection.substring(0, 500),
          cta: ctaMatch?.[1]?.trim() || 'Learn More',
        });
      });

      if (emails.length > 0) break;
    }
  }

  return emails.slice(0, 5);
}

export function getPostTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'launch': 'bg-blue-500',
    'value': 'bg-emerald-500',
    'engagement': 'bg-amber-500',
    'social-proof': 'bg-purple-500',
    'urgency': 'bg-red-500',
  };
  return colors[type] || 'bg-gray-500';
}

export function getPostTypeEmoji(type: string): string {
  const emojis: Record<string, string> = {
    'Carousel': '🎠',
    'Single': '📷',
    'Reel': '🎬',
    'Story': '📱',
  };
  return emojis[type] || '📷';
}
