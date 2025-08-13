import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'user', organizationId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      organizationId: organizationId || uuidv4() // Generate new org if not provided
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, organizationId: user.organizationId },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
// Verifica que la contraseña exista y sea string
    if (!user.password || typeof user.password !== 'string') {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, organizationId: user.organizationId },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};