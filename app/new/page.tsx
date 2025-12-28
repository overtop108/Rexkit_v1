'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/Header';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [businessIdea, setBusinessIdea] = useState('');
  const [industry, setIndustry] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [targetLocation, setTargetLocation] = useState('');
  const [otherLocation, setOtherLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [technicalAbility, setTechnicalAbility] = useState('');
  const [timeCommitment, setTimeCommitment] = useState('');

  useEffect(() => {
    const ideaParam = searchParams.get('idea');
    if (ideaParam) {
      setBusinessIdea(ideaParam);
    }
  }, [searchParams]);

  const handleGenerate = () => {
    if (!businessIdea.trim()) return;

    const finalLocation = targetLocation === 'other' ? otherLocation : targetLocation;

    const params = new URLSearchParams({
      idea: businessIdea,
      ...(industry && { industry }),
      ...(targetMarket && { market: targetMarket }),
      ...(finalLocation && { location: finalLocation }),
      ...(budget && { budget }),
      ...(technicalAbility && { technical: technicalAbility }),
      ...(timeCommitment && { time: timeCommitment }),
    });

    router.push(`/project?${params.toString()}`);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen gradient-bg">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            className="mb-8 text-slate-600 hover:text-slate-900 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold text-slate-900 mb-3">
              New Project
            </h1>
            <p className="text-lg text-slate-600">
              Tell us about your business idea
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
            <div className="space-y-3">
              <Label htmlFor="business-idea" className="text-lg font-semibold text-slate-900">
                What's your business idea?
              </Label>
              <Textarea
                id="business-idea"
                placeholder="E.g., A subscription box service for eco-friendly pet supplies..."
                value={businessIdea}
                onChange={(e) => setBusinessIdea(e.target.value)}
                className="min-h-32 text-base resize-none rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="industry" className="text-sm font-semibold text-slate-700">
                Industry (Optional)
              </Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger id="industry" className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ecommerce">E-commerce / Physical Products</SelectItem>
                  <SelectItem value="saas">SaaS / Software</SelectItem>
                  <SelectItem value="coaching">Coaching / Consulting</SelectItem>
                  <SelectItem value="local-service">Local Service Business</SelectItem>
                  <SelectItem value="content-creator">Content Creator / Influencer</SelectItem>
                  <SelectItem value="agency">Agency / Freelance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="target-market" className="text-sm font-semibold text-slate-700">
                  Target Market (Optional)
                </Label>
                <Select value={targetMarket} onValueChange={setTargetMarket}>
                  <SelectTrigger id="target-market" className="rounded-xl border-slate-200">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="b2b">B2B</SelectItem>
                    <SelectItem value="b2c">B2C</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="target-location" className="text-sm font-semibold text-slate-700">
                  Target Market Location (Optional)
                </Label>
                <Select value={targetLocation} onValueChange={setTargetLocation}>
                  <SelectTrigger id="target-location" className="rounded-xl border-slate-200">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="united-states">United States</SelectItem>
                    <SelectItem value="united-kingdom">United Kingdom</SelectItem>
                    <SelectItem value="european-union">European Union</SelectItem>
                    <SelectItem value="asia-pacific">Asia-Pacific</SelectItem>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {targetLocation === 'other' && (
                  <Input
                    placeholder="Enter your target location..."
                    value={otherLocation}
                    onChange={(e) => setOtherLocation(e.target.value)}
                    className="mt-2 rounded-xl border-slate-200"
                  />
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="budget" className="text-sm font-semibold text-slate-700">
                  Budget (Optional)
                </Label>
                <Select value={budget} onValueChange={setBudget}>
                  <SelectTrigger id="budget" className="rounded-xl border-slate-200">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="bootstrap">Bootstrap</SelectItem>
                    <SelectItem value="some-funding">Some funding</SelectItem>
                    <SelectItem value="well-funded">Well-funded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="technical-ability" className="text-sm font-semibold text-slate-700">
                  Technical Ability (Optional)
                </Label>
                <Select value={technicalAbility} onValueChange={setTechnicalAbility}>
                  <SelectTrigger id="technical-ability" className="rounded-xl border-slate-200">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="time-commitment" className="text-sm font-semibold text-slate-700">
                  Time Commitment (Optional)
                </Label>
                <Select value={timeCommitment} onValueChange={setTimeCommitment}>
                  <SelectTrigger id="time-commitment" className="rounded-xl border-slate-200">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="side-project">Side project</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!businessIdea.trim()}
              className="w-full h-14 text-lg font-medium gradient-indigo hover:shadow-md text-white rounded-xl button-scale"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Business Package
            </Button>
          </div>

          <div className="mt-12 text-center text-sm text-slate-500">
            <p>Your comprehensive business package includes 9 essential sections to help you launch successfully</p>
          </div>
        </div>
      </div>
    </>
  );
}
