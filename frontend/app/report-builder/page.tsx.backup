'use client';

import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import FormWizard from '@/components/ReportBuilder/FormWizard/FormWizard';
import BlueprintTree from '@/components/ReportBuilder/BlueprintPanel/BlueprintTree';
import { Blueprint } from '@/types/blueprint.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { blueprintToPrompt, getBlueprintSummary } from '@/utils/blueprintToPrompt';
import { FileText, Download, Sparkles, CheckCircle2, Eye } from 'lucide-react';
import api from '@/lib/api';

export default function ReportBuilderPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [formSelections, setFormSelections] = useState<any>(null);
  const [showForm, setShowForm] = useState(true);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportId, setReportId] = useState<number | null>(null);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleBlueprintGenerated = (newBlueprint: Blueprint, selections: any) => {
    setBlueprint(newBlueprint);
    setFormSelections(selections);
    setShowForm(false);
  };

  const handleSectionsChange = (newSections: typeof blueprint.sections) => {
    if (blueprint) {
      setBlueprint({
        ...blueprint,
        sections: newSections,
      });
    }
  };

  const handleGenerateReport = async () => {
    if (!blueprint || !user) return;

    setIsGenerating(true);

    try {
      // Generate the prompt for display
      const prompt = blueprintToPrompt(blueprint);
      setGeneratedPrompt(prompt);

      // Call the API to generate the report
      const response = await api.generateReportFromBlueprint({
        user_id: user.id,
        blueprint: blueprint,
        form_selections: formSelections || {},
      });

      setReportId(response.report_id);

      console.log('Report generation started:', response);

      // Show success message and redirect to reports page after a short delay
      setTimeout(() => {
        router.push('/reports');
      }, 2000);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('An error occurred while generating the report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPrompt = () => {
    if (!generatedPrompt) return;

    const blob = new Blob([generatedPrompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${blueprint?.reportTitle.replace(/\s+/g, '_')}_prompt.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleStartOver = () => {
    setBlueprint(null);
    setShowForm(true);
    setGeneratedPrompt(null);
  };

  const summary = blueprint ? getBlueprintSummary(blueprint) : null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Report Builder</h1>
          <p className="text-muted-foreground">
            Create structured market analysis reports with AI-powered blueprint generation
          </p>
        </div>

        {showForm && !blueprint ? (
          /* Form Wizard View */
          <FormWizard onBlueprintGenerated={handleBlueprintGenerated} />
        ) : (
          /* Blueprint Editor View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Blueprint Editor */}
            <div className="lg:col-span-2">
              <BlueprintTree
                sections={blueprint?.sections || []}
                onSectionsChange={handleSectionsChange}
              />
            </div>

            {/* Right Panel - Actions & Summary */}
            <div className="space-y-6">
              {/* Blueprint Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Blueprint Summary
                  </CardTitle>
                  <CardDescription>{blueprint?.reportTitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Report Type
                    </div>
                    <div className="font-medium">
                      {blueprint?.reportType.replace(/_/g, ' ').toUpperCase()}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Total Sections
                    </div>
                    <div className="font-medium">{summary?.totalSections}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Section Types
                    </div>
                    <div className="space-y-1">
                      {summary &&
                        Object.entries(summary.sectionTypes).map(([type, count]) => (
                          <div key={type} className="flex justify-between text-sm">
                            <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {summary?.estimatedLength && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Estimated Length
                      </div>
                      <div className="font-medium">{summary.estimatedLength}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                  <CardDescription>Finalize and generate your report</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={handleGenerateReport}
                    disabled={!blueprint || blueprint.sections.length === 0 || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>

                  {generatedPrompt && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleDownloadPrompt}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Prompt
                    </Button>
                  )}

                  <Button variant="outline" className="w-full" onClick={handleStartOver}>
                    <FileText className="w-4 h-4 mr-2" />
                    Start Over
                  </Button>
                </CardContent>
              </Card>

              {/* Success Message */}
              {generatedPrompt && reportId && (
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-green-900 dark:text-green-100 mb-1">
                          Report Generation Started!
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                          Your report is being generated. You will be redirected to the reports page shortly.
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white dark:bg-gray-800"
                          onClick={() => router.push('/reports')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Reports Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
