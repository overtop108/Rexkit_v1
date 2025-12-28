'use client';

import { EmailItem } from '@/lib/marketing-parsers';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, ArrowRight } from 'lucide-react';

interface EmailFlowProps {
  emails: EmailItem[];
}

const emailColors = [
  { bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600', border: 'border-emerald-300', hover: 'hover:border-emerald-500', text: 'text-emerald-600', lightBg: 'bg-emerald-50' },
  { bg: 'bg-gradient-to-br from-blue-500 to-blue-600', border: 'border-blue-300', hover: 'hover:border-blue-500', text: 'text-blue-600', lightBg: 'bg-blue-50' },
  { bg: 'bg-gradient-to-br from-violet-500 to-violet-600', border: 'border-violet-300', hover: 'hover:border-violet-500', text: 'text-violet-600', lightBg: 'bg-violet-50' },
  { bg: 'bg-gradient-to-br from-amber-500 to-amber-600', border: 'border-amber-300', hover: 'hover:border-amber-500', text: 'text-amber-600', lightBg: 'bg-amber-50' },
  { bg: 'bg-gradient-to-br from-rose-500 to-rose-600', border: 'border-rose-300', hover: 'hover:border-rose-500', text: 'text-rose-600', lightBg: 'bg-rose-50' },
];

export function EmailFlow({ emails }: EmailFlowProps) {
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [copied, setCopied] = useState(false);

  const cleanText = (text: string): string => {
    return text.split('|')[0].trim();
  };

  const cleanTiming = (timing: string): string => {
    const match = timing.match(/Day\s*(\d+)/i);
    return match ? `Day ${match[1]}` : timing.split('|')[0].split('-')[0].trim();
  };

  const handleCopy = () => {
    if (selectedEmail) {
      const fullEmail = `Subject: ${cleanText(selectedEmail.subject)}\n\nPreview: ${cleanText(selectedEmail.preview)}\n\n${selectedEmail.body}\n\n[${cleanText(selectedEmail.cta)}]`;
      navigator.clipboard.writeText(fullEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getEmailColor = (index: number) => {
    return emailColors[index % emailColors.length];
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center overflow-x-auto pb-4 gap-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          {emails.map((email, index) => {
            const colors = getEmailColor(index);
            return (
              <div key={email.number} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => setSelectedEmail(email)}
                  className={`group relative ${colors.lightBg} border-2 ${colors.border} rounded-2xl p-5 ${colors.hover} hover:shadow-lg transition-all duration-200 w-44 card-hover`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`flex items-center justify-center w-14 h-14 rounded-full ${colors.bg} text-white font-bold text-xl mb-3 shadow-md`}>
                      {email.number}
                    </div>
                    <div className={`text-xs font-bold ${colors.text} mb-3 uppercase tracking-wider`}>
                      {cleanTiming(email.timing)}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-3 line-clamp-2 min-h-[2.5rem]">
                      {cleanText(email.name)}
                    </h4>
                    <p className="text-xs text-slate-500 italic line-clamp-2 leading-relaxed">
                      "{cleanText(email.subject)}"
                    </p>
                  </div>
                </button>
                {index < emails.length - 1 && (
                  <div className="flex-shrink-0 mx-2">
                    <ArrowRight className="h-6 w-6 text-slate-400" strokeWidth={2.5} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-slate-900">
              Email {selectedEmail?.number}: {selectedEmail && cleanText(selectedEmail.name)}
            </DialogTitle>
          </DialogHeader>
          {selectedEmail && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Email Number</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${getEmailColor(selectedEmail.number - 1).bg} text-white font-semibold text-lg shadow-sm`}>
                      {selectedEmail.number}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Send Timing</label>
                  <p className="mt-1 text-slate-900 font-medium">{cleanTiming(selectedEmail.timing)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Subject Line</label>
                <div className={`mt-1 p-4 ${getEmailColor(selectedEmail.number - 1).lightBg} rounded-xl border ${getEmailColor(selectedEmail.number - 1).border}`}>
                  <p className="text-slate-900 font-medium">{cleanText(selectedEmail.subject)}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {cleanText(selectedEmail.subject).length} characters
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Preview Text</label>
                <div className="mt-1 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-700 text-sm leading-relaxed">{cleanText(selectedEmail.preview)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Email Body</label>
                <div className="mt-1 p-4 bg-white rounded-xl border-2 border-slate-200 max-h-96 overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    {selectedEmail.body.split('\n').map((paragraph, idx) => (
                      paragraph.trim() && (
                        <p key={idx} className="text-slate-900 mb-3 leading-relaxed">
                          {paragraph}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              </div>

              {selectedEmail.cta && cleanText(selectedEmail.cta).toLowerCase() !== 'learn more' && (
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Call-to-Action</label>
                  <div className="mt-1">
                    <button className={`px-6 py-3 ${getEmailColor(selectedEmail.number - 1).bg} text-white font-semibold rounded-xl hover:shadow-md transition-all duration-200`}>
                      {cleanText(selectedEmail.cta)}
                    </button>
                  </div>
                </div>
              )}

              <Button
                onClick={handleCopy}
                className="w-full gradient-indigo hover:shadow-md text-white rounded-xl h-12 button-scale"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Full Email
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
