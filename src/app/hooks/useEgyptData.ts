import { useState, useEffect } from 'react';

let cachedEgyptData: any[] | null = null;

export function useEgyptData() {
  const [egyptData, setEgyptData] = useState<any[]>(cachedEgyptData || []);
  const [isLoadingEgyptData, setIsLoadingEgyptData] = useState(!cachedEgyptData);

  useEffect(() => {
    if (cachedEgyptData) {
      return;
    }
    let active = true;
    import('../data/egypt').then((m) => {
      if (active) {
        cachedEgyptData = m.EGYPT_DATA as any;
        setEgyptData(m.EGYPT_DATA as any);
        setIsLoadingEgyptData(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return { egyptData, isLoadingEgyptData };
}
