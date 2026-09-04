import React from 'react';
import { Building2, User } from 'lucide-react';
import type { Client } from '../../../types/client';
import {
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Skeleton,
  EmptyState,
} from '../../../components/ui';

export interface ClientTableProps {
  clients?: Client[];
  isLoading: boolean;
  onSelectClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
}

export const ClientTable: React.FC<ClientTableProps> = ({
  clients = [],
  isLoading,
  onSelectClient,
}) => {
  const renderClientTypeBadge = (type: string) => {
    switch (type) {
      case 'PRIVATE_LIMITED':
      case 'PUBLIC_LIMITED':
        return <Badge variant="primary" size="sm">{type.replace('_', ' ')}</Badge>;
      case 'LLP':
      case 'PARTNERSHIP_FIRM':
        return <Badge variant="info" size="sm">{type.replace('_', ' ')}</Badge>;
      case 'PROPRIETORSHIP':
      case 'INDIVIDUAL':
        return <Badge variant="neutral" size="sm">{type}</Badge>;
      default:
        return <Badge variant="purple" size="sm">{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client Code</TableHead>
            <TableHead>Legal & Trade Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>PAN</TableHead>
            <TableHead>Assigned Staff</TableHead>
            <TableHead>GSTINs</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i}>
              <TableCell><Skeleton variant="text" width={60} /></TableCell>
              <TableCell><Skeleton variant="text" width="80%" /></TableCell>
              <TableCell><Skeleton variant="text" width={80} /></TableCell>
              <TableCell><Skeleton variant="text" width={100} /></TableCell>
              <TableCell><Skeleton variant="text" width={100} /></TableCell>
              <TableCell><Skeleton variant="text" width={40} /></TableCell>
              <TableCell><Skeleton variant="text" width={60} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (clients.length === 0) {
    return (
      <EmptyState
        title="No Clients Found"
        description="No practice clients match your active filters or search criteria."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client Code</TableHead>
          <TableHead>Legal & Trade Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>PAN</TableHead>
          <TableHead>Assigned Staff</TableHead>
          <TableHead>GSTINs</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow
            key={client.id}
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectClient(client)}
          >
            <TableCell>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-slate-700)' }}>
                {client.client_code}
              </span>
            </TableCell>
            <TableCell>
              <div>
                <button
                  type="button"
                  style={{
                    fontWeight: 600,
                    color: 'var(--color-primary-600)',
                    textAlign: 'left',
                    padding: 0,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectClient(client);
                  }}
                >
                  {client.legal_name}
                </button>
                {client.display_name && client.display_name !== client.legal_name && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                    Trade: {client.display_name}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>{renderClientTypeBadge(client.client_type)}</TableCell>
            <TableCell>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                {client.pan || '-'}
              </span>
            </TableCell>
            <TableCell>
              {client.assigned_user_name ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}>
                  <User size={14} style={{ color: 'var(--color-slate-400)' }} />
                  <span>{client.assigned_user_name}</span>
                </div>
              ) : (
                <span style={{ color: 'var(--color-slate-400)', fontSize: '0.8125rem' }}>Unassigned</span>
              )}
            </TableCell>
            <TableCell>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Building2 size={14} style={{ color: 'var(--color-slate-400)' }} />
                <span style={{ fontWeight: 600 }}>{client.gstin_count}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={client.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm" dot>
                {client.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
