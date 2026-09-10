const BASE_URL = '/api';

export const api = {
  auth: {
    login: async (credentials: any) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return res.json();
    },
    logout: async () => {
      return { success: true };
    }
  },
  assets: {
    getAll: async () => {
      const res = await fetch(`${BASE_URL}/assets`);
      return res.json();
    },
    getById: async (id: string) => {
      const res = await fetch(`${BASE_URL}/assets/${id}`);
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch(`${BASE_URL}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    update: async (id: string, data: any) => {
      const res = await fetch(`${BASE_URL}/assets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`${BASE_URL}/assets/${id}`, {
        method: 'DELETE'
      });
      return res.json();
    }
  },
  tickets: {
    getAll: async () => {
      const res = await fetch(`${BASE_URL}/tickets`);
      return res.json();
    },
    create: async (_ticketData: any) => {
      return { success: true, id: 'TKT-NEW' };
    },
    updateStatus: async (id: string, status: string) => {
      return { success: true, id, status };
    }
  },
  companies: {
    getAll: async () => {
      const res = await fetch(`${BASE_URL}/companies`);
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch(`${BASE_URL}/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    update: async (id: string, data: any) => {
      const res = await fetch(`${BASE_URL}/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`${BASE_URL}/companies/${id}`, {
        method: 'DELETE'
      });
      return res.json();
    }
  },
  products: {
    getAll: async () => {
      const res = await fetch(`${BASE_URL}/products`);
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    update: async (id: string, data: any) => {
      const res = await fetch(`${BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`${BASE_URL}/products/${id}`, {
        method: 'DELETE'
      });
      return res.json();
    }
  },
  users: {
    getAll: async () => {
      const res = await fetch(`${BASE_URL}/users`);
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    update: async (id: string, data: any) => {
      const res = await fetch(`${BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`${BASE_URL}/users/${id}`, {
        method: 'DELETE'
      });
      return res.json();
    }
  },
  licenses: {
    getAll: async () => {
      const res = await fetch(`${BASE_URL}/licenses`);
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch(`${BASE_URL}/licenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    update: async (id: string, data: any) => {
      const res = await fetch(`${BASE_URL}/licenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`${BASE_URL}/licenses/${id}`, {
        method: 'DELETE'
      });
      return res.json();
    }
  },
  recycleBin: {
    getAll: async () => {
      const res = await fetch(`${BASE_URL}/recycle-bin`);
      return res.json();
    },
    restore: async (table: string, id: string) => {
      const res = await fetch(`${BASE_URL}/recycle-bin/restore/${table}/${id}`, { method: 'POST' });
      return res.json();
    },
    permanentDelete: async (table: string, id: string) => {
      const res = await fetch(`${BASE_URL}/recycle-bin/permanent/${table}/${id}`, { method: 'DELETE' });
      return res.json();
    }
  }
};
