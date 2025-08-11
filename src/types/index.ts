// Types definitions for AVA Legal Assistant
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Abogado' | 'Asistente';
  organizationId: string;
  avatar?: string;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  organizationId: string;
  expedientesCount: number;
  createdAt: Date;
}

export interface Expediente {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  status: 'Activo' | 'Pendiente' | 'Cerrado';
  organizationId: string;
  createdAt: Date;
  dueDate?: Date;
}

export interface Appointment {
  id: string;
  title: string;
  date: Date;
  expedienteId?: string;
  expedienteTitle?: string;
  clientName: string;
  status: 'programada' | 'completada' | 'cancelada';
  organizationId: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
  organizationId: string;
}

export interface LibraryItem {
  id: string;
  title: string;
  category: string;
  content: string;
  organizationId: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export type NavigationItem = 
  | 'dashboard'
  | 'clientes' 
  | 'expedientes'
  | 'agenda'
  | 'documentos'
  | 'biblioteca'
  | 'configuracion';