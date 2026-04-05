"use client";

import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { FeatureBuilder } from './FeatureBuilder';
import { RouteSheet } from './RouteSheet';
import { usePartStore } from '@/store/usePartStore';

export function Dashboard() {
  const { loadFromBase64 } = usePartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const stateB64 = params.get('state');
    if (stateB64) {
      loadFromBase64(stateB64);
      // clean URL to look nice
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [loadFromBase64]);

  if (!mounted) return null;

  return (
    <div className="flex h-screen w-full bg-[#0d0f12] overflow-hidden text-slate-200">
      <Sidebar />
      <FeatureBuilder />
      <RouteSheet />
    </div>
  );
}
