import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User';
import Organization from '../models/Organization';
import { AuthRequest } from '../middleware/auth';

// Organizations
export const getOrganizations = async (req: AuthRequest, res: Response) => {
  try {
    const organizations = await Organization.find().sort({ createdAt: -1 });
    res.json(organizations);
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({ message: 'Error al obtener organizaciones' });
  }
};

export const createOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;

    // Check if organization already exists
    const existingOrg = await Organization.findOne({ name });
    if (existingOrg) {
      return res.status(400).json({ message: 'La organización ya existe' });
    }

    const organization = new Organization({ name });
    await organization.save();

    res.status(201).json(organization);
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({ message: 'Error al crear organización' });
  }
};

export const updateOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const organization = await Organization.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }

    res.json(organization);
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({ message: 'Error al actualizar organización' });
  }
};

export const deleteOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if organization has users
    const usersCount = await User.countDocuments({ organizationId: id });
    if (usersCount > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar una organización que tiene usuarios asignados' 
      });
    }

    const organization = await Organization.findByIdAndDelete(id);
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }

    res.json({ message: 'Organización eliminada exitosamente' });
  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json({ message: 'Error al eliminar organización' });
  }
};

// Users
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    let query = {};
    
    // If user is admin (not superadmin), only show users from their organization
    if (req.user!.role === 'admin') {
      query = { organizationId: req.user!.organizationId };
    }

    const users = await User.find(query)
      .select('-password')
      .populate('organizationId', 'name')
      .sort({ createdAt: -1 });

    // Transform users to match frontend interface
    const usersResponse = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: (user as any).organizationId?.name || 'Sin organización',
      avatar: user.avatar,
      createdAt: user.createdAt
    }));

    res.json(usersResponse);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, organizationId } = req.body;

    // Validate organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(400).json({ message: 'Organización no encontrada' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      organizationId
    });

    await user.save();

    // Return user without password
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: organization.name,
      createdAt: user.createdAt
    };

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, organizationId } = req.body;

    // If user is admin, they can only update users from their organization
    let query: any = { _id: id };
    if (req.user!.role === 'admin') {
      query.organizationId = req.user!.organizationId;
    }

    const user = await User.findOneAndUpdate(
      query,
      { name, email, role, organizationId },
      { new: true }
    ).select('-password').populate('organizationId', 'name');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: (user as any).organizationId?.name || 'Sin organización',
      createdAt: user.createdAt
    };

    res.json(userResponse);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent users from deleting themselves
    if (id === req.user!.id) {
      return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
    }

    // If user is admin, they can only delete users from their organization
    let query: any = { _id: id };
    if (req.user!.role === 'admin') {
      query.organizationId = req.user!.organizationId;
    }

    const user = await User.findOneAndDelete(query);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};