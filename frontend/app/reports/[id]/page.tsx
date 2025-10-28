'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { api, Report } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Tag, Clock, Cpu, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ReportDetailPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadReport();
  }, [authLoading, isAuthenticated, router, reportId]);

  const loadReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const reportData = await api.getReport(parseInt(reportId));
      setReport(reportData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load report');
    } finally {
      setIsLoading(false);
    }
  };

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
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push('/reports')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push('/reports')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
      </div>

      {/* Report Metadata */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{report.title}</CardTitle>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {report.report_type && (
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm font-medium capitalize">
                    {report.report_type.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm font-medium">{formatDate(report.created_at)}</p>
              </div>
            </div>

            {report.generation_time && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Generation Time</p>
                  <p className="text-sm font-medium">{report.generation_time.toFixed(2)}s</p>
                </div>
              </div>
            )}

            {report.llm_provider && (
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Provider</p>
                  <p className="text-sm font-medium capitalize">{report.llm_provider}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {report.status === 'failed' && report.error_message && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Generation Failed</h3>
                <p className="text-sm text-red-700">{report.error_message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Status */}
      {report.status === 'processing' && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <div>
                <h3 className="font-semibold text-blue-900">Report is being generated</h3>
                <p className="text-sm text-blue-700">
                  This may take a few moments. Please refresh the page to see updates.
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
          <CardContent className="prose prose-sm max-w-none">
            <ReactMarkdown>{report.generated_content}</ReactMarkdown>
          </CardContent>
        </Card>
      )}

      {/* No Content Yet */}
      {report.status === 'pending' && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">This report is pending generation.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
