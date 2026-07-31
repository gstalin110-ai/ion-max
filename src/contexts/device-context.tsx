"use client";

import { createContext, useContext, ReactNode } from "react";
import { useDeviceDetect, DeviceType } from "@/src/hooks/use-device-detect";

interface DeviceContextType {
  device: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const deviceDetect = useDeviceDetect();

  return (
    <DeviceContext.Provider value={deviceDetect}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error("useDevice must be used within a DeviceProvider");
  }
  return context;
}
