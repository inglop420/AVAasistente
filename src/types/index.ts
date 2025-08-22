export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
  // ...otros campos necesarios
}

export interface Organization {
  _id: string;
  name: string;
  // ...otros campos necesarios
}

export interface Expediente {
  id: string;
  numeroExpediente?: string;
  tipoProceso?: string;
  origen?: string;
  title: string;
  clientId: string;
  clientName: string;
  status: 'Activo' | 'Pendiente' | 'Cerrado';
  createdAt: string;
  dueDate?: string;
  // ...otros campos necesarios
}

export interface Client {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  expedientesCount?: number;
  createdAt: string;
  // ...otros campos
}

export interface Appointment {
  _id?: string;
  title: string;
  clientId: string;
  clientName?: string;
  status: 'programada' | 'completada' | 'cancelada';
  date: string;
  expedienteId: string;
  expedienteTitle?: string;
  // ...otros campos
}

export interface Document {
  _id: string;
  title: string;
  url: string;
  expedienteId: string;
  uploadedAt: string;
  // ...otros campos necesarios
}

export interface LibraryItem {
  _id: string;
  title: string;
  description?: string;
  url: string;
  // ...otros campos necesarios
}

export interface Movement {
  id: string;
  expedienteId: string;
  fecha: Date | string;
  descripcion: string;
  tipoMovimiento: 'Actuacion' | 'Escrito' | 'Documento' | 'Audiencia' | 'Resolucion' | 'Otro';
  contenido?: string; // HTML del editor de texto
  archivos?: {
    nombre: string;
    url: string;
    tipo: string;
    tamaño?: number;
  }[];
  creadoPor: string;
  createdAt: Date | string;
}

export interface Task {
  id: string;
  expedienteId: string;
  expedienteTitle: string;
  clientName: string;
  titulo: string;
  descripcion?: string;
  prioridad: 'urgente' | 'prioritario' | 'importante' | 'recordar';
  estado: 'pendiente' | 'realizado' | 'cancelado';
  fechaVencimiento: Date | string;
  creadoPor: string;
  createdAt: Date | string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface SCJNDocument {
  id: string;
  titulo: string;
  rubro?: string;
  tipo: 'Tesis' | 'Engrose';
  epoca?: string;
  instancia?: string;
  organo?: string;
  materia?: string;
  año?: number;
  ponente?: string;
  asunto?: string;
  fechaPublicacion?: string;
  contenido?: string;
  url?: string;
}

export interface SCJNSearchFilters {
  fuente: 'SJF' | 'SIJ';
  categoria: string;
  palabraClave?: string;
  epoca?: string;
  año?: number;
  instancia?: string;
  organo?: string;
  materia?: string;
  asunto?: string;
  ponente?: string;
  tipo?: string;
  emisor?: string;
  formasIntegracion?: string;
  tipoAsunto?: string;
  organoRadicacion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  page?: number;
  limit?: number;
}

export type NavigationItem =
  | 'clientes'
  | 'expedientes'
  | 'agenda'
  | 'documentos'
  | 'biblioteca';