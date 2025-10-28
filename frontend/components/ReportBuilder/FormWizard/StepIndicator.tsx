'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{ id: number; title: string; description: string }>;
}

export default function StepIndicator({ currentStep, totalSteps, steps }: StepIndicatorProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        font-semibold transition-all duration-200
                        ${
                          isCompleted
                            ? 'bg-primary text-primary-foreground'
                            : isCurrent
                            ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                            : 'bg-muted text-muted-foreground'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span>{step.id}</span>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div
                        className={`
                          text-sm font-medium
                          ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}
                        `}
                      >
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground hidden md:block mt-1">
                        {step.description}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {!isLast && (
                <div
                  className={`
                    h-0.5 flex-1 mx-4 transition-all duration-200 -mt-12
                    ${isCompleted ? 'bg-primary' : 'bg-muted'}
                  `}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
