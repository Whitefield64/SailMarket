'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { REPORT_TYPE_OPTIONS } from '@/types/form.types';
import { ReportType } from '@/types/blueprint.types';
import { CheckCircle2, Circle, Building2 } from 'lucide-react';

interface ReportTypeStepProps {
  selectedType: ReportType | '';
  analysisSubject: string;
  onSelect: (type: ReportType) => void;
  onSubjectChange: (subject: string) => void;
}

export default function ReportTypeStep({ selectedType, analysisSubject, onSelect, onSubjectChange }: ReportTypeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">What is your report about?</h2>
        <p className="text-muted-foreground">
          Specify your analysis subject and select the report type
        </p>
      </div>

      {/* Analysis Subject Field */}
      <Card className="bg-accent/50">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <Label htmlFor="analysisSubject" className="text-base font-semibold">
                Analysis Subject
              </Label>
            </div>
            <Input
              id="analysisSubject"
              type="url"
              placeholder="Enter your company/product website URL (e.g., https://example.com)"
              value={analysisSubject}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="text-base"
            />
            <p className="text-sm text-muted-foreground">
              Provide the website URL or name of the company, product, or service you want to analyze
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Report Type Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Report Type</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORT_TYPE_OPTIONS.map((option) => {
          const isSelected = selectedType === option.value;

          return (
            <Card
              key={option.value}
              className={`
                cursor-pointer transition-all duration-200 hover:shadow-md
                ${isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent'}
              `}
              onClick={() => onSelect(option.value as ReportType)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {isSelected ? (
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{option.label}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      </div>
    </div>
  );
}
