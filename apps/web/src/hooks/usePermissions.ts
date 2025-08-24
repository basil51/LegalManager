'use client';

import { useContext, createContext } from 'react';
import { PermissionChecks, Role } from '@/lib/permissions';

interface User {
  id: string;
  email: string;
  display_name: string;
  roles: string[];
}

interface PermissionsContextType {
  user: User | null;
  userRoles: string[];
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (roles: Role[]) => boolean;
  canCreateClients: boolean;
  canEditClients: boolean;
  canDeleteClients: boolean;
  canViewClients: boolean;
  canCreateCases: boolean;
  canEditCases: boolean;
  canDeleteCases: boolean;
  canViewCases: boolean;
  canUploadDocuments: boolean;
  canEditDocuments: boolean;
  canDeleteDocuments: boolean;
  canViewDocuments: boolean;
  canCreateAppointments: boolean;
  canEditAppointments: boolean;
  canDeleteAppointments: boolean;
  canViewAppointments: boolean;
  canManageCourts: boolean;
  canViewCourts: boolean;
  canManageUsers: boolean;
  canViewUsers: boolean;
  canManageSystem: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | null>(null);

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}

export function usePermissionsContext() {
  const context = useContext(PermissionsContext);
  return context;
}
