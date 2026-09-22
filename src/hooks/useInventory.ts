import { useState, useEffect, useCallback } from 'react';
import { InventoryItem, getDisponibilidad, Disponibilidad } from '../types';
import { apiClient } from '../utils/apiClient';

function normalizeItems(rawItems: InventoryItem[]): InventoryItem[] {
  const seen = new Set<string>();
  return rawItems.filter((item) => {
    if (!item.canonical_id || seen.has(item.canonical_id)) return false;
    seen.add(item.canonical_id);
    return true;
  });
}

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiClient.getInventory();
      if (json.status !== 'success' || !Array.isArray(json.data)) {
        throw new Error('La API devolvió un inventario inválido.');
      }

      const publicItems = normalizeItems(json.data).filter(
        (item: InventoryItem) => getDisponibilidad(item) !== 'inactivo',
      );
      setItems(publicItems);
    } catch (err: any) {
      const message = err?.message || 'No se pudo cargar el inventario.';
      console.error('Inventory fetch failed:', message);
      setItems([]);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (canonicalId: string, newStatus: Disponibilidad) => {
    try {
      const res = await apiClient.updateSupportStatus(canonicalId, newStatus);
      if (res.status !== 'success') return false;

      setItems((prev) =>
        prev.map((item) =>
          item.canonical_id === canonicalId
            ? { ...item, disponibilidad: newStatus }
            : item,
        ),
      );
      return true;
    } catch (err) {
      console.error('Failed to save status update to Neon:', err);
      return false;
    }
  }, []);

  const updateDetails = useCallback(async (canonicalId: string, updatedFields: any) => {
    try {
      const res = await apiClient.updateSupportDetails(canonicalId, updatedFields);
      if (res.status !== 'success') return false;

      setItems((prev) =>
        prev.map((item) =>
          item.canonical_id === canonicalId
            ? { ...item, ...updatedFields }
            : item,
        ),
      );
      return true;
    } catch (err) {
      console.error('Failed to update support details in Neon:', err);
      return false;
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
