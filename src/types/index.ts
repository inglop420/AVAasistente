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