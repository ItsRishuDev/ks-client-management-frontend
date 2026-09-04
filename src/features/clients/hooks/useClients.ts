import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi, usersApi } from '../../../api/clients';
import type {
  ClientListParams,
  CreateClientPayload,
  CreateContactPayload,
  CreateEntityPayload,
  CreateGSTRegistrationPayload,
  FirmUserOption,
  UpdateClientPayload,
} from '../../../types/client';

export const CLIENTS_QUERY_KEYS = {
  all: ['clients'] as const,
  list: (params: ClientListParams) => ['clients', 'list', params] as const,
  detail: (id: string) => ['clients', 'detail', id] as const,
  view360: (id: string) => ['clients', '360', id] as const,
  contacts: (id: string) => ['clients', 'contacts', id] as const,
  entities: (id: string) => ['clients', 'entities', id] as const,
  gstRegistrations: (id: string) => ['clients', 'gstRegistrations', id] as const,
  firmUsers: ['users', 'firm'] as const,
};

export const useClientsList = (params: ClientListParams = {}) => {
  return useQuery({
    queryKey: CLIENTS_QUERY_KEYS.list(params),
    queryFn: () => clientsApi.list(params),
    staleTime: 30 * 1000,
  });
};

export const useClientDetail = (clientId?: string) => {
  return useQuery({
    queryKey: CLIENTS_QUERY_KEYS.detail(clientId || ''),
    queryFn: () => clientsApi.get(clientId!),
    enabled: !!clientId,
    staleTime: 60 * 1000,
  });
};

export const useClient360 = (clientId?: string) => {
  return useQuery({
    queryKey: CLIENTS_QUERY_KEYS.view360(clientId || ''),
    queryFn: () => clientsApi.get360(clientId!),
    enabled: !!clientId,
    staleTime: 60 * 1000,
  });
};

export const useFirmUsers = () => {
  return useQuery<FirmUserOption[]>({
    queryKey: CLIENTS_QUERY_KEYS.firmUsers,
    queryFn: async () => {
      const res = await usersApi.list();
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.items)) return res.items;
      return [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateClientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClientPayload) => clientsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateClientMutation = (clientId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateClientPayload) => clientsApi.update(clientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.detail(clientId) });
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.view360(clientId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeactivateClientMutation = (clientId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => clientsApi.deactivate(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.detail(clientId) });
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.view360(clientId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useAddContactMutation = (clientId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateContactPayload) => clientsApi.addContact(clientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.view360(clientId) });
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.contacts(clientId) });
    },
  });
};

export const useDeleteContactMutation = (clientId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactId: string) => clientsApi.deleteContact(clientId, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.view360(clientId) });
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.contacts(clientId) });
    },
  });
};

export const useCreateEntityMutation = (clientId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEntityPayload) => clientsApi.createEntity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.view360(clientId) });
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.entities(clientId) });
    },
  });
};

export const useCreateGSTRegistrationMutation = (clientId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGSTRegistrationPayload) => clientsApi.createGSTRegistration(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.view360(clientId) });
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.gstRegistrations(clientId) });
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEYS.all });
    },
  });
};
