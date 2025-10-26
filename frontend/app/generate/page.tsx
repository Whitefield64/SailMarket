import { ContentGenerationForm } from '@/components/ContentGenerationForm';

export default function GeneratePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Content Generator</h2>
        <p className="text-muted-foreground">
          Create high-quality marketing content with AI
        </p>
      </div>

      <ContentGenerationForm />
    </div>
  );
}
