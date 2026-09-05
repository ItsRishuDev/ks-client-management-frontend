import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ChannelBadge } from './CommunicationBadges';
import type { NotificationTemplate } from '../../../types/communication';

export interface TemplateTableProps {
  templates: NotificationTemplate[];
  isLoading?: boolean;
  onUseTemplate?: (template: NotificationTemplate) => void;
  onToggleActive?: (template: NotificationTemplate) => void;
}

export const TemplateTable: React.FC<TemplateTableProps> = ({
  templates,
  isLoading = false,
  onUseTemplate,
  onToggleActive,
}) => {
  if (!isLoading && templates.length === 0) {
    return (
      <EmptyState
        title="No notification templates found"
        description="Create reusable message templates with dynamic variables to streamline client reminders."
      />
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Template Name</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Subject / Body Preview</TableHead>
            <TableHead>Variables</TableHead>
            <TableHead>Status</TableHead>
            <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <div style={{ fontWeight: 600, color: 'var(--color-slate-900)' }}>{row.name}</div>
                {row.created_by_name && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                    By: {row.created_by_name}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <ChannelBadge channel={row.channel} />
              </TableCell>
              <TableCell>
                <div style={{ maxWidth: '320px' }}>
                  {row.subject && (
                    <div style={{ fontWeight: 500, fontSize: '0.8125rem', color: 'var(--color-slate-800)', marginBottom: '0.125rem' }}>
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
                  >
                    {row.body}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', maxWidth: '220px' }}>
                  {row.variables && row.variables.length > 0 ? (
                    row.variables.map((v) => (
                      <Badge key={v} variant="neutral" size="sm">
                        {`{{${v}}}`}
                      </Badge>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)' }}>None</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={row.active ? 'success' : 'neutral'} size="sm">
                  {row.active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                  {onUseTemplate && row.active && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUseTemplate(row)}
                      title="Send message using this template"
                    >
                      Use Template
                    </Button>
                  )}
                  {onToggleActive && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleActive(row)}
                      style={{ color: row.active ? 'var(--color-slate-600)' : 'var(--color-emerald-600)' }}
                    >
                      {row.active ? 'Deactivate' : 'Activate'}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
