// API Client for Legal Manager
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface Case {
  id: string;
  client: {
    id: string;
    first_name: string;
    last_name: string;
  };
  court?: {
    id: string;
    name: string;
  } | null;
  assigned_lawyer: {
    id: string;
    display_name: string;
  };
  case_number: string;
  title: string;
  description?: string | null;
  status: CaseStatus;
  type: CaseType;
  filing_date?: string | null;
  hearing_date?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export enum CaseStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  PENDING = 'pending',
  ON_HOLD = 'on_hold'
}

export enum CaseType {
  CIVIL = 'civil',
  CRIMINAL = 'criminal',
  FAMILY = 'family',
  CORPORATE = 'corporate',
  REAL_ESTATE = 'real_estate',
  OTHER = 'other'
}

export interface CreateCaseDto {
  clientId: string;
  courtId?: string | undefined;
  assignedLawyerId: string;
  case_number: string;
  title: string;
  description?: string;
  status?: CaseStatus;
  type?: CaseType;
  filing_date?: string | null;
  hearing_date?: string | null;
  notes?: string;
  is_active?: boolean;
}

export interface UpdateCaseDto extends Partial<CreateCaseDto> {}

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateClientDto {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  notes?: string;
  is_active?: boolean;
}

export interface UpdateClientDto extends Partial<CreateClientDto> {}

export interface Court {
  id: string;
  name: string;
  address?: string;
}

export interface User {
  id: string;
  display_name: string;
  email: string;
}

// Billing interfaces
export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  PARTIALLY_PAID = 'partially_paid'
}

export enum PaymentMethod {
  CASH = 'cash',
  CHECK = 'check',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  ONLINE_PAYMENT = 'online_payment',
  OTHER = 'other'
}

export enum ItemType {
  SERVICE = 'service',
  EXPENSE = 'expense',
  DISBURSEMENT = 'disbursement',
  FEE = 'fee',
  OTHER = 'other'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export interface InvoiceItem {
  id: string;
  description: string;
  type: ItemType;
  quantity: number;
  unit_price: number;
  total_amount: number;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  client: {
    id: string;
    first_name: string;
    last_name: string;
  };
  case?: {
    id: string;
    case_number: string;
    title: string;
  } | null;
  created_by: {
    id: string;
    display_name: string;
  };
  invoice_number: string;
  title: string;
  description?: string | null;
  status: InvoiceStatus;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  issue_date: string;
  due_date: string;
  paid_date?: string | null;
  payment_method?: PaymentMethod | null;
  payment_reference?: string | null;
  notes?: string | null;
  terms_and_conditions?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  items: InvoiceItem[];
}

export interface CreateInvoiceItemDto {
  description: string;
  type: ItemType;
  quantity: number;
  unit_price: number;
  notes?: string;
}

export interface CreateInvoiceDto {
  caseId?: string;
  clientId: string;
  title: string;
  description?: string;
  status?: InvoiceStatus;
  tax_amount?: number;
  discount_amount?: number;
  issue_date: string;
  due_date: string;
  payment_method?: PaymentMethod;
  payment_reference?: string;
  notes?: string;
  terms_and_conditions?: string;
  items: CreateInvoiceItemDto[];
}

export interface UpdateInvoiceDto extends Partial<CreateInvoiceDto> {}

export interface Payment {
  id: string;
  invoice: {
    id: string;
    invoice_number: string;
    title: string;
  };
  client: {
    id: string;
    first_name: string;
    last_name: string;
  };
  processed_by?: {
    id: string;
    display_name: string;
  } | null;
  payment_number: string;
  amount: number;
  status: PaymentStatus;
  payment_method: string;
  reference_number?: string | null;
  transaction_id?: string | null;
  payment_date: string;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentDto {
  invoiceId: string;
  amount: number;
  status?: PaymentStatus;
  payment_method: string;
  reference_number?: string;
  transaction_id?: string;
  payment_date: string;
  notes?: string;
}

export enum DocumentType {
  CONTRACT = 'contract',
  EVIDENCE = 'evidence',
  COURT_FILING = 'court_filing',
  CORRESPONDENCE = 'correspondence',
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  OTHER = 'other'
}

export interface Document {
  id: string;
  title: string;
  description?: string | null;
  filename: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  type: DocumentType;
  tags?: string[] | null;
  case?: Case | null;
  client?: Client | null;
  uploaded_by: User;
  created_at: string;
  updated_at: string;
}

export interface UploadDocumentData {
  title: string;
  description?: string;
  type: DocumentType;
  caseId?: string;
  clientId?: string;
  tags?: string[];
  file: File;
}

export interface UpdateDocumentData {
  title?: string;
  description?: string;
  type?: DocumentType;
  tags?: string[];
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4005/api/v1';
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    console.log('API Request:', `${this.baseURL}${endpoint}`, 'Token:', token ? 'Present' : 'Missing');
    
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers: HeadersInit = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    };

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      console.log('API Response:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Success Response:', data);
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Cases API
  async getCases(): Promise<Case[]> {
    return this.request<Case[]>('/cases');
  }

  async getCaseById(id: string): Promise<Case> {
    return this.request<Case>(`/cases/${id}`);
  }

  async getCasesByStatus(status: CaseStatus): Promise<Case[]> {
    return this.request<Case[]>(`/cases/status/${status}`);
  }

  async getCasesByType(type: CaseType): Promise<Case[]> {
    return this.request<Case[]>(`/cases/type/${type}`);
  }

  async getCasesByLawyer(lawyerId: string): Promise<Case[]> {
    return this.request<Case[]>(`/cases/lawyer/${lawyerId}`);
  }

  async createCase(caseData: CreateCaseDto): Promise<Case> {
    return this.request<Case>('/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    });
  }

  async updateCase(id: string, caseData: UpdateCaseDto): Promise<Case> {
    return this.request<Case>(`/cases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(caseData),
    });
  }

  async deleteCase(id: string): Promise<void> {
    return this.request<void>(`/cases/${id}`, {
      method: 'DELETE',
    });
  }

  // Clients API
  async getClients(): Promise<Client[]> {
    console.log('API Client: Fetching clients from', `${this.baseURL}/clients`);
    const result = await this.request<Client[]>('/clients');
    console.log('API Client: Clients result', result);
    return result;
  }

  async getClientById(id: string): Promise<Client> {
    return this.request<Client>(`/clients/${id}`);
  }

  async createClient(clientData: CreateClientDto): Promise<Client> {
    return this.request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(id: string, clientData: UpdateClientDto): Promise<Client> {
    return this.request<Client>(`/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(clientData),
    });
  }

  async deleteClient(id: string): Promise<void> {
    return this.request<void>(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Courts API
  async getCourts(): Promise<Court[]> {
    return this.request<Court[]>('/courts');
  }

  // Users API
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  // Documents API
  async getDocuments(filters?: {
    search?: string;
    type?: DocumentType;
    caseId?: string;
    clientId?: string;
    tags?: string[];
  }): Promise<Document[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));
    
    const queryString = params.toString();
    const endpoint = queryString ? `/documents?${queryString}` : '/documents';
    return this.request<Document[]>(endpoint);
  }

  async getDocumentById(id: string): Promise<Document> {
    return this.request<Document>(`/documents/${id}`);
  }

  async getDocumentsByCase(caseId: string): Promise<Document[]> {
    return this.request<Document[]>(`/documents/case/${caseId}`);
  }

  async getDocumentsByClient(clientId: string): Promise<Document[]> {
    return this.request<Document[]>(`/documents/client/${clientId}`);
  }

  async getDocumentsByType(type: DocumentType): Promise<Document[]> {
    return this.request<Document[]>(`/documents/type/${type}`);
  }

  async uploadDocument(data: UploadDocumentData): Promise<Document> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('type', data.type);
    if (data.caseId) formData.append('caseId', data.caseId);
    if (data.clientId) formData.append('clientId', data.clientId);
    if (data.tags) {
      data.tags.forEach(tag => formData.append('tags[]', tag));
    }

    return this.request<Document>('/documents/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async updateDocument(id: string, data: UpdateDocumentData): Promise<Document> {
    return this.request<Document>(`/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDocument(id: string): Promise<void> {
    return this.request<void>(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async downloadDocument(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/documents/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.blob();
  }

  async getDocumentDownloadUrl(id: string): Promise<string> {
    const result = await this.request<{ downloadUrl: string }>(`/documents/${id}/url`);
    return result.downloadUrl;
  }

  // Billing API
  async getInvoices(filters?: {
    search?: string;
    clientId?: string;
    caseId?: string;
    status?: InvoiceStatus;
  }): Promise<Invoice[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/billing/invoices?${queryString}` : '/billing/invoices';
    return this.request<Invoice[]>(endpoint);
  }

  async getInvoiceById(id: string): Promise<Invoice> {
    return this.request<Invoice>(`/billing/invoices/${id}`);
  }

  async createInvoice(data: CreateInvoiceDto): Promise<Invoice> {
    return this.request<Invoice>('/billing/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInvoice(id: string, data: UpdateInvoiceDto): Promise<Invoice> {
    return this.request<Invoice>(`/billing/invoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteInvoice(id: string): Promise<void> {
    return this.request<void>(`/billing/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  async getPayments(filters?: {
    invoiceId?: string;
    clientId?: string;
    status?: PaymentStatus;
  }): Promise<Payment[]> {
    const params = new URLSearchParams();
    if (filters?.invoiceId) params.append('invoiceId', filters.invoiceId);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/billing/payments?${queryString}` : '/billing/payments';
    return this.request<Payment[]>(endpoint);
  }

  async getPaymentById(id: string): Promise<Payment> {
    return this.request<Payment>(`/billing/payments/${id}`);
  }

  async createPayment(data: CreatePaymentDto): Promise<Payment> {
    return this.request<Payment>('/billing/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deletePayment(id: string): Promise<void> {
    return this.request<void>(`/billing/payments/${id}`, {
      method: 'DELETE',
    });
  }

}

export const apiClient = new ApiClient();
