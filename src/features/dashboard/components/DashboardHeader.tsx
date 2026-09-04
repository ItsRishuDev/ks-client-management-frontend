import React from 'react';
import { RefreshCw, UserCheck, Users } from 'lucide-react';
import { Button } from '../../../components/ui';
import { useAuth } from '../../../context/useAuth';

export interface DashboardHeaderProps {
  assignedToMe: boolean;
  onToggleAssignedToMe: (val: boolean) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  assignedToMe,
  onToggleAssignedToMe,
  onRefresh,
  isRefreshing,
}) => {
  const { user } = useAuth();

  return (
    <div className="dashboard-header-section">
      <div className="dashboard-header-title-group">
        <h1>Practice Operations Dashboard</h1>
        <p>
          Real-time compliance, tasks, and document requisitions for{' '}
          <strong>{user?.firm?.display_name || user?.firm?.legal_name || 'Your Firm'}</strong>
        </p>
      </div>

      <div className="dashboard-header-actions">
        <Button
          variant={assignedToMe ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onToggleAssignedToMe(!assignedToMe)}
          iconLeft={assignedToMe ? <UserCheck size={16} /> : <Users size={16} />}
        >
          {assignedToMe ? 'My Assigned Work' : 'All Firm Work'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          loading={isRefreshing}
          iconLeft={<RefreshCw size={14} />}
          aria-label="Refresh Dashboard Data"
        >
          Refresh
        </Button>
      </div>
    </div>
  );
};
