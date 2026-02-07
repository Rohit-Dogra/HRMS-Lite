const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    let message = res.statusText;
    if (data?.detail) {
      if (typeof data.detail === 'string') message = data.detail;
      else if (Array.isArray(data.detail)) message = data.detail.map((d) => d.msg || d).join(', ');
      else if (data.detail.msg) message = data.detail.msg;
    }
    throw new Error(message);
  }
  return data;
}

export const api = {
  employees: {
    list: () => request('/employees'),
    create: (body) => request('/employees', { method: 'POST', body: JSON.stringify(body) }),
    get: (id) => request(`/employees/${id}`),
    delete: (id) => request(`/employees/${id}`, { method: 'DELETE' }),
  },
  attendance: {
    list: (params = {}) => {
      const sp = new URLSearchParams();
      if (params.employee_id != null) sp.set('employee_id', params.employee_id);
      if (params.fromDate) sp.set('fromDate', params.fromDate);
      if (params.toDate) sp.set('toDate', params.toDate);
      const q = sp.toString();
      return request('/attendance' + (q ? `?${q}` : ''));
    },
    listByEmployee: (employeeId) => request(`/attendance/employee/${employeeId}`),
    mark: (body) => request('/attendance', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id) => request(`/attendance/${id}`, { method: 'DELETE' }),
  },
  stats: {
    dashboard: () => request('/stats/dashboard'),
  },
};
