import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ChannelBadge, CommunicationStatusBadge } from './CommunicationBadges';
import type { Notification } from '../../../types/communication';

export interface NotificationTableProps {
  notifications: Notification[];
  isLoading?: boolean;
  onMarkAsRead?: (notification: Notification) => void;
}

export const NotificationTable: React.FC<NotificationTableProps> = ({
  notifications,
  isLoading = false,
  onMarkAsRead,
}) => {
  if (!isLoading && notifications.length === 0) {
    return (
      <EmptyState
        title="No communication records found"
        description="Dispatched reminders, emails, and in-app notifications will appear here."
      />
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Channel</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Subject & Content</TableHead>
            <TableHead>Related Context</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent / Read At</TableHead>
            <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notifications.map((row) => {
            const recipient = row.recipient_email || row.recipient_phone || row.user_name || 'System / In-App';
            const dateStr = row.sent_at || row.created_at;
            const displayDate = dateStr
              ? new Date(dateStr).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—';

            return (
              <TableRow key={row.id}>
                <TableCell>
                  <ChannelBadge channel={row.channel} />
                </TableCell>
                <TableCell>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-slate-900)', fontSize: '0.875rem' }}>
                      {recipient}
                    </div>
                    {row.user_name && row.recipient_email && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                        User: {row.user_name}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div style={{ maxWidth: '340px' }}>
                    {row.subject && (
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--color-slate-800)', marginBottom: '0.125rem' }}>
                        {row.subject}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-slate-600)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={row.body}
                    >
                      {row.body}
                    </div>
                    {row.template_name && (
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-indigo-600)', marginTop: '0.125rem' }}>
                        Template: {row.template_name}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    {row.related_entity_type ? (
                      <Badge variant="neutral" size="sm">
                        {row.related_entity_type}
                      </Badge>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)' }}>—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <CommunicationStatusBadge status={row.status} />
                    {row.failure_reason && (
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-rose-600)', marginTop: '0.125rem', maxWidth: '140px' }}>
                        {row.failure_reason}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-600)' }}>
                    <div>{displayDate}</div>
                    {row.read_at && (
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-emerald-600)' }}>
                        Read: {new Date(row.read_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell style={{ textAlign: 'right' }}>
                  {row.channel === 'IN_APP' && row.status !== 'READ' && onMarkAsRead && (
                    <Button size="sm" variant="ghost" onClick={() => onMarkAsRead(row)}>
                      Mark Read
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
