'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api, ContentType, ContentTone, type ContentGenerationRequest, type ContentGenerationResponse } from '@/lib/api';
import { Loader2, Copy, Check } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'blog', label: 'Blog Post' },
  { value: 'social', label: 'Social Media' },
  { value: 'email', label: 'Email Campaign' },
  { value: 'ad_copy', label: 'Ad Copy' },
  { value: 'landing_page', label: 'Landing Page' },
];

const CONTENT_TONES: { value: ContentTone; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'humorous', label: 'Humorous' },
  { value: 'urgent', label: 'Urgent' },
];

export function ContentGenerationForm() {
  const { user } = useUser();

  const [formData, setFormData] = useState<ContentGenerationRequest>({
    content_type: 'blog',
    topic: '',
    tone: 'professional',
    length: 500,
    additional_context: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ContentGenerationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Include user_id if user is logged in
      const requestData = {
        ...formData,
        user_id: user?.id
      };
      const response = await api.generateContent(requestData);
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate content. Please try again.');
      console.error('Content generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result.generated_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Marketing Content</CardTitle>
          <CardDescription>
            Use AI to create high-quality marketing content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="content_type" className="text-sm font-medium">
                Content Type
              </label>
              <select
                id="content_type"
                value={formData.content_type}
                onChange={(e) => setFormData({ ...formData, content_type: e.target.value as ContentType })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={isLoading}
              >
                {CONTENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="topic" className="text-sm font-medium">
                Topic <span className="text-destructive">*</span>
              </label>
              <input
                id="topic"
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g., Benefits of cloud computing for small businesses"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tone" className="text-sm font-medium">
                Tone
              </label>
              <select
                id="tone"
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value as ContentTone })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={isLoading}
              >
                {CONTENT_TONES.map((tone) => (
                  <option key={tone.value} value={tone.value}>
                    {tone.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="length" className="text-sm font-medium">
                Length (words): {formData.length}
              </label>
              <input
                id="length"
                type="range"
                min="50"
                max="2000"
                step="50"
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: parseInt(e.target.value) })}
                className="w-full"
                disabled={isLoading}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>50 words</span>
                <span>2000 words</span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="additional_context" className="text-sm font-medium">
                Additional Context (optional)
              </label>
              <textarea
                id="additional_context"
                value={formData.additional_context}
                onChange={(e) => setFormData({ ...formData, additional_context: e.target.value })}
                placeholder="Any specific requirements, keywords, or details to include..."
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={isLoading}
              />
            </div>

            <Button type="submit" disabled={isLoading || !formData.topic} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Content'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Content</CardTitle>
                <CardDescription>
                  Generated in {result.generation_time?.toFixed(2)}s using {result.llm_provider} ({result.model_used})
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-muted p-4">
              <p className="whitespace-pre-wrap text-sm">{result.generated_text}</p>
            </div>
            <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
              <span>Content Type: {result.content_type}</span>
              <span>Tone: {result.tone}</span>
              <span>Tokens: {result.tokens_used || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
