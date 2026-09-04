import { apiClient } from './client';
import type {
  Client,
  Client360,
  ClientContact,
  ClientListParams,
  ClientListResponse,
  CreateClientPayload,
  CreateContactPayload,
  CreateEntityPayload,
  CreateGSTRegistrationPayload,
  Entity,
  FirmUserOption,
  GSTRegistration,
  UpdateClientPayload,
} from '../types/client';

export const clientsApi = {
  list: (params: ClientListParams = {}): Promise<ClientListResponse> => {
    return apiClient<ClientListResponse>('/clients/', {
      params: {
        page: params.page ?? 1,
        page_size: params.page_size ?? 25,
        search: params.search || undefined,
        status: params.status || undefined,
        client_type: params.client_type || undefined,
        assigned_user_id: params.assigned_user_id || undefined,
        gst_status: params.gst_status || undefined,
      },
    });
  },

  get: (clientId: string): Promise<Client> => {
    return apiClient<Client>(`/clients/${clientId}/`);
  },

  get360: (clientId: string): Promise<Client360> => {
    return apiClient<Client360>(`/clients/${clientId}/360/`);
  },

  create: (payload: CreateClientPayload): Promise<Client> => {
    return apiClient<Client>('/clients/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update: (clientId: string, payload: UpdateClientPayload): Promise<Client> => {
    return apiClient<Client>(`/clients/${clientId}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deactivate: (clientId: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(`/clients/${clientId}/`, {
      method: 'DELETE',
    });
  },

  // Contacts
  listContacts: (clientId: string): Promise<ClientContact[]> => {
    return apiClient<ClientContact[]>(`/clients/${clientId}/contacts/`);
  },

  addContact: (clientId: string, payload: CreateContactPayload): Promise<ClientContact> => {
    return apiClient<ClientContact>(`/clients/${clientId}/contacts/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteContact: (clientId: string, contactId: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(`/clients/${clientId}/contacts/${contactId}/`, {
      method: 'DELETE',
    });
  },

  // Entities
  listEntities: (clientId: string): Promise<Entity[]> => {
    return apiClient<Entity[]>('/entities/', {
      params: { client_id: clientId },
    });
  },

  createEntity: (payload: CreateEntityPayload): Promise<Entity> => {
    return apiClient<Entity>('/entities/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // GST Registrations
  listGSTRegistrations: (clientId: string): Promise<GSTRegistration[]> => {
    return apiClient<GSTRegistration[]>('/gst-registrations/', {
      params: { client_id: clientId },
    });
  },

  createGSTRegistration: (payload: CreateGSTRegistrationPayload): Promise<GSTRegistration> => {
    return apiClient<GSTRegistration>('/gst-registrations/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export const usersApi = {
  list: (): Promise<{ items?: FirmUserOption[] } | FirmUserOption[]> => {
    return apiClient<{ items?: FirmUserOption[] } | FirmUserOption[]>('/users/');
  },
};
