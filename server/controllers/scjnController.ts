import { Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs';
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
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
  expediente?: string;
  pertenencia?: string;
  ministro?: string;
  tema?: string;
  organoJurisdiccionalOrigen?: string;
  organoResolvio?: string;
  fechaResolucion?: string;
  resolucion?: string;
  urlInternet?: string;
  votacion?: string;
  asuntosAcumulados?: string;
  idAcuerdo?: number;
  mes?: string;
  fuente?: string;
  id: string;
  idVoto?: number;
  precedentes?: string;
  huellaDigital?: string;
  tipoTesis?: string;
  anexos?: string;
  tesis?: string;
  clasificacion?: string;
  notaPublica?: string;
  idEjecutoria?: string;
  titulo: string;
  rubro?: string;
  tipo: 'Tesis' | 'Engrose' | 'Voto' | 'Acuerdo' | 'Sentencia' | 'Precedente' | 'VersionTaquigrafica';
  epoca?: string;
  instancia?: string;
  organo?: string;
  organoJuris?: string;
  materia?: string;
  año?: number;
  anio?: number;
  volumen?: string;
  tomo?: string;
  ponente?: string;
  promovente?: string;
  asunto?: string;
  fechaPublicacion?: string;
  contenido?: string;
  texto?: string;
  url?: string;
  localizacion?: string;
  emisor?: string;
  tipoAsunto?: string;
}

// Función para construir parámetros de consulta para la API de SCJN
const buildSCJNQuery = (filters: SearchFilters) => {
  console.log('Filtros recibidos en buildSCJNQuery:', filters);
  const params: any = {};

  // Helper para agregar solo si tiene valor útil
  const addParam = (key: string, value: any) => {
    if (
      value !== undefined &&
      value !== null &&
      !(typeof value === 'string' && value.trim() === '')
    ) {
      params[key] = typeof value === 'string' ? value.trim() : value;
    }
  };

  // Selección de filtros válidos según categoría/endpoint
  // Selección de filtros válidos según categoría/endpoint
switch (filters.categoria) {
  case 'Tesis':
    addParam('q', filters.palabraClave);
    addParam('epoca', filters.epoca);
    if (filters.año !== undefined && filters.año !== null) {
      const anioNum = typeof filters.año === 'string' ? parseInt(filters.año as any, 10) : filters.año;
      if (!isNaN(anioNum)) addParam('anio', anioNum);
    }
    addParam('instancia', filters.instancia);
    addParam('organoJuris', filters.organo);
    addParam('materia', filters.materia);
    addParam('asunto', filters.asunto);
    addParam('ponente', filters.ponente);
    addParam('tipo', filters.tipo);
    // Si tienes formas de integración, agrégalo aquí
    // addParam('formasIntegracion', filters.formasIntegracion);
    break;
  case 'Precedente':
    addParam('q', filters.palabraClave);
    addParam('epoca', filters.epoca);
    if (filters.año !== undefined && filters.año !== null) {
      const anioNum = typeof filters.año === 'string' ? parseInt(filters.año as any, 10) : filters.año;
      if (!isNaN(anioNum)) addParam('anio', anioNum);
    }
    addParam('instancia', filters.instancia);
    addParam('organoJuris', filters.organo);
    addParam('asunto', filters.asunto);
    break;
  case 'Voto':
  case 'Votos':
    addParam('q', filters.palabraClave);
    addParam('epoca', filters.epoca);
    addParam('instancia', filters.instancia);
    addParam('organoJuris', filters.organo);
    addParam('tipo', filters.tipo);
    addParam('emisor', filters.ponente);
    break;
  case 'Acuerdo':
  case 'Acuerdos':
    addParam('q', filters.palabraClave);
    addParam('epoca', filters.epoca);
    if (filters.año !== undefined && filters.año !== null) {
      const anioNum = typeof filters.año === 'string' ? parseInt(filters.año as any, 10) : filters.año;
      if (!isNaN(anioNum)) addParam('anio', anioNum);
    }
    addParam('organoJuris', filters.organo);
    addParam('instancia', filters.instancia);
    break;
  case 'Sentencia':
    // SIJ: Sentencia
    addParam('q', filters.palabraClave);
    addParam('tipoAsunto', filters.tipo); // Tipo de asunto
    addParam('organoResolvio', filters.organo); // Órgano de radicación
    addParam('ponente', filters.ponente);
    if (filters.año !== undefined && filters.año !== null) {
      const anioNum = typeof filters.año === 'string' ? parseInt(filters.año as any, 10) : filters.año;
      if (!isNaN(anioNum)) addParam('anio', anioNum);
    }
    break;
  default:
    // Si no hay categoría, solo palabra clave
    addParam('q', filters.palabraClave);
    break;
}

  // Paginación
  params.page = filters.page || 1;
  params.limit = Math.min(filters.limit || 20, 100); // Máximo 100 por página

  // Si solo hay palabra clave, advierte al usuario que refine la búsqueda
  if (
    Object.keys(params).length === 3 && // q, page, limit
    params.q &&
    !params.epoca &&
    !params.anio &&
    !params.instancia &&
    !params.organoJuris &&
    !params.materia &&
    !params.asunto &&
    !params.ponente &&
    !params.tipo
  ) {
    console.warn('La búsqueda solo tiene palabra clave. Es probable que la API devuelva demasiados resultados. Recomienda al usuario refinar la búsqueda.');
  }

  console.log('Parámetros generados para la API SCJN:', params);
  return params;
};

// Función para obtener documentos de la API de SCJN
const fetchSCJNDocuments = async (endpoint: string, filters: SearchFilters): Promise<{ documents: SCJNDocument[], total: number }> => {
  try {
    const params = buildSCJNQuery(filters);
    // 1. Obtén los IDs (máximo 100)
    const idsResponse = await axios.get(`${SCJN_BASE_URL}/${endpoint}/ids`, {
      params: { ...params, limit: 100, page: 1 },
      timeout: 10000
    });
    const ids = Array.isArray(idsResponse.data) ? idsResponse.data : idsResponse.data?.ids || [];
    const documents: SCJNDocument[] = [];

    // 2. Obtén los objetos completos
    for (const id of ids) {
      try {
        const detailResponse = await axios.get(`${SCJN_BASE_URL}/${endpoint}/${id}`, { timeout: 5000 });
        const doc = detailResponse.data;
        if (doc) {
          let mappedDoc: SCJNDocument;
          if (endpoint === 'tesis') {
            mappedDoc = {
              id: doc.idTesis || doc.id || id,
              titulo: doc.rubro || doc.titulo || 'Sin título',
              rubro: doc.rubro,
              tipo: 'Tesis',
              epoca: doc.epoca,
              instancia: doc.instancia,
              organo: doc.organoJuris || doc.organo,
              materia: Array.isArray(doc.materias) ? doc.materias.join(', ') : doc.materia,
              año: doc.anio || doc.año || (doc.fechaPublicacion ? new Date(doc.fechaPublicacion).getFullYear() : undefined),
              ponente: doc.ponente,
              asunto: doc.asunto,
              fechaPublicacion: doc.notaPublica || doc.fechaPublicacion,
              contenido: doc.texto || doc.contenido,
              url: doc.url,
              localizacion: doc.localizacion,
              mes: doc.mes,
              fuente: doc.fuente,
              tipoTesis: doc.tipoTesis,
              tesis: doc.tesis,
              precedentes: doc.precedentes,
              anexos: doc.anexos,
              huellaDigital: doc.huellaDigital
            };
          } else if (endpoint === 'ejecutoria') {
            mappedDoc = {
              id: doc.idEjecutoria || doc.id || id,
              idEjecutoria: doc.idEjecutoria,
              fuente: doc.fuente,
              instancia: doc.instancia,
              organo: doc.organoJuris || doc.organo,
              organoJuris: doc.organoJuris,
              epoca: doc.epoca,
              volumen: doc.volumen,
              tomo: doc.tomo,
              año: doc.año || doc.anio || (doc.fechaPublicacion ? new Date(doc.fechaPublicacion).getFullYear() : undefined),
              anio: doc.anio,
              mes: doc.mes,
              rubro: doc.rubro,
              titulo: doc.rubro || doc.titulo || 'Sin título',
              texto: doc.texto,
              contenido: doc.texto || doc.contenido,
              asunto: doc.asunto,
              tesis: doc.tesis,
              promovente: doc.promovente,
              anexos: doc.anexos,
              huellaDigital: doc.huellaDigital,
              tipo: 'Precedente',
              fechaPublicacion: doc.fechaPublicacion,
              url: doc.url,
              localizacion: doc.localizacion,
              materia: Array.isArray(doc.materias) ? doc.materias.join(', ') : doc.materia,
              ponente: doc.ponente
            };
          } else if (endpoint === 'votos') {
            mappedDoc = {
              id: doc.idVoto || doc.id || id,
              idVoto: doc.idVoto,
              fuente: doc.fuente,
              instancia: doc.instancia,
              organo: doc.organoJuris || doc.organo,
              organoJuris: doc.organoJuris,
              epoca: doc.epoca,
              volumen: doc.volumen,
              tomo: doc.tomo,
              año: doc.año || doc.anio || (doc.fechaPublicacion ? new Date(doc.fechaPublicacion).getFullYear() : undefined),
              anio: doc.anio,
              mes: doc.mes,
              rubro: doc.rubro,
              titulo: doc.rubro || doc.titulo || 'Sin título',
              texto: doc.texto,
              contenido: doc.texto || doc.contenido,
              asunto: doc.asunto,
              promovente: doc.promovente,
              clasificacion: doc.clasificacion,
              ponente: doc.ponente,
              notaPublica: doc.notaPublica,
              anexos: doc.anexos,
              huellaDigital: doc.huellaDigital,
              tipo: 'Voto',
              fechaPublicacion: doc.fechaPublicacion,
              url: doc.url,
              localizacion: doc.localizacion,
              materia: Array.isArray(doc.materias) ? doc.materias.join(', ') : doc.materia
            };
          } else if (endpoint === 'acuerdos') {
            mappedDoc = {
              id: doc.idAcuerdo || doc.id || id,
              idAcuerdo: doc.idAcuerdo,
              fuente: doc.fuente,
              instancia: doc.instancia,
              organo: doc.organoJuris || doc.organo,
              organoJuris: doc.organoJuris,
              epoca: doc.epoca,
              volumen: doc.volumen,
              tomo: doc.tomo,
              año: doc.año || doc.anio || (doc.fechaPublicacion ? new Date(doc.fechaPublicacion).getFullYear() : undefined),
              anio: doc.anio,
              mes: doc.mes,
              rubro: doc.rubro,
              titulo: doc.rubro || doc.titulo || 'Sin título',
              texto: doc.texto,
              contenido: doc.texto || doc.contenido,
              notaPublica: doc.notaPublica,
              anexos: doc.anexos,
              huellaDigital: doc.huellaDigital,
              tipo: 'Acuerdo',
              fechaPublicacion: doc.fechaPublicacion,
              url: doc.url,
              localizacion: doc.localizacion,
              materia: Array.isArray(doc.materias) ? doc.materias.join(', ') : doc.materia
            };
          } else if (endpoint === 'engroses') {
            mappedDoc = {
              id: doc.idEjecutoria || doc.id || id,
              idEjecutoria: doc.idEjecutoria,
              fuente: doc.fuente,
              instancia: doc.instancia,
              organo: doc.organoJuris || doc.organo,
              organoJuris: doc.organoJuris,
              epoca: doc.epoca,
              volumen: doc.volumen,
              tomo: doc.tomo,
              año: doc.año || doc.anio || (doc.fechaPublicacion ? new Date(doc.fechaPublicacion).getFullYear() : undefined),
              anio: doc.anio,
              mes: doc.mes,
              rubro: doc.rubro,
              titulo: doc.rubro || doc.titulo || 'Sin título',
              texto: doc.texto,
              contenido: doc.texto || doc.contenido,
              asunto: doc.asunto,
              tesis: doc.tesis,
              promovente: doc.promovente,
              anexos: doc.anexos,
              huellaDigital: doc.huellaDigital,
              tipo: filters.categoria === 'Sentencia' ? 'Sentencia' : 'Precedente',
              fechaPublicacion: doc.fechaPublicacion,
              url: doc.url,
              localizacion: doc.localizacion,
              materia: Array.isArray(doc.materias) ? doc.materias.join(', ') : doc.materia,
              ponente: doc.ponente,
              expediente: doc.expediente,
              pertenencia: doc.pertenencia,
              ministro: doc.ministro,
              tema: doc.tema,
              organoJurisdiccionalOrigen: doc.organoJurisdiccionalOrigen,
              organoResolvio: doc.organoResolvio,
              fechaResolucion: doc.fechaResolucion,
              resolucion: doc.resolucion,
              urlInternet: doc.urlInternet,
              votacion: doc.votacion,
              asuntosAcumulados: doc.asuntosAcumulados
            };
          } else {
            // Bloque para tipos genéricos
            let tipoDoc: SCJNDocument['tipo'];
            switch (endpoint) {
              case 'tesis':
                tipoDoc = 'Tesis';
                break;
              case 'votos':
                tipoDoc = 'Voto';
                break;
              case 'acuerdos':
                tipoDoc = 'Acuerdo';
                break;
              case 'engroses':
                tipoDoc = 'Engrose';
                break;
              case 'sentencias':
                tipoDoc = 'Sentencia';
                break;
              case 'versiones-taquigraficas':
                tipoDoc = 'VersionTaquigrafica';
                break;
              default:
                tipoDoc = 'Tesis';
            }
            mappedDoc = {
              id: doc.id || id,
              titulo: doc.titulo || 'Sin título',
              tipo: tipoDoc,
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
          }
          documents.push(mappedDoc);
        }
      } catch (detailError) {
        console.error(`Error fetching document ${id}:`, detailError);
      }
    }

    // 3. Aplica los filtros sobre los objetos completos según el tipo
    const filteredDocuments = documents.filter(doc => {
      switch (endpoint) {
        case 'tesis':
          if (filters.epoca && doc.epoca !== filters.epoca) return false;
          if (filters.año && doc.año !== filters.año && doc.anio !== filters.año) return false;
          if (filters.instancia && doc.instancia !== filters.instancia) return false;
          if (filters.organo && doc.organo !== filters.organo && doc.organoJuris !== filters.organo) return false;
          if (filters.materia && doc.materia && !doc.materia.includes(filters.materia)) return false;
          if (filters.asunto && doc.asunto !== filters.asunto) return false;
          if (filters.ponente && doc.ponente !== filters.ponente) return false;
          if (filters.tipo && doc.tipoTesis !== filters.tipo) return false;
          break;
        case 'ejecutoria':
          if (filters.epoca && doc.epoca !== filters.epoca) return false;
          if (filters.año && doc.año !== filters.año && doc.anio !== filters.año) return false;
          if (filters.instancia && doc.instancia !== filters.instancia) return false;
          if (filters.organo && doc.organo !== filters.organo && doc.organoJuris !== filters.organo) return false;
          if (filters.asunto && doc.asunto !== filters.asunto) return false;
          break;
        case 'votos':
          if (filters.epoca && doc.epoca !== filters.epoca) return false;
          if (filters.instancia && doc.instancia !== filters.instancia) return false;
          if (filters.organo && doc.organo !== filters.organo && doc.organoJuris !== filters.organo) return false;
          if (filters.tipo && doc.tipo !== filters.tipo) return false;
          if (filters.ponente && doc.emisor !== filters.ponente && doc.ponente !== filters.ponente) return false;
          break;
        case 'acuerdos':
          if (filters.epoca && doc.epoca !== filters.epoca) return false;
          if (filters.año && doc.año !== filters.año && doc.anio !== filters.año) return false;
          if (filters.organo && doc.organo !== filters.organo && doc.organoJuris !== filters.organo) return false;
          if (filters.instancia && doc.instancia !== filters.instancia) return false;
          break;
        case 'engroses':
          if (filters.epoca && doc.epoca !== filters.epoca) return false;
          if (filters.año && doc.año !== filters.año && doc.anio !== filters.año) return false;
          if (filters.instancia && doc.instancia !== filters.instancia) return false;
          if (filters.organo && doc.organo !== filters.organo && doc.organoJuris !== filters.organo) return false;
          if (filters.asunto && doc.asunto !== filters.asunto) return false;
           if (filters.tipo && doc.tipoAsunto !== filters.tipo && doc.tipo !== filters.tipo) return false;
          break;
        default:
          break;
      }
      return true;
    });

    return { documents: filteredDocuments, total: filteredDocuments.length };
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

export const searchDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const filters: SearchFilters = {
      fuente: req.query.fuente as 'SJF' | 'SIJ',
      categoria: req.query.categoria as string,
      palabraClave: req.query.palabraClave as string,
      epoca: req.query.epoca as string,
      año: req.query.año ? parseInt(req.query.año as string) : undefined,
      instancia: req.query.instancia as string,
      organo: req.query.organo as string,
      materia: req.query.materia as string,
      asunto: req.query.asunto as string,
      ponente: req.query.ponente as string,
      tipo: req.query.tipo as string,
      fechaInicio: req.query.fechaInicio as string,
      fechaFin: req.query.fechaFin as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20
    };
    console.log('Filtros recibidos en searchDocuments:', filters);
    // Validar filtros básicos
    if (!filters.fuente || !filters.categoria) {
      return res.status(400).json({ message: 'Fuente y categoría son requeridos' });
    }
    let results: { documents: SCJNDocument[], total: number } = { documents: [], total: 0 };
    // Selección de endpoint según fuente y categoría
    if (filters.fuente === 'SJF') {
  if (filters.categoria === 'Tesis') {
  results = await fetchSCJNDocuments('tesis', filters);
} else if (filters.categoria === 'Precedente') {
  results = await fetchSCJNDocuments('ejecutoria', filters);
} else if (['Voto', 'Votos'].includes(filters.categoria)) {
  results = await fetchSCJNDocuments('votos', filters);
} else if (['Acuerdo', 'Acuerdos'].includes(filters.categoria)) {
  results = await fetchSCJNDocuments('acuerdos', filters);
} else {
        // SJF: buscar en todos los endpoints relevantes
        try {
          const tesisResults = await fetchSCJNDocuments('tesis', filters);
          const votosResults = await fetchSCJNDocuments('votos', filters);
          const acuerdosResults = await fetchSCJNDocuments('acuerdos', filters);
          results = {
            documents: [...tesisResults.documents, ...votosResults.documents, ...acuerdosResults.documents],
            total: tesisResults.total + votosResults.total + acuerdosResults.total
          };
        } catch (error) {
          results = await fetchSCJNDocuments('tesis', filters);
        }
      }
    } else if (filters.fuente === 'SIJ') {
      if (['Precedente', 'Sentencia'].includes(filters.categoria)) {
        results = await fetchSCJNDocuments('engroses', filters);
      } else {
        // SIJ: buscar en engroses por defecto (puedes agregar más endpoints si SIJ los tiene)
        results = await fetchSCJNDocuments('engroses', filters);
      }
    }
    // Advertencia si hay demasiados resultados
    let warning = null;
    if (results.total > 100) {
      warning = `Se encontraron ${results.total} documentos. Mostrando los primeros 20. Considera refinar tu búsqueda para obtener resultados más específicos.`;
    }
    console.log('Resultados enviados:', results.documents);
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
    res.status(500).json({ success: false, message, documents: [], total: 0 });
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