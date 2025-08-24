'use client';

import React, { ReactNode } from 'react';
import { usePermissions } from '@/contexts/PermissionsContext';

interface PermissionGuardProps {
  children: ReactNode;
  resource: string;
  action: string;
  fallback?: ReactNode;
}

export default function PermissionGuard({ 
  children, 
  resource, 
  action, 
  fallback = null 
}: PermissionGuardProps) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(resource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Specific permission guards for common use cases
export function CreateClientGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { canCreateClients } = usePermissions();
  return canCreateClients ? <>{children}</> : <>{fallback}</>;
}

export function EditClientGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { canEditClients } = usePermissions();
  return canEditClients ? <>{children}</> : <>{fallback}</>;
}

export function DeleteClientGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { canDeleteClients } = usePermissions();
  return canDeleteClients ? <>{children}</> : <>{fallback}</>;
}

export function CreateCaseGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { canCreateCases } = usePermissions();
  return canCreateCases ? <>{children}</> : <>{fallback}</>;
}

export function EditCaseGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { canEditCases } = usePermissions();
  return canEditCases ? <>{children}</> : <>{fallback}</>;
}

export function DeleteCaseGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { canDeleteCases } = usePermissions();
  return canDeleteCases ? <>{children}</> : <>{fallback}</>;
}

export function UploadDocumentGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { canUploadDocuments } = usePermissions();
  return canUploadDocuments ? <>{children}</> : <>{fallback}</>;
}

export function DeleteDocumentGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { canDeleteDocuments } = usePermissions();
  return canDeleteDocuments ? <>{children}</> : <>{fallback}</>;
}

export function CreateAppointmentGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { canCreateAppointments } = usePermissions();
  return canCreateAppointments ? <>{children}</> : <>{fallback}</>;
}

export function EditAppointmentGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { canEditAppointments } = usePermissions();
  return canEditAppointments ? <>{children}</> : <>{fallback}</>;
}

export function DeleteAppointmentGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { canDeleteAppointments } = usePermissions();
  return canDeleteAppointments ? <>{children}</> : <>{fallback}</>;
}

export function AdminGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { hasRole } = usePermissions();
  return hasRole(['admin']) ? <>{children}</> : <>{fallback}</>;
}

export function LawyerGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { hasRole } = usePermissions();
  return hasRole(['admin', 'lawyer']) ? <>{children}</> : <>{fallback}</>;
}
