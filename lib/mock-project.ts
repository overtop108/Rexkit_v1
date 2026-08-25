export interface Kpi {
  label: string;
  value: string;
  suffix: string;
  subtext: string;
  progress: number;
  color: 'indigo' | 'blue' | 'amber' | 'red';
}

export interface Tier {
  name: string;
  price: string;
  suffix: string;
  subtitle: string;
  bullets: string[];
  recommended: boolean;
}

export interface CompetitorRow {
  competitor: string;
  offer: string;
  pricePerWeek: string;
  gap: string;
}

export interface RoadmapTask {
  id: string;
  text: string;
  day: string;
  done: boolean;
}

export interface MarketingTile {
  caption: string;
  gradient: string;
  imageUrl?: string;
}

export interface DayChip {
  day: string;
  hasContent: boolean;
}

export const mockProject = {
  name: 'Nyonya Box',
  description:
    "Weekly home-cooked Peranakan meal kits, delivered to condos along Singapore's East Coast, for time-poor families who miss grandma's cooking.",
  status: 'Generated · 9 of 9 sections',
  createdMeta: 'Created 14 Jan · 47 s generation',
  modelMeta: 'Model: Claude',
  activeSection: 'Pricing Strategy',
  sections: [
    'Validated Concept',
    'Customer Persona',
    'Competitive Landscape',
    'Brand Identity',
    'Pricing Strategy',
    'Landing Page Copy',
    '30-Day Roadmap',
    'Marketing Kit',
    'Competitive Edge',
  ],
  kpis: [
    {
      label: 'VALIDATION SCORE',
      value: '7.8',
      suffix: '/10',
      subtext: 'Strong demand signal, thin margins',
      progress: 78,
      color: 'indigo' as const,
    },
    {
      label: 'ADDRESSABLE MARKET',
      value: 'S$38M',
      suffix: '',
      subtext: 'East Coast condo households, meal-kit spend',
      progress: 100,
      color: 'blue' as const,
    },
    {
      label: 'SUGGESTED PRICE',
      value: 'S$89',
      suffix: '/wk',
      subtext: 'Family box, 4 meals · 42% gross margin',
      progress: 42,
      color: 'amber' as const,
    },
    {
      label: 'BREAK-EVEN',
      value: '140',
      suffix: ' subs',
      subtext: 'At current kitchen + delivery cost',
      progress: 30,
      color: 'red' as const,
    },
  ],
  tiers: [
    {
      name: 'Taster',
      price: 'S$49',
      suffix: '/wk',
      subtitle: '2 meals for two',
      bullets: ['Rotating weekly menu', 'Sunday delivery', 'Pause anytime'],
      recommended: false,
    },
    {
      name: 'Family',
      price: 'S$89',
      suffix: '/wk',
      subtitle: '4 meals for four',
      bullets: [
        'Everything in Taster',
        'Kid-friendly spice levels',
        'Choose 2 of 6 dishes',
        'Free rempah top-up',
      ],
      recommended: true,
    },
    {
      name: 'Kampung',
      price: 'S$149',
      suffix: '/wk',
      subtitle: 'Weekend feast for six',
      bullets: ['Everything in Family', 'Ayam buah keluak add-on', 'Priority Saturday slot'],
      recommended: false,
    },
  ],
  callout:
    'anchoring the Family tier at S$89 sits below a single restaurant dinner for four in Katong while clearing the 40% margin floor. The Kampung tier exists to make Family look reasonable, not to sell in volume.',
  stats: [
    { label: 'Target ARPU', value: 'S$92' },
    { label: 'Expected mix', value: '15 / 70 / 15' },
    { label: 'Annual churn assumption', value: '35%' },
  ],
  competitors: [
    {
      competitor: 'Office-lunch subs',
      offer: 'Pan-Asian, single-serve',
      pricePerWeek: 'S$60–75',
      gap: 'No family portions, no heritage cuisine',
    },
    {
      competitor: 'DIY meal kits',
      offer: 'Cook-it-yourself boxes',
      pricePerWeek: 'S$70–90',
      gap: '45 min prep; Nyonya Box is heat-and-serve',
    },
    {
      competitor: 'Hawker delivery',
      offer: 'Ad-hoc, GrabFood',
      pricePerWeek: 'S$25–40 / meal',
      gap: 'No planning, no consistency, fees stack up',
    },
  ],
  roadmap: {
    header: 'Weeks 1–3',
    totalTasks: 18,
    tasks: [
      { id: 't1', text: 'Register business & SFA licence check', day: 'Day 1', done: true },
      { id: 't2', text: 'Cost 6 launch dishes with a home cook', day: 'Day 2', done: true },
      { id: 't3', text: 'Set up landing page + waitlist', day: 'Day 3', done: true },
      { id: 't4', text: 'Run 20 doorstep interviews at One Amber, Silversea', day: 'Day 5', done: false },
      { id: 't5', text: 'Test-cook & photograph the Family box', day: 'Day 7', done: false },
      { id: 't6', text: 'First 10 paid pilot subscribers', day: 'Day 12', done: false },
      { id: 't7', text: 'Lock delivery partner for Sat/Sun slots', day: 'Day 14', done: false },
      { id: 't8', text: 'Decide: continue or kill', day: 'Day 18', done: false },
    ] as RoadmapTask[],
  },
  marketing: {
    header: 'Instagram grid · 7-day plan',
    tiles: [
      { caption: 'Launch', gradient: 'from-[#E8632B] to-[#B93D17]' },
      { caption: 'Buah keluak', gradient: 'from-[#5A3B2E] to-[#2E1B14]' },
      { caption: 'Grandma', gradient: 'from-[#1FA98A] to-[#0F6E5C]' },
    ] as MarketingTile[],
    dayChips: [
      { day: 'Mon', hasContent: true },
      { day: 'Tue', hasContent: true },
      { day: 'Wed', hasContent: false },
      { day: 'Thu', hasContent: true },
      { day: 'Fri', hasContent: false },
      { day: 'Sat', hasContent: true },
      { day: 'Sun', hasContent: false },
    ] as DayChip[],
  },
  user: {
    name: 'Pritesh',
    plan: 'Founder plan',
    projectsCount: 3,
    generationsLeft: 12,
  },
};
