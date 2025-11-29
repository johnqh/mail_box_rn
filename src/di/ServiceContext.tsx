import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import {
  getStorageService,
  getNetworkService,
} from '@sudobility/di_rn';
import type { AppConfig } from '@sudobility/di';
import { getAppConfig } from './initializeServices';

interface ServiceContextValue {
  appConfig: AppConfig;
}

const ServiceContext = createContext<ServiceContextValue | null>(null);

interface ServiceProviderProps {
  children: ReactNode;
}

export function ServiceProvider({ children }: ServiceProviderProps) {
  const services = useMemo<ServiceContextValue>(() => ({
    appConfig: getAppConfig(),
  }), []);

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices(): ServiceContextValue {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
}

// Individual service hooks
export const useAppConfig = () => useServices().appConfig;
export const useStorageService = () => getStorageService();
export const useNetworkService = () => getNetworkService();
