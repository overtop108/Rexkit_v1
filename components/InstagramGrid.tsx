'use client';

import { InstagramPost, getPostTypeEmoji } from '@/lib/marketing-parsers';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Image as ImageIcon, Loader2 } from 'lucide-react';

interface InstagramGridProps {
  posts: InstagramPost[];
  onUpdatePost?: (day: number, updates: Partial<InstagramPost>) => void;
}

const gradients = [
  'from-pink-400 via-rose-400 to-orange-400',
  'from-purple-400 via-pink-400 to-red-400',
  'from-blue-400 via-purple-400 to-pink-400',
  'from-emerald-400 via-teal-400 to-cyan-400',
  'from-amber-400 via-orange-400 to-red-400',
  'from-indigo-400 via-purple-400 to-pink-400',
];

export function InstagramGrid({ posts, onUpdatePost }: InstagramGridProps) {
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [generatingImageForDay, setGeneratingImageForDay] = useState<number | null>(null);

  const handleCopyCaption = () => {
    if (selectedPost) {
      navigator.clipboard.writeText(selectedPost.caption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    }
  };

  const handleCopyHashtags = () => {
    if (selectedPost) {
      navigator.clipboard.writeText(selectedPost.hashtags);
      setCopiedHashtags(true);
      setTimeout(() => setCopiedHashtags(false), 2000);
    }
  };

  const handleGenerateImage = async (post: InstagramPost, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdatePost) return;

    setGeneratingImageForDay(post.day);
    try {
      const prompt = `Instagram post graphic, modern aesthetic, vibrant colors, eye-catching, professional marketing visual. No text on image. Topic: ${post.visualDescription || post.caption.substring(0, 100)}. Square 1:1 format.`;

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspect_ratio: '1:1',
          num_outputs: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      console.log('Instagram - Response data:', data);
      console.log('Instagram - Images array:', data.images);
      console.log('Instagram - First image:', data.images?.[0]);
      console.log('Instagram - First image type:', typeof data.images?.[0]);

      if (data.images && data.images.length > 0) {
        const imageUrl = typeof data.images[0] === 'string' ? data.images[0] : String(data.images[0]);
        console.log('Instagram - Setting image URL:', imageUrl);
        onUpdatePost(post.day, { image_url: imageUrl });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setGeneratingImageForDay(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {posts.slice(0, 7).map((post, idx) => (
          <div
            key={post.day}
            className="relative aspect-square overflow-hidden rounded-lg border border-slate-200"
          >
            {post.image_url ? (
              <button
                onClick={() => setSelectedPost(post)}
                className="w-full h-full group relative"
              >
                <img
                  src={post.image_url}
                  alt={`Instagram post ${post.day}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                  <div className="text-xs px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full font-semibold text-slate-800 flex items-center gap-1 w-fit">
                    <span>{getPostTypeEmoji(post.type)}</span>
                    <span>{post.type}</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white mb-1">Day {post.day}</div>
                    <p className="text-white text-xs leading-relaxed line-clamp-2">
                      {post.caption.substring(0, 80)}...
                    </p>
                  </div>
                </div>
              </button>
            ) : (
              <div
                className="w-full h-full bg-gradient-to-br"
                style={{
                  background: `linear-gradient(135deg, ${
                    idx % 6 === 0 ? '#ec4899, #f97316' :
                    idx % 6 === 1 ? '#a855f7, #ec4899' :
                    idx % 6 === 2 ? '#3b82f6, #a855f7' :
                    idx % 6 === 3 ? '#10b981, #06b6d4' :
                    idx % 6 === 4 ? '#f59e0b, #ef4444' :
                    '#6366f1, #ec4899'
                  })`
                }}
              >
                <button
                  onClick={() => setSelectedPost(post)}
                  className="w-full h-full flex flex-col items-center justify-center p-3 text-center"
                >
                  <div className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                    {post.day}
                  </div>
                  <div className="text-xs px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full font-semibold text-slate-800 flex items-center gap-1">
                    <span>{getPostTypeEmoji(post.type)}</span>
                    <span>{post.type}</span>
                  </div>
                </button>
              </div>
            )}

            {onUpdatePost && (
              <button
                onClick={(e) => handleGenerateImage(post, e)}
                disabled={generatingImageForDay === post.day}
                className="absolute bottom-2 right-2 flex items-center justify-center gap-1 text-xs bg-white/95 hover:bg-white text-slate-700 py-1.5 px-2.5 rounded-lg shadow-md transition-all disabled:opacity-50 backdrop-blur-sm"
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
        ))}
      </div>

      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Day {selectedPost?.day} - {selectedPost?.type} Post
            </DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              {selectedPost.image_url && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Generated Image</label>
                  <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={selectedPost.image_url}
                      alt={`Day ${selectedPost.day} post`}
                      className="w-full aspect-square object-cover"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">Post Type</label>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-sm font-medium">
                    {getPostTypeEmoji(selectedPost.type)} {selectedPost.type}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Best Posting Time</label>
                <p className="mt-1 text-gray-900">{selectedPost.time}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Caption</label>
                  <Button
                    onClick={handleCopyCaption}
                    variant="outline"
                    size="sm"
                    className="h-8"
                  >
                    {copiedCaption ? (
                      <>
                        <Check className="mr-1 h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-3 w-3" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedPost.caption}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Hashtags</label>
                  <Button
                    onClick={handleCopyHashtags}
                    variant="outline"
                    size="sm"
                    className="h-8"
                  >
                    {copiedHashtags ? (
                      <>
                        <Check className="mr-1 h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-3 w-3" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-900 text-sm">{selectedPost.hashtags}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Visual Description</label>
                <div className="mt-1 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-purple-900 text-sm">{selectedPost.visualDescription}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
