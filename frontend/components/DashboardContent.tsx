'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api, type HealthResponse } from '@/lib/api';
import { Plus } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface UserStats {
  total_reports: number;
  active_reports: number;
  completed_reports: number;
}

export function DashboardContent() {
  const { user } = useUser();
  const router = useRouter();
  const [healthStatus, setHealthStatus] = useState<HealthResponse | null>(null);
  const [stats, setStats] = useState<UserStats>({ total_reports: 0, active_reports: 0, completed_reports: 0 });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await api.health();
        console.log('Health check response:', response);
        setHealthStatus(response);
      } catch (error) {
        console.error('Health check failed:', error);
      }
    };

    checkHealth();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const userStats = await api.getUserStats(user.id);
        setStats(userStats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Create and manage your marketing reports
          </p>
        </div>
        <Button onClick={() => router.push('/report-builder')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Reports</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_reports}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Reports</CardTitle>
            <CardDescription>Currently processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_reports}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Status</CardTitle>
            <CardDescription>Backend connection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthStatus?.status === 'ok' ? '✓ Online' : '✗ Offline'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Your latest marketing reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No reports yet. Click &quot;Create Report&quot; to get started.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
