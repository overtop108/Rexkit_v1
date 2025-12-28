'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Clock,
  Database,
  DollarSign,
  LayoutDashboard,
  Zap,
  Award,
  Users,
  Sparkles,
  Shield,
  Copy,
  RefreshCw,
  Network,
  ChevronDown,
  MessageSquare,
  Package,
  Brain,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { parseCompetitiveEdge, CompetitiveEdgeData } from '@/lib/competitive-edge-parser';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  Database,
  DollarSign,
  LayoutDashboard,
  Zap,
  Award,
  Users,
  Sparkles,
};

interface CompetitiveEdgeDashboardProps {
  content: string;
}

export function CompetitiveEdgeDashboard({ content }: CompetitiveEdgeDashboardProps) {
  const [expandedCompetitor, setExpandedCompetitor] = useState<string>('');
  const [expandedOpportunity, setExpandedOpportunity] = useState<string>('');
  const data = parseCompetitiveEdge(content);

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 4) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 7) return 'bg-green-50 border-green-200';
    if (score >= 4) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const getProgressColor = (score: number) => {
    if (score >= 7) return 'bg-green-500';
    if (score >= 4) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const advantageColors = [
    { bg: 'bg-blue-50', border: 'border-l-blue-500', text: 'text-blue-600' },
    { bg: 'bg-indigo-50', border: 'border-l-indigo-500', text: 'text-indigo-600' },
    { bg: 'bg-violet-50', border: 'border-l-violet-500', text: 'text-violet-600' },
    { bg: 'bg-purple-50', border: 'border-l-purple-500', text: 'text-purple-600' },
    { bg: 'bg-pink-50', border: 'border-l-pink-500', text: 'text-pink-600' },
    { bg: 'bg-rose-50', border: 'border-l-rose-500', text: 'text-rose-600' },
  ];

  const opportunityGradients = [
    { gradient: 'from-indigo-500 to-violet-500', border: 'border-l-indigo-500' },
    { gradient: 'from-violet-500 to-purple-500', border: 'border-l-violet-500' },
    { gradient: 'from-blue-500 to-indigo-500', border: 'border-l-blue-500' },
    { gradient: 'from-amber-500 to-orange-500', border: 'border-l-amber-500' },
    { gradient: 'from-rose-500 to-pink-500', border: 'border-l-rose-500' },
  ];

  return (
    <div className="space-y-8">
      {data.advantages.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold text-slate-900 mb-4">Your Unfair Advantages</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.advantages.map((advantage, index) => {
              const Icon = iconMap[advantage.icon] || Sparkles;
              const colors = advantageColors[index % advantageColors.length];

              return (
                <Card
                  key={index}
                  className={`p-5 border-l-4 ${colors.border} bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl`}
                >
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${colors.bg} mb-3`}>
                    <Icon className={`h-5 w-5 ${colors.text}`} />
                  </div>
                  <h4 className="text-base font-semibold text-slate-900 mb-2">{advantage.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{advantage.summary}</p>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-2xl font-semibold text-slate-900 mb-4">Defensibility Score</h3>
        <Card className={`p-6 border-2 shadow-sm rounded-xl ${getScoreBgColor(data.defensibility.overall)}`}>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-slate-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(data.defensibility.overall / 10) * 351.86} 351.86`}
                    className={getScoreColor(data.defensibility.overall)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${getScoreColor(data.defensibility.overall)}`}>
                    {data.defensibility.overall}
                  </span>
                  <span className="text-sm text-slate-600">out of 10</span>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-white border border-slate-200 shadow-sm rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Copy className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Easy to Copy?
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{data.defensibility.easyCopy}</p>
              </Card>

              <Card className="p-4 bg-white border border-slate-200 shadow-sm rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Switching Costs
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{data.defensibility.switchingCosts}</p>
              </Card>

              <Card className="p-4 bg-white border border-slate-200 shadow-sm rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Network className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Network Effects
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{data.defensibility.networkEffects}</p>
              </Card>
            </div>
          </div>
        </Card>
      </div>

      {data.competitors.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold text-slate-900 mb-4">Competitor Positioning</h3>
          <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl">
            <Accordion type="single" collapsible value={expandedCompetitor} onValueChange={setExpandedCompetitor}>
              {data.competitors.map((competitor, index) => (
                <AccordionItem key={index} value={`competitor-${index}`} className="border-b border-slate-200 last:border-0">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <Shield className="h-4 w-4 text-slate-600" strokeWidth={1.5} />
                        </div>
                        <div className="text-left">
                          <h4 className="text-base font-semibold text-slate-900">{competitor.name}</h4>
                          <p className="text-sm text-slate-600 mt-0.5">{competitor.weakness}</p>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="space-y-4 pl-11">
                      {competitor.winningMessage && (
                        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                          <div className="flex items-start gap-2 mb-1">
                            <MessageSquare className="h-4 w-4 text-indigo-600 mt-0.5" strokeWidth={1.5} />
                            <span className="text-xs font-semibold text-indigo-900 uppercase tracking-wide">
                              Your Winning Message
                            </span>
                          </div>
                          <p className="text-sm text-slate-900 italic">&quot;{competitor.winningMessage}&quot;</p>
                        </div>
                      )}

                      {competitor.targetWith.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-slate-900 mb-2">Target Their Users With:</h5>
                          <ul className="space-y-1.5">
                            {competitor.targetWith.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="text-green-500 mt-0.5">✓</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {competitor.dontCompeteOn.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-slate-500 mb-2">Don&apos;t Compete On:</h5>
                          <ul className="space-y-1.5">
                            {competitor.dontCompeteOn.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-500">
                                <span className="text-slate-400 mt-0.5">×</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      )}

      {data.opportunities.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold text-slate-900 mb-4">First-Mover Opportunities</h3>
          <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl">
            <Accordion type="single" collapsible value={expandedOpportunity} onValueChange={setExpandedOpportunity}>
              {data.opportunities.map((opportunity, index) => {
                const colors = opportunityGradients[index % opportunityGradients.length];
                const isExpanded = expandedOpportunity === `opportunity-${index}`;

                return (
                  <AccordionItem
                    key={index}
                    value={`opportunity-${index}`}
                    className={`border-b border-slate-200 last:border-0 ${isExpanded ? `border-l-4 ${colors.border} pl-2` : ''}`}
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white font-bold text-base shadow-sm flex-shrink-0`}>
                            {opportunity.number}
                          </div>
                          <div className="text-left">
                            <h4 className="text-base font-semibold text-slate-900">{opportunity.title}</h4>
                          </div>
                        </div>
                        <span className="badge-indigo ml-2 flex-shrink-0">{opportunity.timing}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                      <div className="pl-13 space-y-4">
                        {opportunity.description && (
                          <div className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="text-slate-700">{children}</p>,
                                strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                                ul: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
                                li: ({ children }) => <li className="text-slate-700">{children}</li>,
                              }}
                            >
                              {opportunity.description}
                            </ReactMarkdown>
                          </div>
                        )}

                        {opportunity.timing && opportunity.timing !== 'Next 6-12 months' && (
                          <div className="flex items-start gap-3">
                            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide flex-shrink-0">Timing</span>
                            <span className="text-sm text-slate-600">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <span>{children}</span>,
                                  strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                                }}
                              >
                                {opportunity.timing}
                              </ReactMarkdown>
                            </span>
                          </div>
                        )}

                        {opportunity.actions && opportunity.actions.length > 0 && (
                          <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Specific Actions</span>
                            <ul className="list-disc list-inside space-y-1.5">
                              {opportunity.actions.map((action, i) => (
                                <li key={i} className="text-sm text-slate-600">
                                  <ReactMarkdown
                                    components={{
                                      p: ({ children }) => <span>{children}</span>,
                                      strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                                    }}
                                  >
                                    {action}
                                  </ReactMarkdown>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {opportunity.whyItMatters && (
                          <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Why It Matters</span>
                            <div className="text-sm text-slate-600 leading-relaxed prose prose-sm max-w-none">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <p className="text-slate-600">{children}</p>,
                                  strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
                                  li: ({ children }) => <li className="text-slate-600">{children}</li>,
                                }}
                              >
                                {opportunity.whyItMatters}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}

                        {!opportunity.description && !opportunity.actions.length && !opportunity.whyItMatters && opportunity.fullContent && (
                          <div className="text-sm text-slate-600 leading-relaxed prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="text-slate-600 mb-3">{children}</p>,
                                strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3">{children}</ul>,
                                li: ({ children }) => <li className="text-slate-600">{children}</li>,
                                h3: ({ children }) => <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 mt-4">{children}</h3>,
                                h4: ({ children }) => <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 mt-3">{children}</h4>,
                              }}
                            >
                              {opportunity.fullContent}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </Card>
        </div>
      )}

      {data.wedge.main && (
        <div>
          <h3 className="text-2xl font-semibold text-slate-900 mb-4">Your Wedge</h3>
          <Card className="p-6 bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 border-2 border-indigo-200 shadow-sm rounded-xl">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 mb-4">
                <Zap className="h-6 w-6 text-white" strokeWidth={2} />
              </div>
              <p className="text-lg font-semibold text-slate-900 italic leading-relaxed max-w-3xl mx-auto">
                &quot;{data.wedge.main}&quot;
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {data.wedge.messaging && (
                <Card className="p-4 bg-white border border-slate-200 shadow-sm rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
                    <h5 className="text-sm font-semibold text-slate-900">Messaging Wedge</h5>
                  </div>
                  <p className="text-sm text-slate-600">{data.wedge.messaging}</p>
                </Card>
              )}

              {data.wedge.product && (
                <Card className="p-4 bg-white border border-slate-200 shadow-sm rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-5 w-5 text-green-600" strokeWidth={1.5} />
                    <h5 className="text-sm font-semibold text-slate-900">Product Wedge</h5>
                  </div>
                  <p className="text-sm text-slate-600">{data.wedge.product}</p>
                </Card>
              )}

              {data.wedge.psychology && (
                <Card className="p-4 bg-white border border-slate-200 shadow-sm rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-purple-600" strokeWidth={1.5} />
                    <h5 className="text-sm font-semibold text-slate-900">Psychology Wedge</h5>
                  </div>
                  <p className="text-sm text-slate-600">{data.wedge.psychology}</p>
                </Card>
              )}

              {data.wedge.goToMarket && (
                <Card className="p-4 bg-white border border-slate-200 shadow-sm rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-amber-600" strokeWidth={1.5} />
                    <h5 className="text-sm font-semibold text-slate-900">Go-to-Market Wedge</h5>
                  </div>
                  <p className="text-sm text-slate-600">{data.wedge.goToMarket}</p>
                </Card>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
