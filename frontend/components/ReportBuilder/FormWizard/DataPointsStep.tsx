'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DataPoint } from '@/types/blueprint.types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface DataPointsStepProps {
  dataPoints: DataPoint[];
  selectedDataPoints: Record<string, boolean>;
  selectedSubOptions: Record<string, boolean>;
  onDataPointChange: (id: string, checked: boolean) => void;
  onSubOptionChange: (id: string, checked: boolean) => void;
}

export default function DataPointsStep({
  dataPoints,
  selectedDataPoints,
  selectedSubOptions,
  onDataPointChange,
  onSubOptionChange,
}: DataPointsStepProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleParentChange = (dataPoint: DataPoint, checked: boolean) => {
    onDataPointChange(dataPoint.id, checked);

    // Also check/uncheck all sub-options
    if (dataPoint.subOptions) {
      dataPoint.subOptions.forEach((subOption) => {
        onSubOptionChange(subOption.id, checked);
      });
    }

    // Auto-expand when checked
    if (checked && dataPoint.subOptions) {
      setExpandedSections((prev) => ({ ...prev, [dataPoint.id]: true }));
    }
  };

  const handleSubOptionChange = (parentId: string, subOptionId: string, checked: boolean) => {
    onSubOptionChange(subOptionId, checked);

    // If at least one sub-option is checked, check parent
    const dataPoint = dataPoints.find((dp) => dp.id === parentId);
    if (dataPoint?.subOptions) {
      const anyChecked =
        checked ||
        dataPoint.subOptions.some(
          (sub) => sub.id !== subOptionId && selectedSubOptions[sub.id]
        );
      onDataPointChange(parentId, anyChecked);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Select Data Points</h2>
        <p className="text-muted-foreground">
          Choose the data points you want to include in your report
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Data Points</CardTitle>
          <CardDescription>
            Select main categories and expand to choose specific metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {dataPoints.map((dataPoint) => {
            const isExpanded = expandedSections[dataPoint.id];
            const hasSubOptions = dataPoint.subOptions && dataPoint.subOptions.length > 0;

            return (
              <div key={dataPoint.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={dataPoint.id}
                    checked={selectedDataPoints[dataPoint.id] || false}
                    onCheckedChange={(checked) =>
                      handleParentChange(dataPoint, checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={dataPoint.id}
                        className="font-semibold cursor-pointer text-base"
                      >
                        {dataPoint.label}
                      </Label>
                      {hasSubOptions && (
                        <button
                          type="button"
                          onClick={() => toggleSection(dataPoint.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {hasSubOptions && isExpanded && (
                      <div className="mt-3 ml-4 space-y-2 border-l-2 border-muted pl-4">
                        {dataPoint.subOptions?.map((subOption) => (
                          <div key={subOption.id} className="flex items-center gap-2">
                            <Checkbox
                              id={subOption.id}
                              checked={selectedSubOptions[subOption.id] || false}
                              onCheckedChange={(checked) =>
                                handleSubOptionChange(
                                  dataPoint.id,
                                  subOption.id,
                                  checked as boolean
                                )
                              }
                            />
                            <Label
                              htmlFor={subOption.id}
                              className="text-sm cursor-pointer font-normal"
                            >
                              {subOption.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
