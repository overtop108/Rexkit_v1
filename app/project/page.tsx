'use client';

import { useState } from 'react';
import { CircleCheck as CheckCircle2, Check, Menu, X, Download, Share2, Sparkles, ArrowUpRight } from 'lucide-react';
import { mockProject } from '@/lib/mock-project';
import { KpiCard } from '@/components/KpiCard';

const NAV_ITEMS = [
  { label: 'Dashboard', active: false },
  { label: 'Projects', active: true },
  { label: 'Quick Validation', active: false },
  { label: 'Settings', active: false },
];

const TABS = ['Tiers', 'Rationale', 'Competitor pricing', 'Unit economics'] as const;
type TabName = (typeof TABS)[number];

const kpiColorHex: Record<string, string> = {
  indigo: '#5B4FE8',
  blue: '#2F6FED',
  amber: '#D97706',
  red: '#E11D48',
};

export default function ProjectPage() {
  const [activeSection, setActiveSection] = useState('Pricing Strategy');
  const [activeTab, setActiveTab] = useState<TabName>('Tiers');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [favourite, setFavourite] = useState(false);
  const [tasks, setTasks] = useState(mockProject.roadmap.tasks);

  const completedCount = tasks.filter((t) => t.done).length;
  const totalTasks = mockProject.roadmap.totalTasks;
  const progressPct = Math.round((completedCount / totalTasks) * 100);

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-[#E6E8EF] shadow-sm"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5 text-[#1F2430]" />
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-[300px] flex-shrink-0 bg-[#111827] text-white flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="w-11 h-11 rounded-xl bg-[#5B4FE8] flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <span className="font-bold text-[22px]">RexKit</span>
          <button
            className="ml-auto lg:hidden text-white/60 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="px-3 space-y-1 mb-6">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                item.active
                  ? 'bg-[#1C2536] text-white font-medium'
                  : 'text-white/70 hover:bg-white/5'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Section label */}
        <div className="px-6 mb-3">
          <span className="text-[13px] tracking-widest uppercase text-white/40 font-medium">
            {mockProject.name.toUpperCase()} · 9 SECTIONS
          </span>
        </div>

        {/* Section list */}
        <div className="px-3 flex-1 overflow-y-auto space-y-1">
          {mockProject.sections.map((section) => (
            <button
              key={section}
              onClick={() => {
                setActiveSection(section);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                activeSection === section
                  ? 'bg-[#1C2536] text-white font-medium'
                  : 'text-white/70 hover:bg-white/5'
              }`}
            >
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: '#22A06B' }} fill="#22A06B" />
              <span className="truncate">{section}</span>
            </button>
          ))}
        </div>

        {/* User pinned */}
        <div className="mt-auto">
          <div className="border-t border-white/10 px-6 py-4">
            <div className="font-bold text-sm text-white">{mockProject.user.name} · {mockProject.user.plan}</div>
            <div className="text-sm text-white/50">
              {mockProject.user.projectsCount} projects · {mockProject.user.generationsLeft} generations left
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-[1900px] mx-auto px-6 lg:px-10 py-8">
          {/* Header block */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
            <div>
              <div className="text-sm text-[#7A8194] mb-2">
                Projects / {mockProject.name}
              </div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-[40px] font-bold text-[#1F2430] leading-none">
                  {mockProject.name}
                </h1>
                <button
                  onClick={() => setFavourite(!favourite)}
                  className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-colors ${
                    favourite
                      ? 'border-[#5B4FE8] bg-[#5B4FE8]'
                      : 'border-[#D9DCE5] bg-white hover:border-[#5B4FE8]'
                  }`}
                >
                  {favourite && <Check className="h-4 w-4 text-white" />}
                </button>
              </div>
              <p className="text-xl text-[#6B7280] max-w-3xl leading-relaxed">
                {mockProject.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E6F6EE] text-[#22A06B] font-semibold text-sm">
                  <span className="w-2 h-2 rounded-full bg-[#22A06B]" />
                  {mockProject.status}
                </span>
                <span className="text-sm text-[#7A8194]">{mockProject.createdMeta}</span>
                <span className="text-sm text-[#7A8194]">·</span>
                <span className="text-sm text-[#7A8194]">{mockProject.modelMeta}</span>
              </div>
            </div>

            {/* Top-right buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button className="h-[52px] px-5 rounded-xl border border-[#D9DCE5] bg-white text-[#1F2430] font-semibold text-sm hover:bg-[#F5F6FA] transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export PDF
              </button>
              <button className="h-[52px] px-5 rounded-xl border border-[#D9DCE5] bg-white text-[#1F2430] font-semibold text-sm hover:bg-[#F5F6FA] transition-colors flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button className="h-[52px] px-5 rounded-xl bg-[#5B4FE8] text-white font-semibold text-sm hover:bg-[#4A3FD0] transition-colors flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generate assets
              </button>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {mockProject.kpis.map((kpi) => (
              <KpiCard
                key={kpi.label}
                label={kpi.label}
                value={kpi.value}
                suffix={kpi.suffix}
                subtext={kpi.subtext}
                progress={kpi.progress}
                color={kpi.color}
              />
            ))}
          </div>

          {/* Body grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left column - Pricing Strategy */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-[#E6E8EF] p-6">
                {/* Card header */}
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-bold text-[#1F2430]">Pricing Strategy</h2>
                  <div className="text-sm text-[#7A8194]">
                    Section 5 of 9 ·{' '}
                    <button className="text-[#5B4FE8] font-medium hover:underline">Regenerate</button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-[#EDEFF4] mb-6">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 text-sm font-medium transition-colors relative ${
                        activeTab === tab
                          ? 'text-[#5B4FE8]'
                          : 'text-[#7A8194] hover:text-[#1F2430]'
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#5B4FE8] rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                {activeTab === 'Tiers' && (
                  <div className="space-y-6">
                    {/* Tier cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {mockProject.tiers.map((tier) => (
                        <div
                          key={tier.name}
                          className={`relative bg-white rounded-2xl border p-5 ${
                            tier.recommended ? 'border-[#5B4FE8] border-2' : 'border-[#E6E8EF]'
                          }`}
                        >
                          {tier.recommended && (
                            <span className="absolute -top-3 left-4 px-2.5 py-1 rounded-md bg-[#5B4FE8] text-white text-[11px] font-bold uppercase tracking-wide">
                              Recommended
                            </span>
                          )}
                          <h3 className="text-lg font-bold text-[#1F2430] mb-2">{tier.name}</h3>
                          <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-[32px] font-bold text-[#1F2430] leading-none">{tier.price}</span>
                            <span className="text-sm text-[#7A8194]">{tier.suffix}</span>
                          </div>
                          <p className="text-sm text-[#6B7280] mb-4">{tier.subtitle}</p>
                          <ul className="space-y-2">
                            {tier.bullets.map((bullet, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-[#1F2430]">
                                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#22A06B' }} fill="#22A06B" />
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Callout */}
                    <div className="bg-[#FFF8E6] border-l-4 border-[#D97706] rounded-xl p-4">
                      <p className="text-sm text-[#1F2430] leading-relaxed">
                        <span className="font-bold">Why this works:</span>{' '}
                        {mockProject.callout}
                      </p>
                    </div>

                    {/* Stats line */}
                    <div className="flex flex-wrap items-center gap-10">
                      {mockProject.stats.map((stat) => (
                        <div key={stat.label} className="text-sm">
                          <span className="text-[#6B7280]">{stat.label} </span>
                          <span className="font-bold text-[#1F2430]">{stat.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Competitor table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#EDEFF4]">
                            <th className="text-left py-3 pr-4 text-[13px] tracking-wide uppercase text-[#7A8194] font-medium">Competitor</th>
                            <th className="text-left py-3 px-4 text-[13px] tracking-wide uppercase text-[#7A8194] font-medium">Offer</th>
                            <th className="text-left py-3 px-4 text-[13px] tracking-wide uppercase text-[#7A8194] font-medium">Price / wk</th>
                            <th className="text-left py-3 px-4 text-[13px] tracking-wide uppercase text-[#7A8194] font-medium">Gap Nyonya Box exploits</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockProject.competitors.map((row, i) => (
                            <tr key={i} className="border-b border-[#EDEFF4] last:border-0">
                              <td className="py-3 pr-4 font-bold text-[#1F2430]">{row.competitor}</td>
                              <td className="py-3 px-4 text-[#6B7280]">{row.offer}</td>
                              <td className="py-3 px-4 text-[#6B7280]">{row.pricePerWeek}</td>
                              <td className="py-3 px-4 text-[#6B7280]">{row.gap}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab !== 'Tiers' && (
                  <div className="py-12 text-center text-[#7A8194] text-sm">
                    {activeTab} content will be generated when you click Regenerate.
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Roadmap card */}
              <div className="bg-white rounded-2xl border border-[#E6E8EF] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#1F2430]">30-Day Roadmap</h2>
                  <span className="text-sm text-[#7A8194]">
                    {mockProject.roadmap.header} · {completedCount} of {totalTasks} done
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#EDEFF4] overflow-hidden mb-5">
                  <div
                    className="h-full rounded-full bg-[#5B4FE8] transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="space-y-1">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className="w-full flex items-center gap-3 py-2 group rounded-lg hover:bg-[#F5F6FA] px-2 -mx-2 transition-colors"
                    >
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                          task.done ? 'bg-[#5B4FE8]' : 'border-2 border-[#D9DCE5] bg-white'
                        }`}
                      >
                        {task.done && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                      </span>
                      <span
                        className={`flex-1 text-left text-sm ${
                          task.done ? 'line-through text-[#7A8194]' : 'text-[#1F2430]'
                        }`}
                      >
                        {task.text}
                      </span>
                      <span className="text-sm text-[#7A8194] flex-shrink-0">{task.day}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Marketing Kit card */}
              <div className="bg-white rounded-2xl border border-[#E6E8EF] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#1F2430]">Marketing Kit</h2>
                  <span className="text-sm text-[#7A8194]">{mockProject.marketing.header}</span>
                </div>

                {/* Tiles */}
                <div className="grid grid-cols-4 gap-4 mb-5">
                  {mockProject.marketing.tiles.map((tile, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-xl bg-gradient-to-br ${tile.gradient} relative overflow-hidden`}
                    >
                      {tile.imageUrl ? (
                        <img src={tile.imageUrl} alt={tile.caption} className="w-full h-full object-cover" />
                      ) : null}
                      <span className="absolute bottom-2 left-2 text-white font-bold text-sm drop-shadow-lg">
                        {tile.caption}
                      </span>
                    </div>
                  ))}
                  <div className="aspect-square rounded-xl border-2 border-dashed border-[#C9CDD8] bg-white flex items-center justify-center">
                    <span className="text-[#5B4FE8] font-medium text-sm flex items-center gap-1">
                      Generate <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>

                {/* Day chips */}
                <div className="flex gap-2">
                  {mockProject.marketing.dayChips.map((chip) => (
                    <div
                      key={chip.day}
                      className={`flex-1 text-center py-2 rounded-lg text-sm font-semibold ${
                        chip.hasContent
                          ? 'bg-[#EEF0FF] text-[#5B4FE8]'
                          : 'bg-[#F1F2F6] text-[#7A8194]'
                      }`}
                    >
                      {chip.day}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
