'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PermissionChecks, Role, userHasPermission } from '@/lib/permissions';

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
  canCreateInvoices: boolean;
  canEditInvoices: boolean;
  canDeleteInvoices: boolean;
  canViewInvoices: boolean;
  canCreatePayments: boolean;
  canEditPayments: boolean;
  canDeletePayments: boolean;
  canViewPayments: boolean;
  setUser: (user: User | null) => void;
}

const PermissionsContext = createContext<PermissionsContextType | null>(null);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    // Load user from localStorage or fetch from API
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4005/api/v1';
          const response = await fetch(`${apiUrl}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setUserRoles(userData.roles || []);
          } else {
            // Token might be expired
            localStorage.removeItem('token');
            setUser(null);
            setUserRoles([]);
          }
        } catch (error) {
          console.error('Error loading user:', error);
          setUser(null);
          setUserRoles([]);
        }
      }
    };

    loadUser();
  }, []);

  const hasPermission = (resource: string, action: string): boolean => {
    return userHasPermission(userRoles, resource, action);
  };

  const hasRole = (roles: Role[]): boolean => {
    return userRoles.some(role => roles.includes(role as Role));
  };

  const value: PermissionsContextType = {
    user,
    userRoles,
    hasPermission,
    hasRole,
    canCreateClients: PermissionChecks.canCreateClients(userRoles),
    canEditClients: PermissionChecks.canEditClients(userRoles),
    canDeleteClients: PermissionChecks.canDeleteClients(userRoles),
    canViewClients: PermissionChecks.canViewClients(userRoles),
    canCreateCases: PermissionChecks.canCreateCases(userRoles),
    canEditCases: PermissionChecks.canEditCases(userRoles),
    canDeleteCases: PermissionChecks.canDeleteCases(userRoles),
    canViewCases: PermissionChecks.canViewCases(userRoles),
    canUploadDocuments: PermissionChecks.canUploadDocuments(userRoles),
    canEditDocuments: PermissionChecks.canEditDocuments(userRoles),
    canDeleteDocuments: PermissionChecks.canDeleteDocuments(userRoles),
    canViewDocuments: PermissionChecks.canViewDocuments(userRoles),
    canCreateAppointments: PermissionChecks.canCreateAppointments(userRoles),
    canEditAppointments: PermissionChecks.canEditAppointments(userRoles),
    canDeleteAppointments: PermissionChecks.canDeleteAppointments(userRoles),
    canViewAppointments: PermissionChecks.canViewAppointments(userRoles),
    canManageCourts: PermissionChecks.canManageCourts(userRoles),
    canViewCourts: PermissionChecks.canViewCourts(userRoles),
    canManageUsers: PermissionChecks.canManageUsers(userRoles),
    canViewUsers: PermissionChecks.canViewUsers(userRoles),
    canManageSystem: PermissionChecks.canManageSystem(userRoles),
    canCreateInvoices: PermissionChecks.canCreateInvoices(userRoles),
    canEditInvoices: PermissionChecks.canEditInvoices(userRoles),
    canDeleteInvoices: PermissionChecks.canDeleteInvoices(userRoles),
    canViewInvoices: PermissionChecks.canViewInvoices(userRoles),
    canCreatePayments: PermissionChecks.canCreatePayments(userRoles),
    canEditPayments: PermissionChecks.canEditPayments(userRoles),
    canDeletePayments: PermissionChecks.canDeletePayments(userRoles),
    canViewPayments: PermissionChecks.canViewPayments(userRoles),
    setUser,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}
