export type Role = 'admin' | 'lawyer' | 'assistant' | 'client';

export interface Permission {
  resource: string;
  actions: string[];
}

export interface RolePermissions {
  role: Role;
  permissions: Permission[];
}

// Define permissions for each role
export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'admin',
    permissions: [
      { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'clients', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'cases', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'courts', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'documents', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'appointments', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'sessions', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'invoices', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'payments', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'system', actions: ['manage'] },
    ],
  },
  {
    role: 'lawyer',
    permissions: [
      { resource: 'clients', actions: ['create', 'read', 'update'] },
      { resource: 'cases', actions: ['create', 'read', 'update'] },
      { resource: 'courts', actions: ['read'] },
      { resource: 'documents', actions: ['create', 'read', 'update'] },
      { resource: 'appointments', actions: ['create', 'read', 'update'] },
      { resource: 'sessions', actions: ['create', 'read', 'update'] },
      { resource: 'invoices', actions: ['create', 'read', 'update'] },
      { resource: 'payments', actions: ['create', 'read', 'update'] },
    ],
  },
  {
    role: 'assistant',
    permissions: [
      { resource: 'clients', actions: ['read', 'update'] },
      { resource: 'cases', actions: ['read', 'update'] },
      { resource: 'courts', actions: ['read'] },
      { resource: 'documents', actions: ['create', 'read'] },
      { resource: 'appointments', actions: ['create', 'read', 'update'] },
      { resource: 'sessions', actions: ['read', 'update'] },
      { resource: 'invoices', actions: ['read'] },
      { resource: 'payments', actions: ['read'] },
    ],
  },
  {
    role: 'client',
    permissions: [
      { resource: 'cases', actions: ['read'] },
      { resource: 'documents', actions: ['read'] },
      { resource: 'appointments', actions: ['read'] },
      { resource: 'invoices', actions: ['read'] },
      { resource: 'payments', actions: ['read'] },
    ],
  },
];

// Helper function to get permissions for a role
export function getRolePermissions(role: Role): Permission[] {
  const roleConfig = ROLE_PERMISSIONS.find(r => r.role === role);
  return roleConfig?.permissions || [];
}

// Helper function to check if a role has permission for a specific action
export function hasPermission(role: Role, resource: string, action: string): boolean {
  const permissions = getRolePermissions(role);
  const resourcePermission = permissions.find(p => p.resource === resource);
  return resourcePermission?.actions.includes(action) || false;
}

// Helper function to check if user has any of the specified roles
export function hasRole(userRoles: string[], roles: Role[]): boolean {
  return userRoles.some(role => roles.includes(role as Role));
}

// Helper function to check if user has permission for a specific action
export function userHasPermission(userRoles: string[], resource: string, action: string): boolean {
  return userRoles.some(role => hasPermission(role as Role, resource, action));
}

// Common permission checks
export const PermissionChecks = {
  // User management
  canManageUsers: (userRoles: string[]) => userHasPermission(userRoles, 'users', 'create'),
  canViewUsers: (userRoles: string[]) => userHasPermission(userRoles, 'users', 'read'),
  
  // Client management
  canCreateClients: (userRoles: string[]) => userHasPermission(userRoles, 'clients', 'create'),
  canEditClients: (userRoles: string[]) => userHasPermission(userRoles, 'clients', 'update'),
  canDeleteClients: (userRoles: string[]) => userHasPermission(userRoles, 'clients', 'delete'),
  canViewClients: (userRoles: string[]) => userHasPermission(userRoles, 'clients', 'read'),
  
  // Case management
  canCreateCases: (userRoles: string[]) => userHasPermission(userRoles, 'cases', 'create'),
  canEditCases: (userRoles: string[]) => userHasPermission(userRoles, 'cases', 'update'),
  canDeleteCases: (userRoles: string[]) => userHasPermission(userRoles, 'cases', 'delete'),
  canViewCases: (userRoles: string[]) => userHasPermission(userRoles, 'cases', 'read'),
  
  // Document management
  canUploadDocuments: (userRoles: string[]) => userHasPermission(userRoles, 'documents', 'create'),
  canEditDocuments: (userRoles: string[]) => userHasPermission(userRoles, 'documents', 'update'),
  canDeleteDocuments: (userRoles: string[]) => userHasPermission(userRoles, 'documents', 'delete'),
  canViewDocuments: (userRoles: string[]) => userHasPermission(userRoles, 'documents', 'read'),
  
  // Appointment management
  canCreateAppointments: (userRoles: string[]) => userHasPermission(userRoles, 'appointments', 'create'),
  canEditAppointments: (userRoles: string[]) => userHasPermission(userRoles, 'appointments', 'update'),
  canDeleteAppointments: (userRoles: string[]) => userHasPermission(userRoles, 'appointments', 'delete'),
  canViewAppointments: (userRoles: string[]) => userHasPermission(userRoles, 'appointments', 'read'),
  
  // Court management
  canManageCourts: (userRoles: string[]) => userHasPermission(userRoles, 'courts', 'create'),
  canViewCourts: (userRoles: string[]) => userHasPermission(userRoles, 'courts', 'read'),
  
  // System management
  canManageSystem: (userRoles: string[]) => userHasPermission(userRoles, 'system', 'manage'),
  
  // Invoice management
  canCreateInvoices: (userRoles: string[]) => userHasPermission(userRoles, 'invoices', 'create'),
  canEditInvoices: (userRoles: string[]) => userHasPermission(userRoles, 'invoices', 'update'),
  canDeleteInvoices: (userRoles: string[]) => userHasPermission(userRoles, 'invoices', 'delete'),
  canViewInvoices: (userRoles: string[]) => userHasPermission(userRoles, 'invoices', 'read'),
  
  // Payment management
  canCreatePayments: (userRoles: string[]) => userHasPermission(userRoles, 'payments', 'create'),
  canEditPayments: (userRoles: string[]) => userHasPermission(userRoles, 'payments', 'update'),
  canDeletePayments: (userRoles: string[]) => userHasPermission(userRoles, 'payments', 'delete'),
  canViewPayments: (userRoles: string[]) => userHasPermission(userRoles, 'payments', 'read'),
};
