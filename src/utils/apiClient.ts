/**
 * Centralized API client for all HTTP requests to the backend server.
 * Ensures HTTP status checks, Content-Type validation, and consistent JSON parsing.
 */

async function fetchWithValidation<T = any>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Response is not JSON. Received Content-Type: ${contentType}`);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  /**
   * Fetches the complete OOH inventory from Neon PostgreSQL database.
   */
  getInventory: async () => {
    return fetchWithValidation<{ status: string; data: any[] }>('/api/supports');
  },

  /**
   * Updates the availability status of an individual support asset.
   */
  updateSupportStatus: async (canonicalId: string, status: string) => {
    return fetchWithValidation<{ status: string; data?: any }>([
      '/api/supports',
      canonicalId,
      'status'
    ].join('/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ disponibilidad: status }),
    });
  },

  /**
   * Updates full technical and geographic details of a support.
   */
  updateSupportDetails: async (canonicalId: string, data: any) => {
    return fetchWithValidation<{ status: string; message: string }>([
      '/api/supports',
      canonicalId
    ].join('/'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  /**
   * Fetches the stored collection of Media Kit proposals.
   */
  getMediaKits: async () => {
    return fetchWithValidation<{ status: string; data: any[] }>('/api/mediakits');
  },

  /**
   * Registers a new Media Kit proposal in the database.
   */
  createMediaKit: async (data: { id?: string; name: string; client_name?: string; soportes_ids?: string; notes?: string }) => {
    return fetchWithValidation<{ status: string; message: string; data: any }>('/api/mediakits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }
};
