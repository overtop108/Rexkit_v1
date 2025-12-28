'use client';

import { TwitterPost, getPostTypeColor } from '@/lib/marketing-parsers';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Image as ImageIcon, Loader2 } from 'lucide-react';

interface TwitterCalendarProps {
  posts: TwitterPost[];
  onUpdatePost?: (day: number, updates: Partial<TwitterPost>) => void;
}

export function TwitterCalendar({ posts, onUpdatePost }: TwitterCalendarProps) {
  const [selectedPost, setSelectedPost] = useState<TwitterPost | null>(null);
  const [copied, setCopied] = useState(false);
  const [generatingImageForDay, setGeneratingImageForDay] = useState<number | null>(null);

  const handleCopy = () => {
    if (selectedPost) {
      navigator.clipboard.writeText(selectedPost.copy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGenerateImage = async (post: TwitterPost) => {
    if (!onUpdatePost) return;

    setGeneratingImageForDay(post.day);
    try {
      const prompt = `Social media graphic for Twitter, modern SaaS marketing style, bold colors, professional, clean design. No text on image. Topic: ${post.copy.substring(0, 100)}. Landscape 16:9 format.`;

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
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      console.log('Twitter - Response data:', data);
      console.log('Twitter - Images array:', data.images);
      console.log('Twitter - First image:', data.images?.[0]);
      console.log('Twitter - First image type:', typeof data.images?.[0]);

      if (data.images && data.images.length > 0) {
        const imageUrl = typeof data.images[0] === 'string' ? data.images[0] : String(data.images[0]);
        console.log('Twitter - Setting image URL:', imageUrl);
        // Find the actual index of this post in the array
const postIndex = posts.findIndex(p => p === post);
onUpdatePost(postIndex, { image_url: imageUrl });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setGeneratingImageForDay(null);
    }
  };

  const weekDays = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-wrap gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-500"></div>
            <span className="text-slate-700">Launch</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-emerald-500"></div>
            <span className="text-slate-700">Value</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-amber-500"></div>
            <span className="text-slate-700">Engagement</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-purple-500"></div>
            <span className="text-slate-700">Social Proof</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-red-500"></div>
            <span className="text-slate-700">Urgency</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="grid grid-cols-7 gap-3">
{posts.slice(0, 7).map((post, idx) => (
  <div key={`twitter-day-${idx}`} className="space-y-2">
              <div className="text-center text-xs font-semibold text-slate-600">
                {weekDays[idx]}
              </div>
              <div
                className={`relative bg-white border border-slate-200 rounded-lg p-3 border-l-4 ${getPostTypeColor(post.type).replace('bg-', 'border-l-')}`}
              >
                {post.image_url && (
                  <div
                    className="mb-3 rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedPost(post)}
                  >
                    <img
                      src={post.image_url}
                      alt={`Day ${post.day} graphic`}
                      className="w-full h-20 object-cover"
                    />
                  </div>
                )}

                <button
                  onClick={() => setSelectedPost(post)}
                  className="text-left w-full mb-3"
                >
                  <p className="text-xs text-slate-600 line-clamp-3 mb-2">
                    {post.copy.substring(0, 60)}{post.copy.length > 60 ? '...' : ''}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <span>🕐</span>
                    <span>{post.time}</span>
                  </div>
                </button>

                {onUpdatePost && (
                  <button
                    onClick={() => {
  console.log('Clicked day:', post.day, 'Post ID:', post.id, 'Full post:', post);
  handleGenerateImage(post);
}}
                    disabled={generatingImageForDay === post.day}
                    className="w-full flex items-center justify-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-2 rounded transition-colors disabled:opacity-50"
                  >
                    {generatingImageForDay === post.day ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-3 w-3" />
                        <span>{post.image_url ? 'Regenerate' : 'Generate'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Day {selectedPost?.day} Tweet</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              {selectedPost.image_url && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Generated Image</label>
                  <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={selectedPost.image_url}
                      alt={`Day ${selectedPost.day} graphic`}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">Post Type</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm ${getPostTypeColor(selectedPost.type)}`}>
                    {selectedPost.type}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Optimal Posting Time</label>
                <p className="mt-1 text-gray-900">{selectedPost.time}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Tweet Copy</label>
                <div className="mt-1 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedPost.copy}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedPost.copy.length}/280 characters
                  </p>
                </div>
              </div>
              <Button
                onClick={handleCopy}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Tweet
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
