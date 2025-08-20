import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    api.post('/auth/login', { email, password }),
  register: (userData: any) =>
    api.post('/auth/register', userData),
};

// Clients API
export const clientsAPI = {
  getAll: () => api.get('/clients'),
  create: (clientData: any) => api.post('/clients', clientData),
  update: (id: string, clientData: any) => api.put(`/clients/${id}`, clientData),
  delete: (id: string) => api.delete(`/clients/${id}`),
};

// Expedientes API
export const expedientesAPI = {
  getAll: () => api.get('/expedientes'),
  create: (expedienteData: any) => api.post('/expedientes', expedienteData),
  update: (id: string, expedienteData: any) => api.put(`/expedientes/${id}`, expedienteData),
  delete: (id: string) => api.delete(`/expedientes/${id}`),
};

// Appointments API
export const appointmentsAPI = {
  getAll: () => api.get('/appointments'),
  create: (appointmentData: any) => api.post('/appointments', appointmentData),
  update: (id: string, appointmentData: any) => api.put(`/appointments/${id}`, appointmentData),
  delete: (id: string) => api.delete(`/appointments/${id}`),
};

// Documents API
export const documentsAPI = {
  getAll: () => api.get('/documents'),
  create: (documentData: any) => api.post('/documents', documentData),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

// Library API
export const libraryAPI = {
  getAll: () => api.get('/library'),
  create: (itemData: any) => api.post('/library', itemData),
};

// Admin API
export const adminAPI = {
  // Organizations
  getOrganizations: () => api.get('/admin/organizations'),
  createOrganization: (orgData: any) => api.post('/admin/organizations', orgData),
  updateOrganization: (id: string, orgData: any) => api.put(`/admin/organizations/${id}`, orgData),
  deleteOrganization: (id: string) => api.delete(`/admin/organizations/${id}`),
  
  // Users
  getUsers: () => api.get('/admin/users'),
  createUser: (userData: any) => api.post('/admin/users', userData),
  updateUser: (id: string, userData: any) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
};

// Chat API
export const chatAPI = {
  sendMessage: (message: string) => api.post('/chat/message', { message }),
};

// Movements API
export const movementsAPI = {
  getAll: (expedienteId: string) => api.get(`/expedientes/${expedienteId}/movements`),
  create: (expedienteId: string, movementData: any) => api.post(`/expedientes/${expedienteId}/movements`, movementData),
  update: (expedienteId: string, movementId: string, movementData: any) => api.put(`/expedientes/${expedienteId}/movements/${movementId}`, movementData),
  delete: (expedienteId: string, movementId: string) => api.delete(`/expedientes/${expedienteId}/movements/${movementId}`),
};

// Tasks API
export const tasksAPI = {
  getAll: (expedienteId: string) => api.get(`/expedientes/${expedienteId}/tasks`),
  getAllTasks: () => api.get('/expedientes/tasks/all'),
  create: (expedienteId: string, taskData: any) => api.post(`/expedientes/${expedienteId}/tasks`, taskData),
  update: (expedienteId: string, taskId: string, taskData: any) => api.put(`/expedientes/${expedienteId}/tasks/${taskId}`, taskData),
  delete: (expedienteId: string, taskId: string) => api.delete(`/expedientes/${expedienteId}/tasks/${taskId}`),
};

// SCJN API
export const scjnAPI = {
  search: (filters: any) => api.get('/scjn/search', { params: filters }),
  getDocumentDetail: (type: string, id: string) => api.get(`/scjn/document/${type}/${id}`),
  getCount: (filters: any) => api.get('/scjn/count', { params: filters }),
  downloadResults: (documents: any[]) => api.post('/scjn/download', { documents }, { responseType: 'blob' }),
};

export default api;