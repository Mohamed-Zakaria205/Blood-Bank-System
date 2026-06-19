import { useState, useEffect } from 'react';

// ── Egypt location data shape ─────────────────────────────────
export interface EgyptArea {
  id: number;
  name_ar: string;
  name_en: string;
}

export interface EgyptCity {
  id: string;
  governorate_id: string;
  city_name_ar: string;
  city_name_en: string;
  areas: EgyptArea[];
}

export interface EgyptGovernorate {
  id: string;
  name_ar: string;
  cities: EgyptCity[];
}

let cachedEgyptData: EgyptGovernorate[] | null = null;

export function useEgyptData() {
  const [egyptData, setEgyptData] = useState<EgyptGovernorate[]>(cachedEgyptData || []);
  const [isLoadingEgyptData, setIsLoadingEgyptData] = useState(!cachedEgyptData);

  useEffect(() => {
    if (cachedEgyptData) {
      return;
    }
    let active = true;
    import('../data/egypt').then((m) => {
      if (active) {
        cachedEgyptData = m.EGYPT_DATA as unknown as EgyptGovernorate[];
        setEgyptData(m.EGYPT_DATA as unknown as EgyptGovernorate[]);
        setIsLoadingEgyptData(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return { egyptData, isLoadingEgyptData };
}
