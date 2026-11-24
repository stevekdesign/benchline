// App-wide specimen state: base data + any callbacks logged in this browser.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { baseSpecimens } from './data';
import {
  applyCallbacks,
  clearCallbacks,
  loadCallbacks,
  newCallback,
  saveCallbacks,
  type LoggedCallbacks,
} from './callbacks';
import type { Nurse, Specimen } from './types';

interface SpecimensValue {
  specimens: Specimen[];
  getSpecimen: (orderId: string) => Specimen | undefined;
  logCallback: (orderId: string, nurse: Nurse) => void;
  resetDemo: () => void;
}

const SpecimensContext = createContext<SpecimensValue | null>(null);

export function SpecimensProvider({ children }: { children: ReactNode }) {
  const [logged, setLogged] = useState<LoggedCallbacks>(loadCallbacks);

  const logCallback = useCallback((orderId: string, nurse: Nurse) => {
    setLogged((prev) => {
      const next = { ...prev, [orderId]: newCallback(nurse) };
      saveCallbacks(next);
      return next;
    });
  }, []);

  const resetDemo = useCallback(() => {
    clearCallbacks();
    setLogged({});
  }, []);

  const value = useMemo<SpecimensValue>(() => {
    const specimens = applyCallbacks(baseSpecimens, logged);
    return {
      specimens,
      getSpecimen: (orderId) => specimens.find((s) => s.orderId === orderId),
      logCallback,
      resetDemo,
    };
  }, [logged, logCallback, resetDemo]);

  return <SpecimensContext.Provider value={value}>{children}</SpecimensContext.Provider>;
}

export function useSpecimens(): SpecimensValue {
  const value = useContext(SpecimensContext);
  if (!value) throw new Error('useSpecimens must be used inside <SpecimensProvider>');
  return value;
}
