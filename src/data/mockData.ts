import { User, Organization, Client, Expediente, Appointment, Document, LibraryItem } from '../types';

export const mockOrganizations: Organization[] = [
  { id: '1', name: 'Bufete Jurídico AVA', createdAt: new Date('2024-01-01') },
  { id: '2', name: 'Abogados & Asociados', createdAt: new Date('2024-02-01') },
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'María González',
    email: 'maria@bufeteava.com',
    role: 'admin',
    organizationId: '1'
  },
  {
    id: '2',
    name: 'Carlos Ruiz',
    email: 'carlos@bufeteava.com',
    role: 'user',
    organizationId: '1'
  },
  {
    id: '3',
    name: 'Ana López',
    email: 'ana@bufeteava.com',
    role: 'user',
    organizationId: '1'
  }
];

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Pedro Martínez',
    email: 'pedro@email.com',
    phone: '+34 666 123 456',
    organizationId: '1',
    expedientesCount: 2,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Lucía Fernández',
    email: 'lucia@email.com',
    phone: '+34 677 234 567',
    organizationId: '1',
    expedientesCount: 1,
    createdAt: new Date('2024-02-01')
  },
  {
    id: '3',
    name: 'Roberto Silva',
    email: 'roberto@email.com',
    phone: '+34 688 345 678',
    organizationId: '1',
    expedientesCount: 3,
    createdAt: new Date('2024-02-15')
  }
];

export const mockExpedientes: Expediente[] = [
  {
    id: '1',
    title: 'Divorcio contencioso',
    clientId: '1',
    clientName: 'Pedro Martínez',
    status: 'Activo',
    organizationId: '1',
    createdAt: new Date('2024-01-20'),
    dueDate: new Date('2024-03-20')
  },
  {
    id: '2',
    title: 'Reclamación de cantidad',
    clientId: '1',
    clientName: 'Pedro Martínez',
    status: 'Pendiente',
    organizationId: '1',
    createdAt: new Date('2024-02-01')
  },
  {
    id: '3',
    title: 'Herencia intestada',
    clientId: '2',
    clientName: 'Lucía Fernández',
    status: 'Activo',
    organizationId: '1',
    createdAt: new Date('2024-02-05')
  },
  {
    id: '4',
    title: 'Despido improcedente',
    clientId: '3',
    clientName: 'Roberto Silva',
    status: 'Cerrado',
    organizationId: '1',
    createdAt: new Date('2024-01-10')
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    title: 'Consulta divorcio',
    date: new Date('2024-03-15T10:00:00'),
    expedienteId: '1',
    expedienteTitle: 'Divorcio contencioso',
    clientName: 'Pedro Martínez',
    status: 'programada',
    organizationId: '1'
  },
  {
    id: '2',
    title: 'Revisión herencia',
    date: new Date('2024-03-16T15:30:00'),
    expedienteId: '3',
    expedienteTitle: 'Herencia intestada',
    clientName: 'Lucía Fernández',
    status: 'programada',
    organizationId: '1'
  }
];

export const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Contrato de servicios jurídicos',
    type: 'PDF',
    url: '#',
    uploadedAt: new Date('2024-02-01'),
    organizationId: '1'
  },
  {
    id: '2',
    name: 'Demanda civil',
    type: 'DOCX',
    url: '#',
    uploadedAt: new Date('2024-02-10'),
    organizationId: '1'
  },
  {
    id: '3',
    name: 'Certificado de defunción',
    type: 'PDF',
    url: '#',
    uploadedAt: new Date('2024-02-15'),
    organizationId: '1'
  }
];

export const mockLibraryItems: LibraryItem[] = [
  {
    id: '1',
    title: 'Código Civil - Artículo 85',
    category: 'Derecho Civil',
    content: 'El matrimonio se disuelve por muerte o declaración de fallecimiento...',
    organizationId: '1'
  },
  {
    id: '2',
    title: 'Ley de Enjuiciamiento Civil',
    category: 'Procesal Civil',
    content: 'Disposiciones generales sobre el proceso civil...',
    organizationId: '1'
  },
  {
    id: '3',
    title: 'Estatuto de los Trabajadores',
    category: 'Derecho Laboral',
    content: 'Normas reguladoras de las relaciones laborales...',
    organizationId: '1'
  }
];