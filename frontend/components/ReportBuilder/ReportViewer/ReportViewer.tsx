'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Clock, Cpu, Tag, Calendar, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Report } from '@/lib/api';

interface ReportViewerProps {
  report: Report | null;
  isLoading?: boolean;
  summaryOnly?: boolean;
  contentOnly?: boolean;
}

export default function ReportViewer({ report, isLoading, summaryOnly = false, contentOnly = false }: ReportViewerProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Render summary metadata only
  const renderSummary = () => {
    if (!report) {
      return (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Report Summary
            </CardTitle>
            <CardDescription>No report generated yet</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Generate a report to see its details here
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{report.title}</CardTitle>
              <CardDescription>Report ID: {report.id}</CardDescription>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                report.status
              )}`}
            >
              {report.status}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {report.report_type && (
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium capitalize">
                    {report.report_type.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">{formatDate(report.created_at)}</p>
              </div>
            </div>

            {report.generation_time && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Generation Time</p>
                  <p className="text-sm font-medium">{report.generation_time.toFixed(2)}s</p>
                </div>
              </div>
            )}

            {report.llm_provider && (
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Provider</p>
                  <p className="text-sm font-medium capitalize">{report.llm_provider}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render content only
  const renderContent = () => {
    // Loading state
    if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center p-6">
          <Card className="w-full">
            <CardContent className="py-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Generating report...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Empty state
    if (!report) {
      return (
        <div className="h-full flex items-center justify-center p-6">
          <Card className="w-full">
            <CardContent className="py-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">No Report Generated Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Click &quot;Generate Report&quot; to create your first report from the blueprint
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="h-full overflow-y-auto space-y-6">
        {/* Error Message */}
        {report.status === 'failed' && report.error_message && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                    Generation Failed
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">{report.error_message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing Status */}
        {report.status === 'processing' && (
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    Report is being generated
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    This may take a few moments. The view will update automatically when complete.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated Content */}
        {report.status === 'completed' && report.generated_content && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Report</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{report.generated_content}</ReactMarkdown>
            </CardContent>
          </Card>
        )}

        {/* Pending State */}
        {report.status === 'pending' && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">This report is pending generation.</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Return based on mode
  if (summaryOnly) return renderSummary();
  if (contentOnly) return renderContent();

  // Default: render both (for backwards compatibility, though not used in new layout)
  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {renderSummary()}
      {renderContent()}
    </div>
  );
}
