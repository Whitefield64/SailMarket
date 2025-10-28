'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { REPORT_TYPE_OPTIONS } from '@/types/form.types';
import { ReportType } from '@/types/blueprint.types';
import { CheckCircle2, Circle } from 'lucide-react';

interface ReportTypeStepProps {
  selectedType: ReportType | '';
  onSelect: (type: ReportType) => void;
}

export default function ReportTypeStep({ selectedType, onSelect }: ReportTypeStepProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">What is your report about?</h2>
        <p className="text-muted-foreground">
          Select the type of report you want to create
        </p>
      </div>

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
  );
}
