'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Header } from '@/components/Header';
import { Sparkles, Loader2, AlertCircle, TrendingUp, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ValidationResult {
  score: number;
  verdict: string;
  risks: string[];
  quickTake: string;
  recommendation: string;
}

export default function ValidatePage() {
  const router = useRouter();
  const [businessIdea, setBusinessIdea] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState('');

  const handleValidate = async () => {
    if (!businessIdea.trim()) {
      setError('Please enter your business idea');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/quick-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessIdea }),
      });

      if (!response.ok) {
        throw new Error('Failed to validate idea');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to validate idea. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFullPlan = () => {
    router.push(`/new?idea=${encodeURIComponent(businessIdea)}`);
  };

  const handleTryAnother = () => {
    setBusinessIdea('');
    setResult(null);
    setError('');
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 4) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 7) return 'bg-green-50';
    if (score >= 4) return 'bg-amber-50';
    return 'bg-red-50';
  };

  const getScoreBorderColor = (score: number) => {
    if (score >= 7) return 'border-green-300';
    if (score >= 4) return 'border-amber-300';
    return 'border-red-300';
  };

  return (
    <>
      <Header />
      <div className="min-h-screen gradient-bg">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {!result ? (
            <>
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 mb-6">
                  <Sparkles className="h-8 w-8 text-amber-600" />
                </div>
                <h1 className="text-4xl font-semibold text-slate-900 mb-3">Quick Idea Validation</h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Get a brutally honest assessment of your business idea in seconds
                </p>
              </div>

              <Card className="p-8 border border-slate-200 rounded-2xl shadow-sm bg-white">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                      What's your business idea?
                    </label>
                    <Textarea
                      value={businessIdea}
                      onChange={(e) => setBusinessIdea(e.target.value)}
                      placeholder="Example: A mobile app that connects dog owners with trusted local dog walkers, with real-time GPS tracking and insurance coverage..."
                      className="min-h-[200px] text-base rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500"
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive" className="rounded-xl">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleValidate}
                    disabled={isLoading || !businessIdea.trim()}
                    className="w-full h-14 bg-gradient-to-r from-amber-600 to-amber-500 hover:shadow-md text-white text-lg rounded-xl button-scale font-medium"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing your idea...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Validate My Idea
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            <>
              <div className="mb-12">
                <Button
                  variant="outline"
                  onClick={handleTryAnother}
                  className="mb-6 rounded-xl border-slate-200 hover:bg-slate-50 transition-all duration-200"
                >
                  ← Back
                </Button>
                <h1 className="text-4xl font-semibold text-slate-900 mb-3">Validation Results</h1>
                <p className="text-slate-600 text-lg">{businessIdea}</p>
              </div>

              <div className="space-y-6">
                <Card className={`p-8 border-2 ${getScoreBorderColor(result.score)} rounded-2xl shadow-sm bg-white`}>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
                      Viability Score
                    </div>
                    <div className={`text-7xl font-semibold ${getScoreColor(result.score)} mb-4`}>
                      {result.score}<span className="text-4xl">/10</span>
                    </div>
                    <div className={`inline-block px-6 py-3 rounded-xl ${getScoreBgColor(result.score)} ${getScoreColor(result.score)} font-semibold text-lg`}>
                      {result.verdict}
                    </div>
                  </div>
                </Card>

                <Card className="p-8 border border-red-200 rounded-2xl shadow-sm bg-white">
                  <div className="flex items-start gap-3 mb-6">
                    <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                    <h2 className="text-2xl font-semibold text-slate-900">Top 3 Risks</h2>
                  </div>
                  <ul className="space-y-4">
                    {result.risks.map((risk, index) => (
                      <li key={index} className="flex items-start gap-3 text-slate-700">
                        <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-xl bg-red-50 text-red-700 font-semibold text-sm">
                          {index + 1}
                        </span>
                        <span className="flex-1 leading-relaxed">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-8 border border-slate-200 rounded-2xl shadow-sm bg-white">
                  <div className="flex items-start gap-3 mb-6">
                    <TrendingUp className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                    <h2 className="text-2xl font-semibold text-slate-900">Quick Take</h2>
                  </div>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">{result.quickTake}</p>
                </Card>

                <Card className="p-8 border border-emerald-200 rounded-2xl shadow-sm bg-emerald-50">
                  <div className="flex items-start gap-3 mb-6">
                    <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                    <h2 className="text-2xl font-semibold text-slate-900">Recommendation</h2>
                  </div>
                  <p className="text-slate-700 leading-relaxed mb-8">{result.recommendation}</p>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleGenerateFullPlan}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:shadow-md text-white h-12 rounded-xl button-scale"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Full Plan
                    </Button>
                    <Button
                      onClick={handleTryAnother}
                      variant="outline"
                      className="flex-1 h-12 rounded-xl border-slate-200 hover:bg-slate-50 transition-all duration-200"
                    >
                      Try Another Idea
                    </Button>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
