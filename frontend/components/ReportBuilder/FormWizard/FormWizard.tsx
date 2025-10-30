'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import StepIndicator from './StepIndicator';
import ReportTypeStep from './ReportTypeStep';
import DataPointsStep from './DataPointsStep';
import AdditionalNotesStep from './AdditionalNotesStep';
import FormNavigation from './FormNavigation';
import { FormData, ReportType } from '@/types/blueprint.types';
import { WIZARD_STEPS } from '@/types/form.types';
import { DATA_POINTS_MAP } from '@/data/dataPoints';
import { Blueprint } from '@/types/blueprint.types';
import api from '@/lib/api';

interface FormWizardProps {
  onBlueprintGenerated: (blueprint: Blueprint, formSelections: any) => void;
}

export default function FormWizard({ onBlueprintGenerated }: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    reportType: '',
    analysisSubject: '',
    selectedDataPoints: {},
    selectedSubOptions: {},
    additionalNotes: '',
  });

  // Get data points for current report type
  const currentDataPoints = formData.reportType
    ? DATA_POINTS_MAP[formData.reportType] || []
    : [];

  // Get selected data points as array of labels
  const getSelectedDataPointsLabels = (): string[] => {
    const labels: string[] = [];

    currentDataPoints.forEach((dataPoint) => {
      if (formData.selectedDataPoints[dataPoint.id]) {
        // Add main category
        labels.push(dataPoint.label);

        // Add selected sub-options
        if (dataPoint.subOptions) {
          dataPoint.subOptions.forEach((subOption) => {
            if (formData.selectedSubOptions[subOption.id]) {
              labels.push(`  - ${subOption.label}`);
            }
          });
        }
      }
    });

    return labels;
  };

  // Validation
  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1:
        return formData.reportType !== '' && formData.analysisSubject.trim() !== '';
      case 2:
        return Object.values(formData.selectedDataPoints).some((v) => v === true);
      case 3:
        return true; // Additional notes are optional
      default:
        return false;
    }
  };

  // Navigation
  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  // Form data handlers
  const handleReportTypeChange = (type: ReportType) => {
    setFormData({
      ...formData,
      reportType: type,
      selectedDataPoints: {},
      selectedSubOptions: {},
    });
  };

  const handleDataPointChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      selectedDataPoints: {
        ...prev.selectedDataPoints,
        [id]: checked,
      },
    }));
  };

  const handleSubOptionChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      selectedSubOptions: {
        ...prev.selectedSubOptions,
        [id]: checked,
      },
    }));
  };

  const handleNotesChange = (notes: string) => {
    setFormData((prev) => ({
      ...prev,
      additionalNotes: notes,
    }));
  };

  const handleSubjectChange = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      analysisSubject: subject,
    }));
  };

  // Blueprint generation
  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const selectedLabels = getSelectedDataPointsLabels();

      const data = await api.generateBlueprint({
        reportType: formData.reportType,
        analysisSubject: formData.analysisSubject,
        selectedDataPoints: selectedLabels,
        additionalNotes: formData.additionalNotes,
      });

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate blueprint');
      }

      // Pass both blueprint and form selections
      onBlueprintGenerated(data.blueprint, {
        reportType: formData.reportType,
        analysisSubject: formData.analysisSubject,
        selectedDataPoints: selectedLabels,
        additionalNotes: formData.additionalNotes,
        formData: formData,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred while generating the blueprint');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <StepIndicator
        currentStep={currentStep}
        totalSteps={WIZARD_STEPS.length}
        steps={WIZARD_STEPS}
      />

      <Card className="p-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        {currentStep === 1 && (
          <ReportTypeStep
            selectedType={formData.reportType}
            analysisSubject={formData.analysisSubject}
            onSelect={handleReportTypeChange}
            onSubjectChange={handleSubjectChange}
          />
        )}

        {currentStep === 2 && (
          <DataPointsStep
            dataPoints={currentDataPoints}
            selectedDataPoints={formData.selectedDataPoints}
            selectedSubOptions={formData.selectedSubOptions}
            onDataPointChange={handleDataPointChange}
            onSubOptionChange={handleSubOptionChange}
          />
        )}

        {currentStep === 3 && (
          <AdditionalNotesStep notes={formData.additionalNotes} onChange={handleNotesChange} />
        )}

        <FormNavigation
          currentStep={currentStep}
          totalSteps={WIZARD_STEPS.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={handleSubmit}
          isNextDisabled={!isStepValid()}
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
}
