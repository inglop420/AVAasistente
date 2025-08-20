import { Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';
import createCsvWriter from 'csv-writer';
import path from 'path';
import fs from 'fs';

const SCJN_BASE_URL = 'https://bicentenario.scjn.gob.mx/repositorio-scjn/api/v1';

interface SearchFilters {
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
  fechaInicio?: string;
  fechaFin?: string;
  page?: number;
  limit?: number;
}

interface SCJNDocument {
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

// Función para construir parámetros de consulta para la API de SCJN
const buildSCJNQuery = (filters: SearchFilters) => {
  const params: any = {};
  
  // Filtros básicos
  if (filters.palabraClave) {
    params.q = filters.palabraClave;
  }
  
  if (filters.epoca) {
    params.epoca = filters.epoca;
  }
  
  if (filters.año) {
    params.año = filters.año;
  }
  
  if (filters.instancia) {
    params.instancia = filters.instancia;
  }
  
  if (filters.organo) {
    params.organo = filters.organo;
  }
  
  if (filters.materia) {
    params.materia = filters.materia;
  }
  
  if (filters.asunto) {
    params.asunto = filters.asunto;
  }
  
  if (filters.ponente) {
    params.ponente = filters.ponente;
  }
  
  if (filters.tipo) {
    params.tipo = filters.tipo;
  }
  
  // Paginación
  params.page = filters.page || 1;
  params.limit = Math.min(filters.limit || 20, 100); // Máximo 100 por página
  
  return params;
};

// Función para obtener documentos de la API de SCJN
const fetchSCJNDocuments = async (endpoint: string, filters: SearchFilters): Promise<{ documents: SCJNDocument[], total: number }> => {
  try {
    const params = buildSCJNQuery(filters);
    
    // Primero obtener el conteo total
    const countResponse = await axios.get(`${SCJN_BASE_URL}/${endpoint}/count`, {
      params: { ...params, limit: undefined, page: undefined },
      timeout: 10000
    });
    
    const total = countResponse.data?.total || 0;
    
    // Si hay demasiados resultados, limitar
    if (total > 1000) {
      throw new Error('Demasiados resultados. Por favor, refina tu búsqueda.');
    }
    
    // Obtener IDs paginados
    const idsResponse = await axios.get(`${SCJN_BASE_URL}/${endpoint}/ids`, {
      params,
      timeout: 10000
    });
    
    const ids = idsResponse.data?.ids || [];
    
    // Obtener detalles de cada documento (máximo 20 para performance)
    const documentsToFetch = ids.slice(0, Math.min(20, ids.length));
    const documents: SCJNDocument[] = [];
    
    for (const id of documentsToFetch) {
      try {
        const detailResponse = await axios.get(`${SCJN_BASE_URL}/${endpoint}/${id}`, {
          timeout: 5000
        });
        
        const doc = detailResponse.data;
        if (doc) {
          documents.push({
            id: doc.id || id,
            titulo: doc.titulo || doc.rubro || 'Sin título',
            rubro: doc.rubro,
            tipo: endpoint === 'tesis' ? 'Tesis' : 'Engrose',
            epoca: doc.epoca,
            instancia: doc.instancia,
            organo: doc.organo,
            materia: doc.materia,
            año: doc.año || doc.fechaPublicacion ? new Date(doc.fechaPublicacion).getFullYear() : undefined,
            ponente: doc.ponente,
            asunto: doc.asunto,
            fechaPublicacion: doc.fechaPublicacion,
            contenido: doc.contenido || doc.texto,
            url: doc.url
          });
        }
      } catch (detailError) {
        console.error(`Error fetching document ${id}:`, detailError);
        // Continuar con el siguiente documento
      }
    }
    
    return { documents, total };
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

export const searchDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const filters: SearchFilters = req.body;
    
    // Validar filtros básicos
    if (!filters.fuente || !filters.categoria) {
      return res.status(400).json({ 
        message: 'Fuente y categoría son requeridos' 
      });
    }
    
    let results: { documents: SCJNDocument[], total: number } = { documents: [], total: 0 };
    
    // Determinar endpoint según categoría
    if (filters.categoria === 'Tesis') {
      results = await fetchSCJNDocuments('tesis', filters);
    } else if (['Precedente', 'Sentencia'].includes(filters.categoria)) {
      results = await fetchSCJNDocuments('engroses', filters);
    } else {
      // Para otras categorías, buscar en ambos endpoints
      try {
        const tesisResults = await fetchSCJNDocuments('tesis', filters);
        const engrosesResults = await fetchSCJNDocuments('engroses', filters);
        
        results = {
          documents: [...tesisResults.documents, ...engrosesResults.documents],
          total: tesisResults.total + engrosesResults.total
        };
      } catch (error) {
        // Si falla la búsqueda combinada, intentar solo tesis
        results = await fetchSCJNDocuments('tesis', filters);
      }
    }
    
    // Advertencia si hay demasiados resultados
    let warning = null;
    if (results.total > 100) {
      warning = `Se encontraron ${results.total} documentos. Mostrando los primeros 20. Considera refinar tu búsqueda para obtener resultados más específicos.`;
    }
    
    res.json({
      success: true,
      documents: results.documents,
      total: results.total,
      page: filters.page || 1,
      limit: Math.min(filters.limit || 20, 100),
      warning
    });
    
  } catch (error) {
    console.error('Search documents error:', error);
    
    let message = 'Error al buscar documentos';
    if (error instanceof Error) {
      message = error.message;
    }
    
    res.status(500).json({ 
      success: false,
      message,
      documents: [],
      total: 0
    });
  }
};

export const getDocumentDetail = async (req: AuthRequest, res: Response) => {
  try {
    const { type, id } = req.params;
    
    if (!['tesis', 'engroses'].includes(type)) {
      return res.status(400).json({ message: 'Tipo de documento inválido' });
    }
    
    const response = await axios.get(`${SCJN_BASE_URL}/${type}/${id}`, {
      timeout: 10000
    });
    
    const doc = response.data;
    
    const document: SCJNDocument = {
      id: doc.id || id,
      titulo: doc.titulo || doc.rubro || 'Sin título',
      rubro: doc.rubro,
      tipo: type === 'tesis' ? 'Tesis' : 'Engrose',
      epoca: doc.epoca,
      instancia: doc.instancia,
      organo: doc.organo,
      materia: doc.materia,
      año: doc.año || (doc.fechaPublicacion ? new Date(doc.fechaPublicacion).getFullYear() : undefined),
      ponente: doc.ponente,
      asunto: doc.asunto,
      fechaPublicacion: doc.fechaPublicacion,
      contenido: doc.contenido || doc.texto,
      url: doc.url
    };
    
    res.json({
      success: true,
      document
    });
    
  } catch (error) {
    console.error('Get document detail error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener detalle del documento' 
    });
  }
};

export const getDocumentCount = async (req: AuthRequest, res: Response) => {
  try {
    const filters: SearchFilters = req.body;
    const params = buildSCJNQuery(filters);
    
    let total = 0;
    
    if (filters.categoria === 'Tesis') {
      const response = await axios.get(`${SCJN_BASE_URL}/tesis/count`, {
        params,
        timeout: 10000
      });
      total = response.data?.total || 0;
    } else if (['Precedente', 'Sentencia'].includes(filters.categoria)) {
      const response = await axios.get(`${SCJN_BASE_URL}/engroses/count`, {
        params,
        timeout: 10000
      });
      total = response.data?.total || 0;
    } else {
      // Para otras categorías, sumar ambos
      try {
        const [tesisResponse, engrosesResponse] = await Promise.all([
          axios.get(`${SCJN_BASE_URL}/tesis/count`, { params, timeout: 10000 }),
          axios.get(`${SCJN_BASE_URL}/engroses/count`, { params, timeout: 10000 })
        ]);
        
        total = (tesisResponse.data?.total || 0) + (engrosesResponse.data?.total || 0);
      } catch (error) {
        console.error('Error getting combined count:', error);
        total = 0;
      }
    }
    
    res.json({
      success: true,
      total
    });
    
  } catch (error) {
    console.error('Get document count error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener conteo de documentos',
      total: 0
    });
  }
};

export const downloadResults = async (req: AuthRequest, res: Response) => {
  try {
    const { documents } = req.body;
    
    if (!documents || !Array.isArray(documents)) {
      return res.status(400).json({ message: 'Documentos requeridos para descarga' });
    }
    
    // Crear archivo CSV temporal
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `scjn-resultados-${timestamp}.csv`;
    const filepath = path.join('/tmp', filename);
    
    const csvWriter = createCsvWriter({
      path: filepath,
      header: [
        { id: 'titulo', title: 'Título' },
        { id: 'tipo', title: 'Tipo' },
        { id: 'epoca', title: 'Época' },
        { id: 'instancia', title: 'Instancia' },
        { id: 'organo', title: 'Órgano' },
        { id: 'materia', title: 'Materia' },
        { id: 'año', title: 'Año' },
        { id: 'ponente', title: 'Ponente' },
        { id: 'asunto', title: 'Asunto' },
        { id: 'fechaPublicacion', title: 'Fecha Publicación' }
      ]
    });
    
    await csvWriter.writeRecords(documents);
    
    // Leer archivo y enviarlo
    const fileContent = fs.readFileSync(filepath);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(fileContent);
    
    // Limpiar archivo temporal
    fs.unlinkSync(filepath);
    
  } catch (error) {
    console.error('Download results error:', error);
    res.status(500).json({ 
      message: 'Error al generar archivo de descarga' 
    });
  }
};