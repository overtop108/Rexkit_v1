export interface UnfairAdvantage {
  title: string;
  summary: string;
  icon: string;
}

export interface DefensibilityScore {
  overall: number;
  easyCopy: string;
  switchingCosts: string;
  networkEffects: string;
}

export interface Competitor {
  name: string;
  weakness: string;
  winningMessage: string;
  targetWith: string[];
  dontCompeteOn: string[];
}

export interface FirstMoverOpportunity {
  number: number;
  title: string;
  timing: string;
  description: string;
  actions: string[];
  whyItMatters: string;
  fullContent: string;
}

export interface Wedge {
  main: string;
  messaging: string;
  product: string;
  psychology: string;
  goToMarket: string;
}

export interface CompetitiveEdgeData {
  advantages: UnfairAdvantage[];
  defensibility: DefensibilityScore;
  competitors: Competitor[];
  opportunities: FirstMoverOpportunity[];
  wedge: Wedge;
}

function extractFirstSentences(text: string, count: number = 2): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.slice(0, count).join(' ').trim();
}

function getIconForAdvantage(title: string): string {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('time') || lowerTitle.includes('timing') || lowerTitle.includes('window')) {
    return 'Clock';
  } else if (lowerTitle.includes('data') || lowerTitle.includes('insight') || lowerTitle.includes('knowledge')) {
    return 'Database';
  } else if (lowerTitle.includes('cost') || lowerTitle.includes('price') || lowerTitle.includes('economic')) {
    return 'DollarSign';
  } else if (lowerTitle.includes('network') || lowerTitle.includes('platform') || lowerTitle.includes('ecosystem')) {
    return 'LayoutDashboard';
  } else if (lowerTitle.includes('tech') || lowerTitle.includes('innovation') || lowerTitle.includes('speed')) {
    return 'Zap';
  } else if (lowerTitle.includes('brand') || lowerTitle.includes('reputation')) {
    return 'Award';
  } else if (lowerTitle.includes('team') || lowerTitle.includes('expert')) {
    return 'Users';
  } else {
    return 'Sparkles';
  }
}

export function parseCompetitiveEdge(content: string): CompetitiveEdgeData {
  const lines = content.split('\n');

  const data: CompetitiveEdgeData = {
    advantages: [],
    defensibility: {
      overall: 5,
      easyCopy: 'Moderate',
      switchingCosts: 'Low',
      networkEffects: 'None',
    },
    competitors: [],
    opportunities: [],
    wedge: {
      main: '',
      messaging: '',
      product: '',
      psychology: '',
      goToMarket: '',
    },
  };

  let currentSection = '';
  let currentSubsection = '';
  let currentCompetitor: Partial<Competitor> | null = null;
  let currentOpportunity: Partial<FirstMoverOpportunity> | null = null;
  let opportunityCounter = 0;
  let buffer = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.match(/^#{2}\s*Unfair Advantages?/i)) {
      currentSection = 'advantages';
      currentSubsection = '';
      buffer = '';
    } else if (line.match(/^#{2}\s*Defensibility/i)) {
      currentSection = 'defensibility';
      currentSubsection = '';
      buffer = '';
    } else if (line.match(/^#{2}\s*Competitor/i)) {
      currentSection = 'competitors';
      currentSubsection = '';
      buffer = '';
      if (currentCompetitor?.name) {
        data.competitors.push(currentCompetitor as Competitor);
      }
      currentCompetitor = null;
    } else if (line.match(/^#{2}\s*First-Mover/i)) {
      currentSection = 'opportunities';
      currentSubsection = '';
      buffer = '';
      if (currentCompetitor?.name) {
        data.competitors.push(currentCompetitor as Competitor);
        currentCompetitor = null;
      }
    } else if (line.match(/^#{2}\s*Your Wedge/i)) {
      currentSection = 'wedge';
      currentSubsection = '';
      buffer = '';
      if (currentOpportunity?.title) {
        data.opportunities.push(currentOpportunity as FirstMoverOpportunity);
        currentOpportunity = null;
      }
    } else if (line.match(/^#{3}\s*/)) {
      const title = line.replace(/^#{3}\s*/, '').trim();

      if (currentSection === 'advantages') {
        if (buffer && currentSubsection) {
          const summary = extractFirstSentences(buffer, 3);
          data.advantages.push({
            title: currentSubsection,
            summary,
            icon: getIconForAdvantage(currentSubsection),
          });
        }
        currentSubsection = title;
        buffer = '';
      } else if (currentSection === 'competitors') {
        if (title.toLowerCase().includes('weakness')) {
          currentSubsection = 'weakness';
          buffer = '';
        } else if (title.toLowerCase().includes('winning message')) {
          currentSubsection = 'message';
          buffer = '';
        } else if (title.toLowerCase().includes('target')) {
          currentSubsection = 'target';
          buffer = '';
        } else if (title.toLowerCase().includes('don\'t compete')) {
          currentSubsection = 'dontcompete';
          buffer = '';
        } else {
          if (currentCompetitor?.name) {
            data.competitors.push(currentCompetitor as Competitor);
          }
          currentCompetitor = {
            name: title,
            weakness: '',
            winningMessage: '',
            targetWith: [],
            dontCompeteOn: [],
          };
          currentSubsection = '';
          buffer = '';
        }
      } else if (currentSection === 'opportunities') {
        if (currentOpportunity?.title) {
          data.opportunities.push(currentOpportunity as FirstMoverOpportunity);
        }
        opportunityCounter++;
        currentOpportunity = {
          number: opportunityCounter,
          title: title,
          timing: 'Next 6-12 months',
          description: '',
          actions: [],
          whyItMatters: '',
          fullContent: '',
        };
        currentSubsection = '';
        buffer = '';
      } else if (currentSection === 'wedge') {
        currentSubsection = title.toLowerCase();
        buffer = '';
      }
    } else if (line.startsWith('-') || line.startsWith('*') || line.startsWith('•')) {
      const item = line.replace(/^[-*•]\s*/, '').trim();

      if (currentSection === 'competitors' && currentCompetitor) {
        if (currentSubsection === 'target') {
          currentCompetitor.targetWith = currentCompetitor.targetWith || [];
          currentCompetitor.targetWith.push(item);
        } else if (currentSubsection === 'dontcompete') {
          currentCompetitor.dontCompeteOn = currentCompetitor.dontCompeteOn || [];
          currentCompetitor.dontCompeteOn.push(item);
        }
      } else if (currentSection === 'opportunities' && currentOpportunity) {
        if (currentSubsection === 'actions' || buffer.toLowerCase().includes('action')) {
          if (!currentOpportunity.actions) currentOpportunity.actions = [];
          currentOpportunity.actions.push(item);
        }
        if (!currentOpportunity.fullContent) currentOpportunity.fullContent = '';
        currentOpportunity.fullContent += line + '\n';
      }
    } else if (line) {
      if (currentSection === 'opportunities' && currentOpportunity) {
        if (!currentOpportunity.fullContent) currentOpportunity.fullContent = '';
        currentOpportunity.fullContent += line + '\n';

        if (line.toLowerCase().includes('timing:') || line.toLowerCase().match(/^timing/i)) {
          currentSubsection = 'timing';
          const timingText = line.replace(/timing:/i, '').trim();
          if (timingText) {
            currentOpportunity.timing = timingText;
          }
        } else if (line.toLowerCase().includes('specific actions:') || line.toLowerCase().includes('actions:')) {
          currentSubsection = 'actions';
        } else if (line.toLowerCase().includes('why it matters:') || line.toLowerCase().includes('why this matters:')) {
          currentSubsection = 'whymatters';
          buffer = '';
        } else if (currentSubsection === 'timing' && line) {
          currentOpportunity.timing = line;
          currentSubsection = '';
        } else if (currentSubsection === 'whymatters' && line) {
          buffer += line + ' ';
        } else if (!currentSubsection && line) {
          if (!currentOpportunity.description) {
            currentOpportunity.description = line;
          } else {
            currentOpportunity.description += ' ' + line;
          }
        }
      }

      buffer += line + ' ';

      if (currentSection === 'defensibility' && !currentSubsection) {
        const scoreMatch = buffer.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
        if (scoreMatch) {
          data.defensibility.overall = parseFloat(scoreMatch[1]);
        }

        if (buffer.toLowerCase().includes('easy to copy') || buffer.toLowerCase().includes('copyability')) {
          if (buffer.toLowerCase().includes('high') || buffer.toLowerCase().includes('very easy')) {
            data.defensibility.easyCopy = 'High Risk';
          } else if (buffer.toLowerCase().includes('low') || buffer.toLowerCase().includes('difficult')) {
            data.defensibility.easyCopy = 'Low Risk';
          } else {
            data.defensibility.easyCopy = 'Moderate';
          }
        }

        if (buffer.toLowerCase().includes('switching cost')) {
          if (buffer.toLowerCase().includes('high') || buffer.toLowerCase().includes('significant')) {
            data.defensibility.switchingCosts = 'High';
          } else if (buffer.toLowerCase().includes('low') || buffer.toLowerCase().includes('minimal')) {
            data.defensibility.switchingCosts = 'Low';
          } else {
            data.defensibility.switchingCosts = 'Medium';
          }
        }

        if (buffer.toLowerCase().includes('network effect')) {
          if (buffer.toLowerCase().includes('strong') || buffer.toLowerCase().includes('significant')) {
            data.defensibility.networkEffects = 'Strong';
          } else if (buffer.toLowerCase().includes('none') || buffer.toLowerCase().includes('minimal')) {
            data.defensibility.networkEffects = 'None';
          } else {
            data.defensibility.networkEffects = 'Moderate';
          }
        }
      }
    }

    if (line.match(/^#{2}\s*/) && currentSection) {
      if (currentSection === 'advantages' && currentSubsection && buffer) {
        const summary = extractFirstSentences(buffer, 3);
        data.advantages.push({
          title: currentSubsection,
          summary,
          icon: getIconForAdvantage(currentSubsection),
        });
        buffer = '';
      } else if (currentSection === 'competitors' && currentCompetitor && currentSubsection && buffer) {
        const text = extractFirstSentences(buffer, 2);
        if (currentSubsection === 'weakness') {
          currentCompetitor.weakness = text;
        } else if (currentSubsection === 'message') {
          currentCompetitor.winningMessage = text;
        }
      } else if (currentSection === 'opportunities' && currentOpportunity && buffer) {
        if (currentSubsection === 'whymatters') {
          currentOpportunity.whyItMatters = buffer.trim();
        }
        currentSubsection = '';
      } else if (currentSection === 'wedge' && currentSubsection && buffer) {
        const text = extractFirstSentences(buffer, 2);
        if (currentSubsection.includes('main') || !currentSubsection.includes('wedge')) {
          if (!data.wedge.main) {
            data.wedge.main = text;
          }
        } else if (currentSubsection.includes('messaging')) {
          data.wedge.messaging = text;
        } else if (currentSubsection.includes('product')) {
          data.wedge.product = text;
        } else if (currentSubsection.includes('psychology')) {
          data.wedge.psychology = text;
        } else if (currentSubsection.includes('market') || currentSubsection.includes('go-to-market')) {
          data.wedge.goToMarket = text;
        }
      }
    }
  }

  if (currentSection === 'advantages' && currentSubsection && buffer) {
    const summary = extractFirstSentences(buffer, 3);
    data.advantages.push({
      title: currentSubsection,
      summary,
      icon: getIconForAdvantage(currentSubsection),
    });
  }

  if (currentCompetitor?.name) {
    if (currentSubsection === 'weakness' && buffer) {
      currentCompetitor.weakness = extractFirstSentences(buffer, 2);
    } else if (currentSubsection === 'message' && buffer) {
      currentCompetitor.winningMessage = extractFirstSentences(buffer, 2);
    }
    data.competitors.push(currentCompetitor as Competitor);
  }

  if (currentOpportunity?.title) {
    if (buffer && currentSubsection === 'whymatters') {
      currentOpportunity.whyItMatters = buffer.trim();
    }
    if (!currentOpportunity.timing || currentOpportunity.timing === 'Next 6-12 months') {
      if (currentOpportunity.fullContent) {
        const timingMatch = currentOpportunity.fullContent.match(/(next|within)?\s*(\d+[-–]?\d*)\s*(month|week|day)/i);
        if (timingMatch) {
          currentOpportunity.timing = timingMatch[0];
        }
      }
    }
    data.opportunities.push(currentOpportunity as FirstMoverOpportunity);
  }

  if (currentSection === 'wedge' && buffer) {
    const text = extractFirstSentences(buffer, 2);
    if (currentSubsection) {
      if (currentSubsection.includes('messaging')) {
        data.wedge.messaging = text;
      } else if (currentSubsection.includes('product')) {
        data.wedge.product = text;
      } else if (currentSubsection.includes('psychology')) {
        data.wedge.psychology = text;
      } else if (currentSubsection.includes('market') || currentSubsection.includes('go-to-market')) {
        data.wedge.goToMarket = text;
      }
    } else if (!data.wedge.main) {
      data.wedge.main = text;
    }
  }

  return data;
}
