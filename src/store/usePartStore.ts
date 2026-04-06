import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PartFeature } from '@/lib/capp-logic';

interface PartState {
  partName: string;
  material: string;
  includeLifecycle: boolean;
  dimensions: { x: number; y: number; z: number };
  features: PartFeature[];
  isLoading: boolean;
  setPartName: (partName: string) => void;
  setMaterial: (material: string) => void;
  setIncludeLifecycle: (include: boolean) => void;
  setDimensions: (dim: { x: number; y: number; z: number }) => void;
  addFeature: (feature: PartFeature) => void;
  removeFeature: (id: string) => void;
  updateFeature: (id: string, updates: Partial<PartFeature>) => void;
  setFeatures: (features: PartFeature[]) => void;
  applyTemplate: (template: any) => void;
  setIsLoading: (isLoading: boolean) => void;
  loadFromBase64: (b64: string) => void;
  getBase64: () => string;
}

export const usePartStore = create<PartState>()(
  persist(
    (set, get) => ({
      partName: 'Unnamed Part',
      material: 'Aluminum 6061',
      includeLifecycle: false,
      dimensions: { x: 100, y: 100, z: 50 },
      features: [],
      isLoading: false,
      setPartName: (partName) => set({ partName }),
      setMaterial: (material) => set({ material }),
      setIncludeLifecycle: (includeLifecycle) => set({ includeLifecycle }),
      setDimensions: (dimensions) => set({ dimensions }),
      addFeature: (feature) => set((state) => ({ features: [...state.features, feature] })),
      removeFeature: (id) => set((state) => ({ features: state.features.filter(f => f.id !== id) })),
      updateFeature: (id, updates) => set((state) => ({
        features: state.features.map(f => f.id === id ? { ...f, ...updates } : f)
      })),
      setFeatures: (features) => set({ features }),
      applyTemplate: (template) => set({
        partName: template.familyName,
        material: template.defaultMaterial,
        features: template.standardFeatures
      }),
      setIsLoading: (isLoading) => set({ isLoading }),
      loadFromBase64: (b64) => {
        try {
          const json = atob(b64);
          const data = JSON.parse(json);
          set({
            partName: data.partName || 'Unnamed Part',
            material: data.material || 'Aluminum 6061',
            includeLifecycle: data.includeLifecycle || false,
            dimensions: data.dimensions || { x: 100, y: 100, z: 50 },
            features: data.features || []
          });
        } catch (e) {
          console.error("Failed to parse base64 state", e);
        }
      },
      getBase64: () => {
        const state = get();
        const data = {
          partName: state.partName,
          material: state.material,
          includeLifecycle: state.includeLifecycle,
          dimensions: state.dimensions,
          features: state.features
        };
        return btoa(JSON.stringify(data));
      }
    }),
    {
      name: 'capp-part-storage',
    }
  )
);
