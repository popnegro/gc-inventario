import { useState, useEffect, useCallback } from 'react';
import { InventoryItem, getDisponibilidad, Disponibilidad } from '../types';
import { fixedLocations as staticFixed, mobileRoutes as staticMobile } from '../data/inventory';
import { apiClient } from '../utils/apiClient';

function applyOverrides(rawItems: InventoryItem[]): InventoryItem[] {
  try {
    const saved = localStorage.getItem('gc_admin_status_overrides');
    const overrides: Record<string, any> = saved ? JSON.parse(saved) : {};
    
    const seen = new Set<string>();
    const uniqueItems: InventoryItem[] = [];
    
    for (const it of rawItems) {
      if (!it.canonical_id || seen.has(it.canonical_id)) {
        continue;
      }
      seen.add(it.canonical_id);
      
      if (overrides[it.canonical_id]) {
        uniqueItems.push({ ...it, disponibilidad: overrides[it.canonical_id] });
      } else {
        uniqueItems.push(it);
      }
    }
    
    return uniqueItems;
  } catch {
    const seen = new Set<string>();
    return rawItems.filter((it) => {
      if (!it.canonical_id || seen.has(it.canonical_id)) return false;
      seen.add(it.canonical_id);
      return true;
    });
  }
}

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>(() => {
    return applyOverrides([...staticFixed, ...staticMobile]);
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiClient.getInventory();
      if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
        // Keep localStorage overrides as dynamic overlay if any exist, but DB is source of truth
        const merged = applyOverrides(json.data);
        const publicItems = merged.filter(
          (item: InventoryItem) => getDisponibilidad(item) !== 'inactivo',
        );
        setItems(publicItems);
        return;
      }
      // Fallback
      const fallback = applyOverrides([...staticFixed, ...staticMobile]).filter(
        (item: InventoryItem) => getDisponibilidad(item) !== 'inactivo',
      );
      setItems(fallback);
    } catch (err: any) {
      console.warn('DB Fetch failed, fallback to static catalog:', err?.message || err);
      const fallback = applyOverrides([...staticFixed, ...staticMobile]).filter(
        (item: InventoryItem) => getDisponibilidad(item) !== 'inactivo',
      );
      setItems(fallback);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (canonicalId: string, newStatus: Disponibilidad) => {
    try {
      const res = await apiClient.updateSupportStatus(canonicalId, newStatus);
      
      if (res.status === 'success') {
        // Update local overrides as backup fallback
        try {
          const saved = localStorage.getItem('gc_admin_status_overrides');
          const current = saved ? JSON.parse(saved) : {};
          current[canonicalId] = newStatus;
          localStorage.setItem('gc_admin_status_overrides', JSON.stringify(current));
        } catch (e) {
          console.warn('Storage override write skipped:', e);
        }

        // Optimistically update React State
        setItems((prev) =>
          prev.map((it) => {
            if (it.canonical_id === canonicalId) {
              return { ...it, disponibilidad: newStatus };
            }
            return it;
          })
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to save status update to Neon DB via service layer:', err);
      return false;
    }
  }, []);

  const updateDetails = useCallback(async (canonicalId: string, updatedFields: any) => {
    try {
      const res = await apiClient.updateSupportDetails(canonicalId, updatedFields);
      if (res.status === 'success') {
        setItems((prev) =>
          prev.map((it) => {
            if (it.canonical_id === canonicalId) {
              return { ...it, ...updatedFields };
            }
            return it;
          })
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update support details:', err);
      // Fallback update on local state in static mode
      setItems((prev) =>
        prev.map((it) => {
          if (it.canonical_id === canonicalId) {
            return { ...it, ...updatedFields };
          }
          return it;
        })
      );
      return true;
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    items,
    fixedLocations: items.filter((item) => item.tipo_soporte !== 'led_movil') as any[],
    mobileRoutes: items.filter((item) => item.tipo_soporte === 'led_movil') as any[],
    loading,
    error,
    refetch: fetchInventory,
    updateStatus,
    updateDetails,
  };
}
