'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AdditionalNotesStepProps {
  notes: string;
  onChange: (notes: string) => void;
}

export default function AdditionalNotesStep({ notes, onChange }: AdditionalNotesStepProps) {
  const maxLength = 2000;
  const remainingChars = maxLength - notes.length;

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Additional Context</h2>
        <p className="text-muted-foreground">
          Add any additional notes, specific requirements, or context for your report
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Additional Notes (Optional)</CardTitle>
          <CardDescription>
            Provide any extra information that will help generate a more accurate report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={notes}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Example: Focus on Q4 2024 data, compare with competitors in the US market, include recommendations for improving conversion rates..."
            maxLength={maxLength}
            rows={10}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
          />
          <div className="mt-2 text-right">
            <span
              className={`text-sm ${
                remainingChars < 100 ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              {remainingChars} characters remaining
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
