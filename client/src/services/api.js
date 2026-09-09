const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (
        window.location.pathname !== "/" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/";
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error(
      `API Error [${endpoint}]:`,
      error.message
    );

    throw error;
  }
};

// Auth API
export const authApi = {
  login: (credentials) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    apiRequest("/auth/logout", {
      method: "POST",
    }),

  getUsers: () => apiRequest("/auth/users"),
};

// Substations API
export const substationsApi = {
  getAll: () => apiRequest("/substations"),
};

// Feeders API
export const feedersApi = {
  getAll: () => apiRequest("/feeders"),
};

// Transformers API
export const transformersApi = {
  getAll: () => apiRequest("/transformers"),
};

// Consumers API
export const consumersApi = {
  getAll: () => apiRequest("/consumers"),
};

// Smart Meters API
export const smartMetersApi = {
  getAll: () => apiRequest("/smart-meters"),

  getById: (id) =>
    apiRequest(`/smart-meters/${id}`),

  create: (data) =>
    apiRequest("/smart-meters", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiRequest(`/smart-meters/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiRequest(`/smart-meters/${id}`, {
      method: "DELETE",
    }),
};

// Outages API
export const outagesApi = {
  getAll: () =>
    apiRequest("/outages"),

  create: (data) =>
    apiRequest("/outages", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiRequest(`/outages/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiRequest(`/outages/${id}`, {
      method: "DELETE",
    }),
};

// Consumer Impact API
export const consumerImpactApi = {
  getByOutage: (outageId) =>
    apiRequest(`/consumer-impact/${outageId}`),
};

// Reliability reports API
export const reportsApi = {
  getSaidi: () => apiRequest("/reports/saidi"),
  getSaifi: () => apiRequest("/reports/saifi"),
};

// Tickets API
export const ticketsApi = {
  getAll: () =>
    apiRequest("/tickets"),

  create: (data) =>
    apiRequest("/tickets", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiRequest(`/tickets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiRequest(`/tickets/${id}`, {
      method: "DELETE",
    }),
};

export default API_URL;