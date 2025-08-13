import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    organizationId: string;
    role: string;
    tenantId: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token de acceso requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Verify user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    req.user = {
      id: (user as any)._id.toString(),
      organizationId: (user as any).organizationId,
      role: (user as any).role,
      tenantId: (user as any).tenantId
    };

    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permisos para esta acción' });
    }

    next();
  };
};

// Middleware para validar permisos específicos
export const requirePermission = (action: string, resource: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { role } = req.user;

    // Superadmin y admin tienen todos los permisos
    if (role === 'superadmin' || role === 'admin') {
      return next();
    }

    // Definir permisos por rol
    const permissions = {
      abogado: {
        clients: ['create', 'read', 'update', 'delete'],
        expedientes: ['create', 'read', 'update', 'delete'],
        appointments: ['create', 'read', 'update', 'delete'],
        documents: ['create', 'read', 'delete'],
        library: ['read']
      },
      asistente: {
        clients: ['create', 'read', 'update'],
        expedientes: ['create', 'read', 'update'],
        appointments: ['create', 'read', 'update', 'delete'],
        documents: ['create', 'read', 'delete'],
        library: ['read']
      },
      auxiliar: {
        clients: ['read'],
        expedientes: ['read'],
        appointments: ['read'],
        documents: ['read'],
        library: ['read']
      }
    };

    const userPermissions = permissions[role as keyof typeof permissions];
    
    if (!userPermissions || !userPermissions[resource as keyof typeof userPermissions]) {
      return res.status(403).json({ message: 'No tienes permisos para acceder a este recurso' });
    }

    const resourcePermissions = userPermissions[resource as keyof typeof userPermissions];
    
    if (!resourcePermissions.includes(action)) {
      return res.status(403).json({ message: `No tienes permisos para ${action} en ${resource}` });
    }

    next();
  };
};