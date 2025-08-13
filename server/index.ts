import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import clientRoutes from './routes/clients';
import expedienteRoutes from './routes/expedientes';
import appointmentRoutes from './routes/appointments';
import documentRoutes from './routes/documents';
import libraryRoutes from './routes/library';
import adminRoutes from './routes/admin';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ava-legal')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/expedientes', expedienteRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/admin', adminRoutes);


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AVA Legal API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});