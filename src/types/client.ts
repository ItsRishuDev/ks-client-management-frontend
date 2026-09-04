export type ClientType =
  | 'INDIVIDUAL'
  | 'PROPRIETORSHIP'
  | 'PARTNERSHIP_FIRM'
  | 'LLP'
  | 'PRIVATE_LIMITED'
  | 'PUBLIC_LIMITED'
  | 'HUF'
  | 'TRUST'
  | 'SOCIETY'
  | 'OTHER';

export type ClientStatus = 'ACTIVE' | 'INACTIVE';
export type EntityStatus = 'ACTIVE' | 'INACTIVE';
export type GSTRegistrationStatus = 'ACTIVE' | 'CANCELLED' | 'SUSPENDED' | 'INACTIVE';
export type TaxpayerType = 'REGULAR' | 'COMPOSITION' | 'SEZ' | 'ISD' | 'NON_RESIDENT' | 'OTHER';

export interface Client {
  id: string;
  firm?: string;
  client_code: string;
  client_type: ClientType;
  legal_name: string;
  display_name: string;
  pan: string;
  tan: string;
  primary_email: string;
  primary_phone: string;
  address: string;
  assigned_user?: string | null;
  assigned_user_name?: string;
  relationship_manager?: string | null;
  relationship_manager_name?: string;
  primary_financial_year: string;
  status: ClientStatus;
  notes: string;
  gstin_count: number;
  created_at: string;
  updated_at: string;
}

export interface ClientContact {
  id: string;
  client?: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  whatsapp_number: string;
  is_primary: boolean;
  contact_preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface GSTRegistration {
  id: string;
  firm?: string;
  client?: string;
  entity?: string;
  gstin: string;
  state_code: string;
  state_name: string;
  legal_name: string;
  trade_name: string;
  registration_date?: string | null;
  taxpayer_type: TaxpayerType;
  registration_status: GSTRegistrationStatus;
  assigned_user?: string | null;
  assigned_user_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Entity {
  id: string;
  firm?: string;
  client?: string;
  entity_type: ClientType;
  legal_name: string;
  trade_name: string;
  pan: string;
  tan: string;
  address: string;
  established_date?: string | null;
  status: EntityStatus;
  notes: string;
  gst_registrations?: GSTRegistration[];
  created_at: string;
  updated_at: string;
}

export interface Client360 {
  client: Client;
  contacts: ClientContact[];
  entities: Entity[];
  gst_registrations: GSTRegistration[];
  compliance: Record<string, unknown>[];
  documents: Record<string, unknown>;
  services: Record<string, unknown>[];
  tasks: Record<string, unknown>[];
  billing: {
    total_invoiced: string;
    total_collected: string;
    outstanding: string;
  };
}

export interface ClientListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  client_type?: string;
  assigned_user_id?: string;
  gst_status?: string;
}

export interface ClientListResponse {
  items: Client[];
  page: number;
  page_size: number;
  total: number;
}

export interface CreateClientPayload {
  client_code: string;
  client_type: ClientType;
  legal_name: string;
  display_name?: string;
  pan?: string;
  tan?: string;
  primary_email?: string;
  primary_phone?: string;
  address?: string;
  assigned_user?: string | null;
  relationship_manager?: string | null;
  primary_financial_year?: string;
  status?: ClientStatus;
  notes?: string;
}

export type UpdateClientPayload = Partial<CreateClientPayload>;

export interface CreateContactPayload {
  name: string;
  designation?: string;
  email?: string;
  phone?: string;
  whatsapp_number?: string;
  is_primary?: boolean;
}

export interface CreateEntityPayload {
  client_id: string;
  entity_type: ClientType;
  legal_name: string;
  trade_name?: string;
  pan?: string;
  tan?: string;
  address?: string;
  established_date?: string | null;
  status?: EntityStatus;
  notes?: string;
}

export interface CreateGSTRegistrationPayload {
  entity_id: string;
  gstin: string;
  state_code: string;
  state_name: string;
  legal_name: string;
  trade_name?: string;
  taxpayer_type?: TaxpayerType;
  registration_status?: GSTRegistrationStatus;
  registration_date?: string | null;
  assigned_user?: string | null;
}

export interface FirmUserOption {
  id: string;
  name: string;
  email: string;
  role: string;
}
