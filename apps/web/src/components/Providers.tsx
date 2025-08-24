'use client';

import { ToastProvider } from '@/contexts/ToastContext';
import { PermissionsProvider } from '@/contexts/PermissionsContext';
import ToastContainer from './ToastContainer';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PermissionsProvider>
      <ToastProvider>
        {children}
        <ToastContainer />
      </ToastProvider>
    </PermissionsProvider>
  );
}
