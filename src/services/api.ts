import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ava_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ava_token');
      localStorage.removeItem('ava_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  register: (userData: any) =>
    api.post('/api/auth/register', userData),
};

// Clients API
export const clientsAPI = {
  getAll: () => api.get('/api/clients'),
  create: (clientData: any) => api.post('/api/clients', clientData),
  update: (id: string, clientData: any) => api.put(`/api/clients/${id}`, clientData),
  delete: (id: string) => api.delete(`/api/clients/${id}`),
};

// Expedientes API
export const expedientesAPI = {
  getAll: () => api.get('/api/expedientes'),
  create: (expedienteData: any) => api.post('/api/expedientes', expedienteData),
  update: (id: string, expedienteData: any) => api.put(`/api/expedientes/${id}`, expedienteData),
  delete: (id: string) => api.delete(`/api/expedientes/${id}`),
};

// Appointments API
export const appointmentsAPI = {
  getAll: () => api.get('/api/appointments'),
  create: (appointmentData: any) => api.post('/api/appointments', appointmentData),
  update: (id: string, appointmentData: any) => api.put(`/api/appointments/${id}`, appointmentData),
  delete: (id: string) => api.delete(`/api/appointments/${id}`),
};

// Documents API
export const documentsAPI = {
  getAll: () => api.get('/api/documents'),
  getByCategory: (category: string) => api.get(`/api/documents?category=${category}`),
  getByExpediente: (expedienteId: string) => api.get(`/api/documents/expediente/${expedienteId}`),
  upload: (formData: FormData) => api.post('/api/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  download: (id: string) => api.get(`/api/documents/download/${id}`, { responseType: 'blob' }),
  view: (id: string) => api.get(`/api/documents/view/${id}`, { responseType: 'blob' }),
  delete: (id: string) => api.delete(`/api/documents/${id}`),
};

// Library API
export const libraryAPI = {
  getAll: () => api.get('/api/library'),
  create: (itemData: any) => api.post('/api/library', itemData),
};

// Admin API
export const adminAPI = {
  // Organizations
  getOrganizations: () => api.get('/api/admin/organizations'),
  createOrganization: (orgData: any) => api.post('/api/admin/organizations', orgData),
  updateOrganization: (id: string, orgData: any) => api.put(`/api/admin/organizations/${id}`, orgData),
  deleteOrganization: (id: string) => api.delete(`/api/admin/organizations/${id}`),

  // Users
  getUsers: () => api.get('/api/admin/users'),
  createUser: (userData: any) => api.post('/api/admin/users', userData),
  updateUser: (id: string, userData: any) => api.put(`/api/admin/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/api/admin/users/${id}`),
};

// Chat API
export const chatAPI = {
  sendMessage: (message: string) => api.post('/api/chat/message', { message }),
  getConversations: () => api.get('/api/chat/conversations'),
  createConversation: (data: any) => api.post('/api/chat/conversations', data),
  updateConversation: (id: string, data: any) => api.put(`/api/chat/conversations/${id}`, data),
  deleteConversation: (id: string) => api.delete(`/api/chat/conversations/${id}`),
};

// Movements API
export const movementsAPI = {
  getAll: (expedienteId: string) => api.get(`/api/expedientes/${expedienteId}/movements`),
  create: (expedienteId: string, movementData: any) => api.post(`/api/expedientes/${expedienteId}/movements`, movementData),
  update: (expedienteId: string, movementId: string, movementData: any) => api.put(`/api/expedientes/${expedienteId}/movements/${movementId}`, movementData),
  delete: (expedienteId: string, movementId: string) => api.delete(`/api/expedientes/${expedienteId}/movements/${movementId}`),
};

// Tasks API
export const tasksAPI = {
  getAll: (expedienteId: string) => api.get(`/api/expedientes/${expedienteId}/tasks`),
  getAllTasks: () => api.get('/api/expedientes/tasks/all'),
  create: (expedienteId: string, taskData: any) => api.post(`/api/expedientes/${expedienteId}/tasks`, taskData),
  update: (expedienteId: string, taskId: string, taskData: any) => api.put(`/api/expedientes/${expedienteId}/tasks/${taskId}`, taskData),
  delete: (expedienteId: string, taskId: string) => api.delete(`/api/expedientes/${expedienteId}/tasks/${taskId}`),
};

// SCJN API
export const scjnAPI = {
  search: (filters: any) => api.get('/api/scjn/search', { params: filters }),
  getDocumentDetail: (type: string, id: string) => api.get(`/api/scjn/document/${type}/${id}`),
  //getCount: (filters: any) => api.get('/api/scjn/count', { params: filters }),
  downloadResults: (documents: any[]) => api.post('/api/scjn/download', { documents }, { responseType: 'blob' }),
};

export default api;