'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Loader2, Check, Circle, Lightbulb, Users, Target, Palette, DollarSign, FileText, Rocket, Mail, Zap, Save, CheckCircle2, Twitter, Instagram, ChevronDown, Clock, Bell, TrendingUp, MousePointerClick, Eye, ShoppingCart, UserPlus, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TwitterCalendar } from '@/components/TwitterCalendar';
import { InstagramGrid } from '@/components/InstagramGrid';
import { EmailFlow } from '@/components/EmailFlow';
import { CompetitiveEdgeDashboard } from '@/components/CompetitiveEdgeDashboard';
import { parseTwitterPosts, parseInstagramPosts, parseEmailSequence, TwitterPost, InstagramPost } from '@/lib/marketing-parsers';

const SECTIONS = [
  { id: 'business-concept', title: 'Business Concept', icon: Lightbulb },
  { id: 'customer-persona', title: 'Customer Persona', icon: Users },
  { id: 'competitive-landscape', title: 'Competitive Landscape', icon: Target },
  { id: 'brand-identity', title: 'Brand Identity', icon: Palette },
  { id: 'pricing-strategy', title: 'Pricing Strategy', icon: DollarSign },
  { id: 'landing-page-copy', title: 'Landing Page Copy', icon: FileText },
  { id: 'launch-roadmap', title: '30-Day Roadmap', icon: Rocket },
  { id: 'marketing-kit', title: 'Marketing Kit', icon: Mail },
  { id: 'competitive-edge', title: 'Competitive Edge', icon: Zap },
];

function parseKPIs(content: string) {
  const kpis: Array<{
    name: string;
    target: string;
    timeframe: string;
  }> = [];

  // First, try to parse the new format with ---METRICS--- delimiters
  const metricsMatch = content.match(/---METRICS---\s*([\s\S]*?)\s*---END METRICS---/);

  if (metricsMatch) {
    const metricsContent = metricsMatch[1].trim();
    const lines = metricsContent.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const parts = trimmed.split('|');
      if (parts.length === 3) {
        kpis.push({
          name: parts[0].trim(),
          target: parts[1].trim(),
          timeframe: parts[2].trim(),
        });
      }
    }

    return kpis;
  }

  // Fallback to old format for existing data
  const lines = content.split('\n');
  let inKPISection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.match(/^#{2,3}\s*(Key Metrics|Metrics to Track|KPIs|Success Metrics)/i)) {
      inKPISection = true;
      continue;
    }

    if (inKPISection) {
      if (line.match(/^#{2,3}\s/)) {
        break;
      }

      const kpiMatch = line.match(/^[-*•]\s*(.+?):\s*(.+)$/);
      if (kpiMatch) {
        const name = kpiMatch[1].trim();
        const value = kpiMatch[2].trim();

        let target = value;
        let timeframe = 'Month 1';

        const timeframeMatch = value.match(/\(([^)]+)\)$/);
        if (timeframeMatch) {
          timeframe = timeframeMatch[1];
          target = value.replace(/\s*\([^)]+\)$/, '').trim();
        } else if (value.match(/within\s+(\d+)\s+days?/i)) {
          const daysMatch = value.match(/within\s+(\d+)\s+days?/i);
          if (daysMatch) {
            timeframe = `${daysMatch[1]} days`;
            target = value.replace(/\s*within\s+\d+\s+days?/i, '').trim();
          }
        } else if (value.match(/month\s+(\d+)/i)) {
          const monthMatch = value.match(/month\s+(\d+)/i);
          if (monthMatch) {
            timeframe = `Month ${monthMatch[1]}`;
            target = value.replace(/\s*month\s+\d+/i, '').trim();
          }
        }

        kpis.push({
          name,
          target,
          timeframe,
        });
      }
    }
  }

  return kpis;
}

function getKPIIcon(kpiName: string) {
  const name = kpiName.toLowerCase();

  if (name.includes('visitor') || name.includes('traffic') || name.includes('view')) {
    return Eye;
  } else if (name.includes('conversion') || name.includes('click') || name.includes('ctr')) {
    return MousePointerClick;
  } else if (name.includes('sale') || name.includes('revenue') || name.includes('purchase')) {
    return ShoppingCart;
  } else if (name.includes('user') || name.includes('signup') || name.includes('subscriber')) {
    return UserPlus;
  } else if (name.includes('growth') || name.includes('rate')) {
    return TrendingUp;
  } else {
    return Target;
  }
}

function getKPIEmoji(kpiName: string) {
  const name = kpiName.toLowerCase();

  if (name.includes('visitor') || name.includes('traffic') || name.includes('view')) {
    return '👁';
  } else if (name.includes('subscriber') || name.includes('email')) {
    return '📧';
  } else if (name.includes('conversion') || name.includes('rate') && !name.includes('satisfaction')) {
    return '📈';
  } else if (name.includes('sale') || name.includes('revenue') || name.includes('purchase') || name.includes('mrr') || name.includes('dollar')) {
    return '💰';
  } else if (name.includes('satisfaction') || name.includes('rating') || name.includes('nps')) {
    return '⭐';
  } else if (name.includes('user') || name.includes('signup') || name.includes('registration')) {
    return '👥';
  } else if (name.includes('growth')) {
    return '📊';
  } else {
    return '📊';
  }
}

function parseRoadmapContent(content: string) {
  const weeks: Array<{
    title: string;
    weekNumber: number;
    tasks: Array<{
      id: string;
      text: string;
      timeEstimate: string;
    }>;
  }> = [];

  // Remove the ---METRICS--- section entirely before parsing
  let cleanedContent = content.replace(/---METRICS---\s*[\s\S]*?\s*---END METRICS---/g, '');

  const lines = cleanedContent.split('\n');
  let currentWeek: typeof weeks[0] | null = null;
  let taskCounter = 0;
  let inKPISection = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Also handle old format KPI sections
    if (trimmedLine.match(/^#{2,3}\s*(Key Metrics|Metrics to Track|KPIs|Success Metrics)/i)) {
      inKPISection = true;
      continue;
    }

    if (inKPISection && trimmedLine.match(/^#{2,3}\s/)) {
      inKPISection = false;
    }

    if (inKPISection) {
      continue;
    }

    const weekMatch = trimmedLine.match(/^#{2,3}\s*Week\s*(\d+):?\s*(.+)/i);
    if (weekMatch) {
      if (currentWeek) weeks.push(currentWeek);
      const weekNum = parseInt(weekMatch[1]);
      currentWeek = {
        title: weekMatch[2].trim(),
        weekNumber: weekNum,
        tasks: [],
      };
      taskCounter = 0;
    } else if (currentWeek) {
      const taskMatch = trimmedLine.match(/^[-*•]\s*(.+?)(?:\s*\(([0-9-]+\s*(?:hrs?|hours?|days?|minutes?|mins?))\))?$/i);
      if (taskMatch) {
        const fullText = taskMatch[1].trim();
        if (fullText.startsWith('[') || fullText.toLowerCase().includes('total]')) {
          continue;
        }

        taskCounter++;
        const taskId = `week-${currentWeek.weekNumber}-task-${taskCounter}`;
        let taskText = fullText;
        let timeEstimate = taskMatch[2] || '2 hrs';

        if (!taskMatch[2]) {
          const inlineTimeMatch = taskText.match(/\(([0-9-]+\s*(?:hrs?|hours?|days?|minutes?|mins?))\)$/i);
          if (inlineTimeMatch) {
            timeEstimate = inlineTimeMatch[1];
            taskText = taskText.replace(/\s*\([^)]+\)$/, '').trim();
          }
        }

        currentWeek.tasks.push({
          id: taskId,
          text: taskText,
          timeEstimate: timeEstimate,
        });
      }
    }
  }

  if (currentWeek) weeks.push(currentWeek);
  return weeks;
}

export default function ProjectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [activeSection, setActiveSection] = useState('business-concept');
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [sections, setSections] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveDebounceTimer, setSaveDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const [twitterContent, setTwitterContent] = useState('');
  const [instagramContent, setInstagramContent] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [competitiveEdgeContent, setCompetitiveEdgeContent] = useState('');
  const [landingPageHtml, setLandingPageHtml] = useState('');
  const [roadmapChecklistState, setRoadmapChecklistState] = useState<Record<string, boolean>>({});

  const [isGeneratingTwitter, setIsGeneratingTwitter] = useState(false);
  const [isGeneratingInstagram, setIsGeneratingInstagram] = useState(false);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [isGeneratingCompetitiveEdge, setIsGeneratingCompetitiveEdge] = useState(false);
  const [isGeneratingLandingPage, setIsGeneratingLandingPage] = useState(false);
  const [showLandingPageSuccess, setShowLandingPageSuccess] = useState(false);

  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [isGeneratingHeroImages, setIsGeneratingHeroImages] = useState(false);

  const [twitterPosts, setTwitterPosts] = useState<TwitterPost[]>([]);
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);

  const projectId = searchParams.get('id');
  const idea = searchParams.get('idea');
  const industry = searchParams.get('industry');
  const market = searchParams.get('market');
  const location = searchParams.get('location');
  const budget = searchParams.get('budget');
  const technical = searchParams.get('technical');
  const time = searchParams.get('time');

  useEffect(() => {
    if (projectId && user) {
      loadProject();
    } else if (idea) {
      setProjectTitle(idea);
      const autoName = idea.substring(0, 50).trim();
      setProjectName(autoName);
      generateInitialSections();
    } else {
      router.push('/');
    }
  }, [projectId, idea, user]);

  useEffect(() => {
    return () => {
      if (saveDebounceTimer) {
        clearTimeout(saveDebounceTimer);
      }
    };
  }, [saveDebounceTimer]);

  useEffect(() => {
    setShowLandingPageSuccess(false);
  }, [activeSection]);

  const loadProject = async () => {
    if (!projectId || !user) return;

    try {
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error || !data) {
        console.error('Error loading project:', error);
        router.push('/');
        return;
      }

      setGenerationId(data.id);
      setProjectTitle(data.business_idea);
      setSections(data.sections || {});
      setTwitterContent(data.twitter_plan || '');
      setInstagramContent(data.instagram_plan || '');
      setEmailContent(data.email_sequence || '');
      setCompetitiveEdgeContent(data.competitive_edge || '');
      setLandingPageHtml(data.landing_page_html || '');
      setRoadmapChecklistState(data.roadmap_checklist_state || {});

      if (!data.project_name && data.business_idea) {
        const autoName = data.business_idea.substring(0, 50).trim();
        setProjectName(autoName);

        await supabase
          .from('generations')
          .update({ project_name: autoName })
          .eq('id', data.id);
      } else {
        setProjectName(data.project_name || '');
      }
    } catch (error) {
      console.error('Error loading project:', error);
      router.push('/');
    }
  };

  const generateInitialSections = async () => {
    if (!idea) return;

    setIsGenerating(true);
    setLoadingMessage('Analyzing your business idea...');

    const messages = [
      'Analyzing your business idea...',
      'Researching market opportunities...',
      'Building customer persona...',
      'Mapping competitive landscape...',
      'Crafting brand identity...',
      'Developing pricing strategy...',
      'Writing landing page copy...',
      'Creating launch roadmap...',
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 3000);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, industry, market, location, budget, technical, time }),
      });

      if (!response.ok) throw new Error('Failed to generate');

      const data = await response.json();
      setSections(data.sections);

      clearInterval(messageInterval);
      setIsGenerating(false);

      if (user) {
        await saveProject(data.sections);
      }
    } catch (error) {
      console.error('Error generating content:', error);
      clearInterval(messageInterval);
      setIsGenerating(false);
      alert('Failed to generate content. Please try again.');
    }
  };

  const saveProject = async (sectionsData?: Record<string, string>) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const context = { market, location, budget, technical, time };
      const dataToSave = sectionsData || sections;
      const titleToSave = projectTitle || idea || '';

      console.log('Saving project with project_name:', projectName);

      if (generationId) {
        const { error } = await supabase
          .from('generations')
          .update({
            business_idea: titleToSave,
            project_name: projectName || null,
            sections: dataToSave,
            context,
            industry,
            updated_at: new Date().toISOString(),
          })
          .eq('id', generationId);

        if (error) {
          console.error('Error updating project:', error);
        } else {
          console.log('Project updated successfully');
        }
      } else {
        const { data, error } = await supabase
          .from('generations')
          .insert({
            user_id: user.id,
            business_idea: titleToSave,
            project_name: projectName || null,
            industry,
            context,
            sections: dataToSave,
          })
          .select()
          .maybeSingle();

        if (error) {
          console.error('Error saving project:', error);
        } else if (data) {
          setGenerationId(data.id);
          console.log('Project created successfully with id:', data.id);
        }
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('Error in saveProject:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const debouncedSaveProjectName = (newName: string) => {
    if (saveDebounceTimer) {
      clearTimeout(saveDebounceTimer);
    }

    const timer = setTimeout(async () => {
      if (generationId && user) {
        setIsSaving(true);
        try {
          console.log('Debounced save - updating project_name to:', newName);
          const { error } = await supabase
            .from('generations')
            .update({
              project_name: newName || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', generationId);

          if (error) {
            console.error('Error updating project name:', error);
          } else {
            console.log('Project name saved successfully:', newName);
            setLastSaved(new Date());
          }
        } catch (error) {
          console.error('Error in debouncedSaveProjectName:', error);
        } finally {
          setIsSaving(false);
        }
      }
    }, 500);

    setSaveDebounceTimer(timer);
  };

  const updateAsset = async (field: string, value: string) => {
    if (!user || !generationId) return;

    try {
      const { error } = await supabase
        .from('generations')
        .update({
          [field]: value,
          updated_at: new Date().toISOString(),
        })
        .eq('id', generationId);

      if (error) console.error('Error updating asset:', error);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error in updateAsset:', error);
    }
  };

  const handleTitleSave = async () => {
    setIsEditingTitle(false);
    if (generationId && user) {
      await saveProject();
    }
  };

  const handleNameSave = async () => {
    setIsEditingName(false);
    if (generationId && user) {
      await saveProject();
    }
  };

  const getEffectiveProjectName = () => {
    if (projectName) return projectName;
    const ideaText = projectTitle || idea || '';
    const words = ideaText.split(' ').slice(0, 5).join(' ');
    return words.length > 50 ? words.substring(0, 50) + '...' : words;
  };

  const getSectionStatus = (sectionId: string) => {
    if (sectionId === 'marketing-kit') {
      return twitterContent || instagramContent || emailContent ? 'completed' : 'pending';
    }
    if (sectionId === 'competitive-edge') {
      return competitiveEdgeContent ? 'completed' : 'pending';
    }
    return sections[sectionId] ? 'completed' : 'pending';
  };

  const formatLabel = (value: string | null) => {
    if (!value) return null;
    return value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const createSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const getBusinessContext = () => {
    const conceptSection = sections['business-concept'];
    const personaSection = sections['customer-persona'];
    const pricingSection = sections['pricing-strategy'];

    let context = `Business Idea: ${projectTitle}\n\n`;
    if (market) context += `Target Market: ${formatLabel(market)}\n`;
    if (location) context += `Geography: ${formatLabel(location)}\n`;
    if (budget) context += `Budget: ${formatLabel(budget)}\n\n`;

    if (conceptSection) {
      context += `Business Concept:\n${conceptSection.substring(0, 500)}...\n\n`;
    }
    if (personaSection) {
      context += `Target Customer:\n${personaSection.substring(0, 500)}...\n\n`;
    }
    if (pricingSection) {
      context += `Pricing:\n${pricingSection.substring(0, 300)}...\n`;
    }

    return context;
  };

  const getBrandVoice = () => {
    const brandSection = sections['brand-identity'];
    if (!brandSection) {
      return 'Professional, approachable, and value-driven';
    }
    return brandSection.substring(0, 500);
  };

  const extractBrandColors = () => {
    const brandSection = sections['brand-identity'];
    if (!brandSection) return { primary: '#10b981', secondary: '#f59e0b' };

    const primaryMatch = brandSection.match(/primary[^#]*#([0-9a-fA-F]{6})/i);
    const secondaryMatch = brandSection.match(/secondary[^#]*#([0-9a-fA-F]{6})/i);

    return {
      primary: primaryMatch ? `#${primaryMatch[1]}` : '#10b981',
      secondary: secondaryMatch ? `#${secondaryMatch[1]}` : '#f59e0b',
    };
  };

  const updateChecklistState = async (taskId: string, checked: boolean) => {
    const newState = { ...roadmapChecklistState, [taskId]: checked };
    setRoadmapChecklistState(newState);

    if (generationId) {
      try {
        await supabase
          .from('generations')
          .update({ roadmap_checklist_state: newState })
          .eq('id', generationId);
      } catch (error) {
        console.error('Error updating checklist state:', error);
      }
    }
  };

  const handleGenerateMarketing = async (type: 'twitter' | 'instagram' | 'email') => {
    const setLoading = type === 'twitter' ? setIsGeneratingTwitter :
                       type === 'instagram' ? setIsGeneratingInstagram :
                       setIsGeneratingEmail;

    const setContent = type === 'twitter' ? setTwitterContent :
                       type === 'instagram' ? setInstagramContent :
                       setEmailContent;

    setLoading(true);

    try {
      const response = await fetch('/api/generate-marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          businessContext: getBusinessContext(),
          brandVoice: getBrandVoice(),
          idea: projectTitle,
          industry: industry || '',
          projectName: projectName || '',
        }),
      });

      if (!response.ok) throw new Error('Failed to generate marketing content');

      const data = await response.json();
      setContent(data.content);

      const fieldMap = {
        twitter: 'twitter_plan',
        instagram: 'instagram_plan',
        email: 'email_sequence',
      };
      await updateAsset(fieldMap[type], data.content);
    } catch (error) {
      console.error('Error generating marketing content:', error);
      alert('Failed to generate marketing content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCompetitiveEdge = async () => {
    setIsGeneratingCompetitiveEdge(true);

    try {
      const competitiveSection = sections['competitive-landscape'];
      const competitors = competitiveSection || 'No competitive analysis available yet.';

      const response = await fetch('/api/generate-competitive-edge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessContext: getBusinessContext(),
          competitors,
          budget: formatLabel(budget) || 'Not specified',
          technical: formatLabel(technical) || 'Not specified',
          time: formatLabel(time) || 'Not specified',
        }),
      });

      if (!response.ok) throw new Error('Failed to generate competitive edge');

      const data = await response.json();
      setCompetitiveEdgeContent(data.content);
      await updateAsset('competitive_edge', data.content);
    } catch (error) {
      console.error('Error generating competitive edge:', error);
      alert('Failed to generate competitive edge. Please try again.');
    } finally {
      setIsGeneratingCompetitiveEdge(false);
    }
  };

  const handleDownloadLandingPage = () => {
    if (!landingPageHtml) return;

    const slug = createSlug(projectTitle);
    const filename = `${slug}-landing-page.html`;
    const blob = new Blob([landingPageHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerateLandingPage = async () => {
    const landingSection = sections['landing-page-copy'];
    if (!landingSection) return;

    setIsGeneratingLandingPage(true);

    try {
      const colors = extractBrandColors();
      const slug = createSlug(projectTitle);

      const response = await fetch('/api/generate-landing-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landingPageCopy: landingSection,
          brandColors: colors,
          businessName: getEffectiveProjectName(),
        }),
      });

      if (!response.ok) throw new Error('Failed to generate landing page');

      const data = await response.json();
      const html = data.html;

      setLandingPageHtml(html);
      await updateAsset('landing_page_html', html);
      setShowLandingPageSuccess(true);

      const filename = `${slug}-landing-page.html`;
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating landing page:', error);
      alert('Failed to generate landing page. Please try again.');
    } finally {
      setIsGeneratingLandingPage(false);
    }
  };

  const handleExportMarketing = (type: 'twitter' | 'instagram' | 'email', content: string) => {
    if (!content) return;

    const slug = createSlug(projectTitle);
    const typeName = type === 'twitter' ? 'twitter-plan' :
                     type === 'instagram' ? 'instagram-campaign' :
                     'email-sequence';
    const filename = `${slug}-${typeName}.md`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCompetitiveEdge = () => {
    if (!competitiveEdgeContent) return;

    const slug = createSlug(projectTitle);
    const filename = `${slug}-competitive-edge.md`;

    const blob = new Blob([competitiveEdgeContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerateHeroImages = async () => {
    setIsGeneratingHeroImages(true);
    try {
      const businessContext = sections['business-concept'] || projectTitle;
      const prompt = `Website hero image, modern SaaS aesthetic, abstract flowing shapes, gradient, professional business, clean minimal style. No text. Business type: ${businessContext.substring(0, 200)}. Wide cinematic format.`;

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspect_ratio: '16:9',
          num_outputs: 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate images');
      }

      const data = await response.json();
      console.log('Hero - Response data:', data);
      console.log('Hero - Images array:', data.images);

      const validatedImages = (data.images || []).map((img: any) =>
        typeof img === 'string' ? img : String(img)
      );
      console.log('Hero - Validated images:', validatedImages);
      setHeroImages(validatedImages);
    } catch (error) {
      console.error('Error generating hero images:', error);
      alert(error instanceof Error && error.message === 'Image generation not configured'
        ? 'Image generation not configured'
        : 'Failed to generate images. Please try again.');
    } finally {
      setIsGeneratingHeroImages(false);
    }
  };

  const handleUpdateTwitterPost = (day: number, updates: Partial<TwitterPost>) => {
    setTwitterPosts(prevPosts =>
      prevPosts.map(post =>
        post.day === day ? { ...post, ...updates } : post
      )
    );
  };

  const handleUpdateInstagramPost = (day: number, updates: Partial<InstagramPost>) => {
    setInstagramPosts(prevPosts =>
      prevPosts.map(post =>
        post.day === day ? { ...post, ...updates } : post
      )
    );
  };

  const handleDownloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  const handleExportFullPlan = () => {
    let fullPlan = `# ${projectTitle}\n\n`;

    SECTIONS.forEach((section) => {
      if (section.id === 'marketing-kit') {
        fullPlan += `\n## ${section.title}\n\n`;
        if (twitterContent) fullPlan += `### Twitter Campaign\n\n${twitterContent}\n\n`;
        if (instagramContent) fullPlan += `### Instagram Campaign\n\n${instagramContent}\n\n`;
        if (emailContent) fullPlan += `### Email Sequence\n\n${emailContent}\n\n`;
      } else if (section.id === 'competitive-edge') {
        if (competitiveEdgeContent) {
          fullPlan += `\n## ${section.title}\n\n${competitiveEdgeContent}\n\n`;
        }
      } else {
        const content = sections[section.id];
        if (content) {
          fullPlan += `\n## ${section.title}\n\n${content}\n\n`;
        }
      }
    });

    const slug = createSlug(projectTitle);
    const filename = `${slug}-full-plan.md`;

    const blob = new Blob([fullPlan], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderSectionContent = () => {
    const section = SECTIONS.find(s => s.id === activeSection);
    if (!section) return null;

    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
          <p className="text-lg text-gray-600">{loadingMessage}</p>
        </div>
      );
    }

    if (activeSection === 'marketing-kit') {
      return (
        <div className="space-y-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50">
                <Twitter className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Twitter Launch Plan</h3>
                <p className="text-sm text-slate-600">
                  7-day Twitter content calendar with daily posts and optimal posting times
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              {twitterContent ? (
                <>
                  <Button
                    onClick={() => handleExportMarketing('twitter', twitterContent)}
                    variant="outline"
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    onClick={() => handleGenerateMarketing('twitter')}
                    disabled={isGeneratingTwitter}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    {isGeneratingTwitter ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      'Regenerate'
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => handleGenerateMarketing('twitter')}
                  disabled={isGeneratingTwitter}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  {isGeneratingTwitter ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Twitter className="mr-2 h-4 w-4" />
                      Generate Twitter Plan
                    </>
                  )}
                </Button>
              )}
            </div>
            {twitterContent && (
              <div className="mt-6">
                {(() => {
                  const parsedPosts = parseTwitterPosts(twitterContent);
                  if (parsedPosts.length > 0) {
                    if (twitterPosts.length === 0 || twitterPosts.length !== parsedPosts.length) {
                      const mergedPosts = parsedPosts.map(parsedPost => {
                        const existingPost = twitterPosts.find(p => p.day === parsedPost.day);
                        return existingPost ? { ...parsedPost, image_url: existingPost.image_url } : parsedPost;
                      });
                      setTimeout(() => setTwitterPosts(mergedPosts), 0);
                      return <TwitterCalendar posts={mergedPosts} onUpdatePost={handleUpdateTwitterPost} />;
                    }
                    return <TwitterCalendar posts={twitterPosts} onUpdatePost={handleUpdateTwitterPost} />;
                  }
                  return (
                    <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 bg-slate-50 rounded-lg p-6">
                      <ReactMarkdown>{twitterContent}</ReactMarkdown>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-pink-50">
                <Instagram className="h-5 w-5 text-pink-600" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Instagram Campaign</h3>
                <p className="text-sm text-slate-600">
                  7-day Instagram strategy with captions, hashtags, and image descriptions
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              {instagramContent ? (
                <>
                  <Button
                    onClick={() => handleExportMarketing('instagram', instagramContent)}
                    variant="outline"
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    onClick={() => handleGenerateMarketing('instagram')}
                    disabled={isGeneratingInstagram}
                    className="bg-pink-600 hover:bg-pink-700 text-white rounded-lg"
                  >
                    {isGeneratingInstagram ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      'Regenerate'
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => handleGenerateMarketing('instagram')}
                  disabled={isGeneratingInstagram}
                  className="bg-pink-600 hover:bg-pink-700 text-white rounded-lg"
                >
                  {isGeneratingInstagram ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Instagram className="mr-2 h-4 w-4" />
                      Generate Instagram Campaign
                    </>
                  )}
                </Button>
              )}
            </div>
            {instagramContent && (
              <div className="mt-6">
                {(() => {
                  const parsedPosts = parseInstagramPosts(instagramContent);
                  if (parsedPosts.length > 0) {
                    if (instagramPosts.length === 0 || instagramPosts.length !== parsedPosts.length) {
                      const mergedPosts = parsedPosts.map(parsedPost => {
                        const existingPost = instagramPosts.find(p => p.day === parsedPost.day);
                        return existingPost ? { ...parsedPost, image_url: existingPost.image_url } : parsedPost;
                      });
                      setTimeout(() => setInstagramPosts(mergedPosts), 0);
                      return <InstagramGrid posts={mergedPosts} onUpdatePost={handleUpdateInstagramPost} />;
                    }
                    return <InstagramGrid posts={instagramPosts} onUpdatePost={handleUpdateInstagramPost} />;
                  }
                  return (
                    <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 bg-slate-50 rounded-lg p-6">
                      <ReactMarkdown>{instagramContent}</ReactMarkdown>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50">
                <Mail className="h-5 w-5 text-amber-600" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Email Sequence</h3>
                <p className="text-sm text-slate-600">
                  5-email launch sequence to nurture leads and drive conversions
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              {emailContent ? (
                <>
                  <Button
                    onClick={() => handleExportMarketing('email', emailContent)}
                    variant="outline"
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    onClick={() => handleGenerateMarketing('email')}
                    disabled={isGeneratingEmail}
                    className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
                  >
                    {isGeneratingEmail ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      'Regenerate'
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => handleGenerateMarketing('email')}
                  disabled={isGeneratingEmail}
                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
                >
                  {isGeneratingEmail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Generate Email Sequence
                    </>
                  )}
                </Button>
              )}
            </div>
            {emailContent && (
              <div className="mt-6">
                {(() => {
                  const emailSequence = parseEmailSequence(emailContent);
                  if (emailSequence.length > 0) {
                    return <EmailFlow emails={emailSequence} />;
                  }
                  return (
                    <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 bg-slate-50 rounded-lg p-6">
                      <ReactMarkdown>{emailContent}</ReactMarkdown>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeSection === 'launch-roadmap') {
      const content = sections[activeSection];
      if (!content) {
        return (
          <div className="text-center py-12 text-gray-500">
            This section will be generated automatically
          </div>
        );
      }

      const weeks = parseRoadmapContent(content);
      const totalTasks = weeks.reduce((acc, week) => acc + week.tasks.length, 0);
      const completedTasks = weeks.reduce((acc, week) => {
        return acc + week.tasks.filter(task => roadmapChecklistState[task.id]).length;
      }, 0);
      const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      const handleExportRoadmap = () => {
        const slug = createSlug(projectTitle);
        const filename = `${slug}-launch-roadmap.md`;
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };

      return (
        <div className="space-y-6">
          {weeks.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-100 rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
                  <p className="text-sm text-gray-600">{completedTasks} of {totalTasks} tasks complete</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleExportRoadmap}
                    variant="outline"
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Roadmap
                  </Button>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {weeks.length > 0 ? (
            <Accordion type="multiple" className="space-y-4">
              {weeks.map((week) => {
                const weekCompletedTasks = week.tasks.filter(task => roadmapChecklistState[task.id]).length;
                const weekTotalTasks = week.tasks.length;
                const weekProgress = weekTotalTasks > 0 ? (weekCompletedTasks / weekTotalTasks) * 100 : 0;
                const isWeekComplete = weekProgress === 100;

                return (
                  <AccordionItem
                    key={`week-${week.weekNumber}`}
                    value={`week-${week.weekNumber}`}
                    className="border-2 rounded-lg px-6 bg-white"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${isWeekComplete ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                            {isWeekComplete ? (
                              <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                            ) : (
                              <span className="text-sm font-bold text-gray-700">{week.weekNumber}</span>
                            )}
                          </div>
                          <div className="text-left">
                            <h4 className="text-base font-semibold text-gray-900">Week {week.weekNumber}: {week.title}</h4>
                            <p className="text-sm text-gray-600">{weekCompletedTasks}/{weekTotalTasks} complete</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${isWeekComplete ? 'bg-indigo-600' : 'bg-blue-600'}`}
                              style={{ width: `${weekProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                      <div className="space-y-3">
                        {week.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                          >
                            <Checkbox
                              id={task.id}
                              checked={roadmapChecklistState[task.id] || false}
                              onCheckedChange={(checked) => updateChecklistState(task.id, checked as boolean)}
                              className="mt-0.5"
                            />
                            <label
                              htmlFor={task.id}
                              className="flex-1 cursor-pointer select-none"
                            >
                              <span className={`text-sm ${roadmapChecklistState[task.id] ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {task.text}
                              </span>
                            </label>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                                <Clock className="h-3 w-3" />
                                {task.timeEstimate}
                              </span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded">
                                      <Bell className="h-4 w-4 text-gray-400" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Reminders coming soon!</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <Button
                  onClick={handleExportRoadmap}
                  variant="outline"
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Roadmap
                </Button>
              </div>
              <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 bg-slate-50 rounded-lg p-6">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </>
          )}

          {(() => {
            const kpis = parseKPIs(content);
            if (kpis.length === 0) return null;

            return (
              <div className="mt-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Metrics to Track</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {kpis.map((kpi, index) => {
                    const emoji = getKPIEmoji(kpi.name);
                    return (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex items-start justify-between">
                            <div className="text-4xl">
                              {emoji}
                            </div>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
                              {kpi.timeframe}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-emerald-50 mb-2">
                              {kpi.name}
                            </h4>
                            <p className="text-3xl font-bold text-white">
                              {kpi.target}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      );
    }

    if (activeSection === 'competitive-edge') {
      return (
        <div>
          <div className="text-slate-600 mb-6">
            Analyze your competitive advantages, positioning strategy, and market entry wedge based on your specific constraints and opportunities.
          </div>

          <div className="flex gap-3 mb-6">
            {competitiveEdgeContent ? (
              <>
                <Button
                  onClick={handleExportCompetitiveEdge}
                  variant="outline"
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Competitive Edge
                </Button>
                <Button
                  onClick={handleGenerateCompetitiveEdge}
                  disabled={isGeneratingCompetitiveEdge}
                  className="bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white"
                >
                  {isGeneratingCompetitiveEdge ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    'Regenerate Analysis'
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleGenerateCompetitiveEdge}
                disabled={isGeneratingCompetitiveEdge}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white"
              >
                {isGeneratingCompetitiveEdge ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing your competitive advantages...
                  </>
                ) : (
                  'Generate Competitive Edge Analysis'
                )}
              </Button>
            )}
          </div>

          {competitiveEdgeContent && (
            <CompetitiveEdgeDashboard content={competitiveEdgeContent} />
          )}
        </div>
      );
    }

    if (activeSection === 'landing-page-copy') {
      const content = sections[activeSection];
      return (
        <div>
          {content && (
            <>
              <div className="mb-6 flex gap-3">
                {landingPageHtml && (
                  <Button
                    onClick={handleDownloadLandingPage}
                    variant="outline"
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Landing Page
                  </Button>
                )}
                <Button
                  onClick={handleGenerateLandingPage}
                  disabled={isGeneratingLandingPage}
                  className="bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white"
                >
                  {isGeneratingLandingPage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Landing Page...
                    </>
                  ) : landingPageHtml ? (
                    'Regenerate Landing Page HTML'
                  ) : (
                    'Generate Landing Page HTML'
                  )}
                </Button>
                {showLandingPageSuccess && (
                  <Alert className="flex-1 bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Landing page HTML generated!
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 bg-slate-50 rounded-lg p-6">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Hero Images</h3>
                  <Button
                    onClick={handleGenerateHeroImages}
                    disabled={isGeneratingHeroImages}
                    className="bg-slate-700 hover:bg-slate-800 text-white rounded-lg"
                  >
                    {isGeneratingHeroImages ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating hero images...
                      </>
                    ) : heroImages.length > 0 ? (
                      'Regenerate'
                    ) : (
                      'Generate Hero Images'
                    )}
                  </Button>
                </div>

                {heroImages.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {heroImages.map((imageUrl, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                        <img
                          src={imageUrl}
                          alt={`Hero image option ${index + 1}`}
                          className="w-full h-auto"
                        />
                        <div className="p-3 flex gap-2">
                          <Button
                            onClick={() => handleDownloadImage(imageUrl, `hero-image-${index + 1}.webp`)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          {!content && (
            <div className="text-center py-12 text-gray-500">
              This section will be generated automatically
            </div>
          )}
        </div>
      );
    }

    const content = sections[activeSection];
    if (!content) {
      return (
        <div className="text-center py-12 text-gray-500">
          This section will be generated automatically
        </div>
      );
    }

    if (activeSection === 'business-concept') {
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border-2 border-indigo-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Give your project a memorable name that will be used in all generated content
            </p>
            <input
              type="text"
              value={projectName}
              onChange={(e) => {
                const newName = e.target.value;
                setProjectName(newName);
                debouncedSaveProjectName(newName);
              }}
              placeholder="e.g., TaskFlow, QuickBite, FitTracker..."
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 bg-slate-50 rounded-lg p-6">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      );
    }

    return (
      <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 bg-slate-50 rounded-lg p-6">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="flex h-screen bg-slate-50">
        <aside className="w-64 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="p-6">
            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-50 mb-6 rounded-lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={1.5} />
              Back to Dashboard
            </Button>

            <div className="space-y-1">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const status = getSectionStatus(section.id);
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                    <span className="flex-1 truncate">{section.title}</span>
                    {status === 'completed' ? (
                      <Check className="h-4 w-4 text-indigo-600 flex-shrink-0" strokeWidth={2} />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-300 flex-shrink-0" strokeWidth={1.5} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-slate-200 px-8 py-4">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1 flex items-center gap-3">
                {isEditingName ? (
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setProjectName(newName);
                      debouncedSaveProjectName(newName);
                    }}
                    onBlur={handleNameSave}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNameSave();
                      if (e.key === 'Escape') {
                        setIsEditingName(false);
                      }
                    }}
                    placeholder="Enter a memorable name..."
                    className="text-2xl font-bold text-gray-900 border-b-2 border-indigo-600 outline-none bg-transparent w-full max-w-3xl"
                    autoFocus
                  />
                ) : (
                  <h1
                    onClick={() => setIsEditingName(true)}
                    className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors"
                  >
                    {projectName || (
                      <span className="text-gray-400 italic">Click to add project name</span>
                    )}
                  </h1>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Info className="h-5 w-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-md">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-500">Original Business Idea:</p>
                        <p className="text-sm text-gray-700">{projectTitle}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-4">
                {lastSaved && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Saved {lastSaved.toLocaleTimeString()}</span>
                      </>
                    )}
                  </div>
                )}
                <Button
                  onClick={handleExportFullPlan}
                  variant="outline"
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Full Plan
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="max-w-4xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {SECTIONS.find(s => s.id === activeSection)?.title}
              </h2>
              {renderSectionContent()}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
