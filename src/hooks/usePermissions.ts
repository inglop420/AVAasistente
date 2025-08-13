import { useAuth } from '../contexts/AuthContext';

interface Permissions {
  clients: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
  expedientes: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
  appointments: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
  documents: {
    create: boolean;
    read: boolean;
    delete: boolean;
  };
  library: {
    read: boolean;
  };
}

export const usePermissions = (): Permissions => {
  const { user } = useAuth();

  if (!user) {
    return {
      clients: { create: false, read: false, update: false, delete: false },
      expedientes: { create: false, read: false, update: false, delete: false },
      appointments: { create: false, read: false, update: false, delete: false },
      documents: { create: false, read: false, delete: false },
      library: { read: false }
    };
  }

  // Superadmin y admin tienen todos los permisos
  if (user.role === 'superadmin' || user.role === 'admin') {
    return {
      clients: { create: true, read: true, update: true, delete: true },
      expedientes: { create: true, read: true, update: true, delete: true },
      appointments: { create: true, read: true, update: true, delete: true },
      documents: { create: true, read: true, delete: true },
      library: { read: true }
    };
  }

  // Permisos por rol organizacional
  const rolePermissions = {
    abogado: {
      clients: { create: true, read: true, update: true, delete: true },
      expedientes: { create: true, read: true, update: true, delete: true },
      appointments: { create: true, read: true, update: true, delete: true },
      documents: { create: true, read: true, delete: true },
      library: { read: true }
    },
    asistente: {
      clients: { create: true, read: true, update: true, delete: false },
      expedientes: { create: true, read: true, update: true, delete: false },
      appointments: { create: true, read: true, update: true, delete: true },
      documents: { create: true, read: true, delete: true },
      library: { read: true }
    },
    auxiliar: {
      clients: { create: false, read: true, update: false, delete: false },
      expedientes: { create: false, read: true, update: false, delete: false },
      appointments: { create: false, read: true, update: false, delete: false },
      documents: { create: false, read: true, delete: false },
      library: { read: true }
    }
  };

  return rolePermissions[user.role as keyof typeof rolePermissions] || rolePermissions.auxiliar;
};