'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Sparkles, Plus, Trash2, FolderOpen, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Project {
  id: string;
  business_idea: string;
  project_name?: string;
  created_at: string;
  sections: Record<string, string>;
  twitter_plan?: string;
  instagram_plan?: string;
  email_sequence?: string;
  landing_page_html?: string;
  competitive_edge?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this project?')) return;

    setDeletingId(projectId);
    try {
      const { error } = await supabase
        .from('generations')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  };

  const calculateProgress = (project: Project) => {
    const totalSections = 9;
    let completedSections = 0;

    if (project.sections) {
      const sectionIds = [
        'business-concept',
        'customer-persona',
        'competitive-landscape',
        'brand-identity',
        'pricing-strategy',
        'landing-page-copy',
        'launch-roadmap',
      ];
      completedSections = sectionIds.filter(id => project.sections[id]).length;
    }

    if (project.twitter_plan || project.instagram_plan || project.email_sequence) {
      completedSections += 1;
    }

    if (project.competitive_edge) {
      completedSections += 1;
    }

    return { completed: completedSections, total: totalSections };
  };

  const getDisplayTitle = (project: Project) => {
    if (project.project_name) {
      return project.project_name.length > 50
        ? project.project_name.substring(0, 50) + '...'
        : project.project_name;
    }
    if (project.business_idea) {
      return project.business_idea.length > 50
        ? project.business_idea.substring(0, 50) + '...'
        : project.business_idea;
    }
    return 'Untitled Project';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen gradient-bg">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-semibold text-slate-900 mb-4 tracking-tight">
                RexKit
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Transform your business idea into a comprehensive launch package in seconds
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Card
                className="p-8 border border-slate-200 rounded-2xl hover:shadow-xl transition-all duration-200 cursor-pointer group card-hover bg-white"
                onClick={() => router.push('/validate')}
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 mb-6 group-hover:bg-amber-100 transition-colors">
                    <Sparkles className="h-8 w-8 text-amber-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-900 mb-3">Quick Validate</h2>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Not sure if your idea is worth pursuing? Get a brutally honest viability check in 10 seconds.
                  </p>
                  <div className="space-y-3 text-sm text-left text-slate-600 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <span>Viability score (1-10)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <span>Top 3 risks identified</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <span>Honest assessment</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:shadow-md text-white rounded-xl py-6 text-base font-medium transition-all duration-200 button-scale">
                    Validate My Idea
                  </Button>
                </div>
              </Card>

              <Card
                className="p-8 border border-slate-200 rounded-2xl hover:shadow-xl transition-all duration-200 cursor-pointer group card-hover bg-white"
                onClick={() => router.push('/new')}
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-6 group-hover:opacity-90 transition-opacity">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-900 mb-3">Full Launch Package</h2>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Generate a complete business plan with brand identity, marketing strategy, and launch roadmap.
                  </p>
                  <div className="space-y-3 text-sm text-left text-slate-600 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                      <span>7-section business plan</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                      <span>30-day marketing calendar</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                      <span>Landing page copy</span>
                    </div>
                  </div>
                  <Button className="w-full gradient-indigo hover:shadow-md text-white rounded-xl py-6 text-base font-medium transition-all duration-200 button-scale">
                    Generate Full Plan
                  </Button>
                </div>
              </Card>
            </div>

            <p className="mt-16 text-center text-sm text-slate-500">
              Sign in to save your projects and access them anytime
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-semibold text-slate-900 mb-2">Dashboard</h1>
            <p className="text-slate-600">Choose your path or manage existing projects</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <Card
              className="p-8 border border-slate-200 rounded-2xl hover:shadow-lg transition-all duration-200 cursor-pointer group card-hover bg-white"
              onClick={() => router.push('/validate')}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 group-hover:bg-amber-100 transition-colors">
                    <Sparkles className="h-7 w-7 text-amber-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">Quick Validate</h2>
                  <p className="text-slate-600 text-sm mb-4">
                    Get a brutally honest viability check in 10 seconds
                  </p>
                  <Button className="bg-gradient-to-r from-amber-600 to-amber-500 hover:shadow-md text-white rounded-xl button-scale" size="sm">
                    Validate Idea
                  </Button>
                </div>
              </div>
            </Card>

            <Card
              className="p-8 border border-slate-200 rounded-2xl hover:shadow-lg transition-all duration-200 cursor-pointer group card-hover bg-white"
              onClick={() => router.push('/new')}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary group-hover:opacity-90 transition-opacity">
                    <Plus className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">Full Launch Package</h2>
                  <p className="text-slate-600 text-sm mb-4">
                    Generate complete business plan with marketing strategy
                  </p>
                  <Button className="gradient-indigo hover:shadow-md text-white rounded-xl button-scale" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-semibold text-slate-900">My Projects</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">No projects yet</h2>
              <p className="text-slate-600 mb-6">Create your first project to get started</p>
              <Button
                onClick={() => router.push('/new')}
                className="gradient-indigo hover:shadow-md text-white rounded-xl button-scale px-6"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const progress = calculateProgress(project);
                const progressPercent = (progress.completed / progress.total) * 100;

                return (
                  <Card
                    key={project.id}
                    className="p-6 border border-slate-200 rounded-2xl hover:shadow-lg transition-all duration-200 cursor-pointer card-hover bg-white"
                    onClick={() => router.push(`/project?id=${project.id}`)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {getDisplayTitle(project)}
                        </h3>
                        <p className="text-sm text-slate-500">{formatDate(project.created_at)}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-slate-600 mb-2">
                        <span>Progress</span>
                        <span className="font-medium">{progress.completed}/{progress.total} sections</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="gradient-primary h-2 rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-indigo-300 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/project?id=${project.id}`);
                        }}
                      >
                        <FolderOpen className="mr-2 h-4 w-4" />
                        Open
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        disabled={deletingId === project.id}
                      >
                        {deletingId === project.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
