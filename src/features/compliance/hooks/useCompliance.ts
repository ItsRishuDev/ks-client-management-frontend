import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { complianceApi } from '../../../api/compliance';
import { DASHBOARD_QUERY_KEYS } from '../../dashboard/hooks/useDashboard';
import { CLIENTS_QUERY_KEYS } from '../../clients/hooks/useClients';
import type {
  ComplianceListParams,
  CreateCompliancePayload,
  UpdateCompliancePayload,
} from '../../../types/compliance';

export const COMPLIANCE_QUERY_KEYS = {
  all: ['compliance'] as const,
  lists: () => ['compliance', 'list'] as const,
  list: (params: ComplianceListParams) => ['compliance', 'list', params] as const,
  details: () => ['compliance', 'detail'] as const,
  detail: (id: string) => ['compliance', 'detail', id] as const,
  filing: (id: string) => ['compliance', 'filing', id] as const,
};

export const useComplianceList = (params: ComplianceListParams = {}) => {
  return useQuery({
    queryKey: COMPLIANCE_QUERY_KEYS.list(params),
    queryFn: () => complianceApi.list(params),
    staleTime: 30 * 1000,
  });
};

export const useComplianceDetail = (complianceId?: string) => {
  return useQuery({
    queryKey: COMPLIANCE_QUERY_KEYS.detail(complianceId || ''),
    queryFn: () => complianceApi.get(complianceId!),
    enabled: !!complianceId,
    staleTime: 60 * 1000,
  });
};

export const useComplianceFiling = (complianceId?: string) => {
  return useQuery({
    queryKey: COMPLIANCE_QUERY_KEYS.filing(complianceId || ''),
    queryFn: () => complianceApi.getFiling(complianceId!),
    enabled: !!complianceId,
    staleTime: 60 * 1000,
  });
};

export const useCreateComplianceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCompliancePayload) => complianceApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPLIANCE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.all });
    },
  });
};

export const useUpdateComplianceMutation = (complianceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCompliancePayload) => complianceApi.update(complianceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPLIANCE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: COMPLIANCE_QUERY_KEYS.detail(complianceId) });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.all });
    },
  });
};
