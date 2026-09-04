import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/useAuth';
import {
  useDashboardSummary,
  useDashboardWorkQueue,
  useDashboardUpcomingDeadlines,
  useDashboardStaffWorkload,
} from '../features/dashboard/hooks/useDashboard';
import { DashboardHeader } from '../features/dashboard/components/DashboardHeader';
import { AttentionSummaryGrid } from '../features/dashboard/components/AttentionSummaryGrid';
import { WorkQueueSection } from '../features/dashboard/components/WorkQueueSection';
import { UpcomingDeadlinesSection } from '../features/dashboard/components/UpcomingDeadlinesSection';
import { StaffWorkloadSection } from '../features/dashboard/components/StaffWorkloadSection';
import { ErrorState } from '../components/ui';
import type { QueueCategory } from '../types/dashboard';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [assignedToMe, setAssignedToMe] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<QueueCategory>('all');
  const [selectedDays, setSelectedDays] = useState<number>(7);

  // Queries
  const summaryQuery = useDashboardSummary();
  const workQueueQuery = useDashboardWorkQueue({
    queue_type: selectedCategory,
    assigned_to_me: assignedToMe,
  });
  const upcomingDeadlinesQuery = useDashboardUpcomingDeadlines({
    days: selectedDays,
    assigned_to_me: assignedToMe,
  });

  const canViewStaffWorkload = user?.role === 'ADMIN' || user?.role === 'CA_MANAGER';
  const staffWorkloadQuery = useDashboardStaffWorkload(canViewStaffWorkload);

  const handleRefresh = useCallback(() => {
    summaryQuery.refetch();
    workQueueQuery.refetch();
    upcomingDeadlinesQuery.refetch();
    if (canViewStaffWorkload) {
      staffWorkloadQuery.refetch();
    }
  }, [summaryQuery, workQueueQuery, upcomingDeadlinesQuery, staffWorkloadQuery, canViewStaffWorkload]);

  const isRefreshing =
    summaryQuery.isFetching ||
    workQueueQuery.isFetching ||
    upcomingDeadlinesQuery.isFetching ||
    staffWorkloadQuery.isFetching;

  // If initial summary fetch failed with hard error
  if (summaryQuery.isError && !summaryQuery.data) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <ErrorState
          title="Unable to load practice dashboard"
          description="Failed to connect to the firm database. Please verify your network and credentials."
          onRetry={handleRefresh}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* 1. Header with Firm Context & Controls */}
      <DashboardHeader
        assignedToMe={assignedToMe}
        onToggleAssignedToMe={setAssignedToMe}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* 2. Primary Attention Metrics Grid */}
      <AttentionSummaryGrid
        summary={summaryQuery.data}
        isLoading={summaryQuery.isLoading}
      />

      {/* 3. Main Split Grid: Operational Work Queue + Upcoming Deadlines / Team Workload */}
      <div className="dashboard-main-grid">
        {/* Left / Primary Column: Work Queue */}
        <div style={{ minWidth: 0 }}>
          <WorkQueueSection
            data={workQueueQuery.data}
            isLoading={workQueueQuery.isLoading}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            assignedToMe={assignedToMe}
          />
        </div>

        {/* Right / Secondary Column: Deadlines & Workload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
          <UpcomingDeadlinesSection
            data={upcomingDeadlinesQuery.data}
            isLoading={upcomingDeadlinesQuery.isLoading}
            selectedDays={selectedDays}
            onSelectDays={setSelectedDays}
          />

          {canViewStaffWorkload && (
            <StaffWorkloadSection
              workload={staffWorkloadQuery.data}
              isLoading={staffWorkloadQuery.isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};
