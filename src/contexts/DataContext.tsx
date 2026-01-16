import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Asset, License, Category, DashboardConfig } from '@/types';
import { useAssets } from '@/hooks/useAssets';
import { useLicenses } from '@/hooks/useLicenses';
import { useCategories } from '@/hooks/useCategories';

interface DataContextType {
  // Assets
  assets: Asset[];
  assetsLoading: boolean;
  addAsset: (asset: Omit<Asset, 'id' | 'dataCriacao' | 'dataAtualizacao'>) => Promise<Asset | null>;
  updateAsset: (id: string, asset: Partial<Asset>) => Promise<boolean>;
  deleteAsset: (id: string) => Promise<boolean>;
  getAssetById: (id: string) => Asset | undefined;
  
  // Licenses
  licenses: License[];
  licensesLoading: boolean;
  addLicense: (license: Omit<License, 'id' | 'dataCriacao' | 'dataAtualizacao'>) => Promise<License | null>;
  updateLicense: (id: string, license: Partial<License>) => Promise<boolean>;
  deleteLicense: (id: string) => Promise<boolean>;
  getLicenseById: (id: string) => License | undefined;
  
  // Categories (using Supabase)
  categories: Category[];
  categoriesLoading: boolean;
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category | null>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  
  // Dashboard
  dashboardConfig: DashboardConfig;
  updateDashboardConfig: (config: DashboardConfig) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  dashboard: 'ti-dashboard-config',
};

const defaultDashboardConfig: DashboardConfig = {
  widgets: [
    { id: 'kpis', title: 'KPIs', visible: true, order: 0 },
    { id: 'chart', title: 'Gráfico de Categorias', visible: true, order: 1 },
    { id: 'licenses', title: 'Licenças Vencendo', visible: true, order: 2 },
    { id: 'maintenance', title: 'Manutenções Pendentes', visible: true, order: 3 },
  ],
};

export function DataProvider({ children }: { children: ReactNode }) {
  // Use Supabase hooks for assets and licenses
  const { 
    assets, 
    loading: assetsLoading, 
    addAsset, 
    updateAsset, 
    deleteAsset, 
    getAssetById 
  } = useAssets();
  
  const { 
    licenses, 
    loading: licensesLoading, 
    addLicense, 
    updateLicense, 
    deleteLicense,
    getLicenseById 
  } = useLicenses();

  // Use Supabase hook for categories
  const {
    categories,
    loading: categoriesLoading,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  // Keep dashboard config in localStorage (user preferences only)
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>(defaultDashboardConfig);

  // Load dashboard from localStorage
  useEffect(() => {
    const storedDashboard = localStorage.getItem(STORAGE_KEYS.dashboard);
    setDashboardConfig(storedDashboard ? JSON.parse(storedDashboard) : defaultDashboardConfig);
  }, []);

  // Persist dashboard config to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.dashboard, JSON.stringify(dashboardConfig));
  }, [dashboardConfig]);

  // Dashboard config
  const updateDashboardConfig = (config: DashboardConfig) => {
    setDashboardConfig(config);
  };

  // Get license by id wrapper for backward compatibility
  const getLicenseByIdWrapper = (id: string): License | undefined => {
    return licenses.find(license => license.id === id);
  };

  return (
    <DataContext.Provider value={{
      assets,
      assetsLoading,
      addAsset,
      updateAsset,
      deleteAsset,
      getAssetById,
      licenses,
      licensesLoading,
      addLicense,
      updateLicense,
      deleteLicense,
      getLicenseById: getLicenseByIdWrapper,
      categories,
      categoriesLoading,
      addCategory,
      updateCategory,
      deleteCategory,
      dashboardConfig,
      updateDashboardConfig,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
