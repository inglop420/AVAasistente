import React, { useState } from 'react';
import { Search, Filter, Book, Eye, Download, ChevronDown, ChevronUp, AlertTriangle, FileText, Calendar, Building, User, Scale } from 'lucide-react';
import { SCJNDocument, SCJNSearchFilters } from '../../types';
import { scjnAPI } from '../../services/api';

const LibraryView: React.FC = () => {
  const [searchResults, setSearchResults] = useState<SCJNDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<SCJNDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<SCJNSearchFilters>({
    fuente: 'SJF',
    categoria: 'Tesis',
    palabraClave: '',
    epoca: '',
    año: undefined,
    instancia: '',
    organo: '',
    materia: '',
    asunto: '',
    ponente: '',
    tipo: '',
    emisor: '',
    formasIntegracion: '',
    tipoAsunto: '',
    organoRadicacion: '',
    fechaInicio: '',
    fechaFin: '',
    page: 1,
    limit: 20
  });

  // Opciones de filtros
  const fuenteOptions = [
    { value: 'SJF', label: 'SJF - Semanario Judicial de la Federación' },
    { value: 'SIJ', label: 'SIJ - Sistema de Informática Jurídica' }
  ];

  const categoriaOptions = {
    SJF: [
      { value: 'Tesis', label: 'Tesis' },
      { value: 'Precedente', label: 'Precedente (Sentencias)' },
      { value: 'Votos', label: 'Votos' },
      { value: 'Acuerdos', label: 'Acuerdos' }
    ],
    SIJ: [
      { value: 'Sentencia', label: 'Sentencia' },
      { value: 'Versiones', label: 'Versiones taquigráficas' }
    ]
  };

  const epocaOptions = [
    { value: 'Quinta', label: 'Quinta Época' },
    { value: 'Sexta', label: 'Sexta Época' },
    { value: 'Séptima', label: 'Séptima Época' },
    { value: 'Octava', label: 'Octava Época' },
    { value: 'Novena', label: 'Novena Época' },
    { value: 'Décima', label: 'Décima Época' },
    { value: 'Undécima', label: 'Undécima Época' }
  ];

  const instanciaOptions = [
    { value: 'Pleno', label: 'Pleno' },
    { value: 'Primera Sala', label: 'Primera Sala' },
    { value: 'Segunda Sala', label: 'Segunda Sala' },
    { value: 'Tribunales Colegiados', label: 'Tribunales Colegiados' },
    { value: 'Tribunales Unitarios', label: 'Tribunales Unitarios' },
    { value: 'Juzgados de Distrito', label: 'Juzgados de Distrito' }
  ];

  const materiaOptions = [
    { value: 'Constitucional', label: 'Constitucional' },
    { value: 'Civil', label: 'Civil' },
    { value: 'Penal', label: 'Penal' },
    { value: 'Administrativa', label: 'Administrativa' },
    { value: 'Laboral', label: 'Laboral' },
    { value: 'Mercantil', label: 'Mercantil' },
    { value: 'Fiscal', label: 'Fiscal' },
    { value: 'Familiar', label: 'Familiar' }
  ];

  const tipoAsuntoOptions = [
    { value: 'Acción de Inconstitucionalidad', label: 'Acción de Inconstitucionalidad' },
    { value: 'Amparo directo', label: 'Amparo directo' },
    { value: 'Amparo en revisión', label: 'Amparo en revisión' },
    { value: 'Controversia constitucional', label: 'Controversia constitucional' },
    { value: 'Recurso de revisión', label: 'Recurso de revisión' }
  ];

  const tipoVotoOptions = [
    { value: 'Particular', label: 'Voto Particular' },
    { value: 'Concurrente', label: 'Voto Concurrente' },
    { value: 'Disidente', label: 'Voto Disidente' }
  ];

  const formasIntegracionOptions = [
    { value: 'Jurisprudencia', label: 'Jurisprudencia' },
    { value: 'Tesis Aislada', label: 'Tesis Aislada' },
    { value: 'Criterio Relevante', label: 'Criterio Relevante' }
  ];

  // Función para obtener filtros dinámicos según la categoría
  const getDynamicFilters = () => {
    const { fuente, categoria } = filters;
    
    if (fuente === 'SJF') {
      switch (categoria) {
        case 'Tesis':
          return ['epoca', 'año', 'instancia', 'organo', 'materia', 'asunto', 'ponente', 'tipo', 'formasIntegracion'];
        case 'Precedente':
          return ['epoca', 'año', 'instancia', 'organo', 'asunto'];
        case 'Votos':
          return ['epoca', 'instancia', 'organo', 'tipo', 'emisor'];
        case 'Acuerdos':
          return ['epoca', 'año', 'organo', 'instancia'];
        default:
          return ['epoca', 'año', 'instancia', 'organo', 'materia'];
      }
    } else if (fuente === 'SIJ') {
      switch (categoria) {
        case 'Sentencia':
          return ['tipoAsunto', 'organoRadicacion', 'ponente', 'año'];
        case 'Versiones':
          return ['instancia', 'año'];
        default:
          return ['instancia', 'año'];
      }
    }
    
    return [];
  };
  const handleFilterChange = (field: keyof SCJNSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      // Reset página al cambiar filtros
      page: 1
    }));
    setCurrentPage(1);
  };

  const handleFuenteChange = (fuente: 'SJF' | 'SIJ') => {
    setFilters(prev => ({
      ...prev,
      fuente,
      categoria: fuente === 'SJF' ? 'Tesis' : 'Sentencia',
      page: 1
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters(prev => ({
      ...prev,
      page
    }));
  };
  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setWarning(null);
    
    try {
      const searchFilters = {
        ...filters,
        page: currentPage
      };
      
      const response = await scjnAPI.search(searchFilters);
      
      if (response.data.success) {
        setSearchResults(response.data.documents);
        setTotalResults(response.data.total);
        setTotalPages(Math.ceil(response.data.total / (searchFilters.limit || 20)));
        setWarning(response.data.warning);
      } else {
        setError(response.data.message || 'Error en la búsqueda');
        setSearchResults([]);
        setTotalResults(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Error al conectar con la API de SCJN. Intenta nuevamente.');
      setSearchResults([]);
      setTotalResults(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (document: SCJNDocument) => {
    try {
      const response = await scjnAPI.getDocumentDetail(
        document.tipo === 'Tesis' ? 'tesis' : 'engroses',
        document.id
      );
      
      if (response.data.success) {
        setSelectedDocument(response.data.document);
      }
    } catch (error) {
      console.error('Error fetching document detail:', error);
      alert('Error al cargar el detalle del documento');
    }
  };

  const handleDownloadResults = async () => {
    try {
      const response = await scjnAPI.downloadResults(searchResults);
      
      // Crear blob y descargar
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scjn-resultados-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Error al descargar resultados');
    }
  };

  const clearFilters = () => {
    setFilters({
      fuente: 'SJF',
      categoria: 'Tesis',
      palabraClave: '',
      epoca: '',
      año: undefined,
      instancia: '',
      organo: '',
      materia: '',
      asunto: '',
      ponente: '',
      tipo: '',
      emisor: '',
      formasIntegracion: '',
      tipoAsunto: '',
      organoRadicacion: '',
      fechaInicio: '',
      fechaFin: '',
      page: 1,
      limit: 20
    });
    setSearchResults([]);
    setTotalResults(0);
    setTotalPages(0);
    setCurrentPage(1);
    setWarning(null);
    setError(null);
  };

  const getDocumentTypeColor = (tipo: string) => {
    return tipo === 'Tesis' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => currentYear - i);

  const dynamicFilters = getDynamicFilters();

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Primera
        </button>
        
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>

        {pages.map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-2 text-sm border rounded-lg ${
              page === currentPage
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
        
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Última
        </button>
      </div>
    );
  };
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Biblioteca Jurídica SCJN</h1>
          <p className="text-gray-600">Búsqueda avanzada en el repositorio oficial de la Suprema Corte de Justicia de la Nación</p>
        </div>

        {/* Formulario de Búsqueda */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          {/* Búsqueda Principal */}
          <div className="space-y-6">
            {/* Palabra Clave */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Búsqueda por palabra clave
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.palabraClave}
                  onChange={(e) => handleFilterChange('palabraClave', e.target.value)}
                  placeholder="Buscar en títulos, rubros y contenido..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Fuente y Categoría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuente de información
                </label>
                <select
                  value={filters.fuente}
                  onChange={(e) => handleFuenteChange(e.target.value as 'SJF' | 'SIJ')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {fuenteOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={filters.categoria}
                  onChange={(e) => handleFilterChange('categoria', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categoriaOptions[filters.fuente].map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtros Avanzados */}
            <div>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                <Filter className="w-4 h-4" />
                Filtros avanzados
                {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvancedFilters && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Época */}
                    {dynamicFilters.includes('epoca') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Época
                        </label>
                        <select
                          value={filters.epoca}
                          onChange={(e) => handleFilterChange('epoca', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Todas las épocas</option>
                          {epocaOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Año */}
                    {dynamicFilters.includes('año') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Año
                        </label>
                        <select
                          value={filters.año || ''}
                          onChange={(e) => handleFilterChange('año', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Todos los años</option>
                          {yearOptions.map(year => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Instancia */}
                    {dynamicFilters.includes('instancia') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Instancia
                        </label>
                        <select
                          value={filters.instancia}
                          onChange={(e) => handleFilterChange('instancia', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Todas las instancias</option>
                          {instanciaOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Órgano */}
                    {dynamicFilters.includes('organo') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Órgano
                        </label>
                        <input
                          type="text"
                          value={filters.organo}
                          onChange={(e) => handleFilterChange('organo', e.target.value)}
                          placeholder="Nombre del órgano"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    {/* Materia */}
                    {dynamicFilters.includes('materia') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Materia
                        </label>
                        <select
                          value={filters.materia}
                          onChange={(e) => handleFilterChange('materia', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Todas las materias</option>
                          {materiaOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Asunto */}
                    {dynamicFilters.includes('asunto') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Asunto
                        </label>
                        <input
                          type="text"
                          value={filters.asunto}
                          onChange={(e) => handleFilterChange('asunto', e.target.value)}
                          placeholder="Descripción del asunto"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    {/* Ponente */}
                    {dynamicFilters.includes('ponente') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ponente
                        </label>
                        <input
                          type="text"
                          value={filters.ponente}
                          onChange={(e) => handleFilterChange('ponente', e.target.value)}
                          placeholder="Nombre del ponente"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    {/* Tipo */}
                    {dynamicFilters.includes('tipo') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {filters.categoria === 'Votos' ? 'Tipo de Voto' : 'Tipo'}
                        </label>
                        {filters.categoria === 'Votos' ? (
                          <select
                            value={filters.tipo}
                            onChange={(e) => handleFilterChange('tipo', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Todos los tipos</option>
                            {tipoVotoOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={filters.tipo}
                            onChange={(e) => handleFilterChange('tipo', e.target.value)}
                            placeholder="Tipo de documento"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        )}
                      </div>
                    )}

                    {/* Emisor (para Votos) */}
                    {dynamicFilters.includes('emisor') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Emisor
                        </label>
                        <input
                          type="text"
                          value={filters.emisor}
                          onChange={(e) => handleFilterChange('emisor', e.target.value)}
                          placeholder="Nombre del emisor"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    {/* Formas de Integración (para Tesis) */}
                    {dynamicFilters.includes('formasIntegracion') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Formas de Integración
                        </label>
                        <select
                          value={filters.formasIntegracion}
                          onChange={(e) => handleFilterChange('formasIntegracion', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Todas las formas</option>
                          {formasIntegracionOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Tipo de Asunto (para SIJ Sentencia) */}
                    {dynamicFilters.includes('tipoAsunto') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Asunto
                        </label>
                        <select
                          value={filters.tipoAsunto}
                          onChange={(e) => handleFilterChange('tipoAsunto', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Todos los asuntos</option>
                          {tipoAsuntoOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Órgano de Radicación (para SIJ Sentencia) */}
                    {dynamicFilters.includes('organoRadicacion') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Órgano de Radicación
                        </label>
                        <select
                          value={filters.organoRadicacion}
                          onChange={(e) => handleFilterChange('organoRadicacion', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Todos los órganos</option>
                          {instanciaOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Rango de Fechas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha inicio
                      </label>
                      <input
                        type="date"
                        value={filters.fechaInicio}
                        onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha fin
                      </label>
                      <input
                        type="date"
                        value={filters.fechaFin}
                        onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botones de Acción */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                {loading ? 'Buscando...' : 'Buscar'}
              </button>

              <button
                onClick={clearFilters}
                className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Limpiar filtros
              </button>

              {searchResults.length > 0 && (
                <button
                  onClick={handleDownloadResults}
                  className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Descargar CSV
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Advertencias y Errores */}
        {warning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">Advertencia</h4>
                <p className="text-sm text-yellow-700">{warning}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 mb-1">Error</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Resultados */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header de Resultados */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Resultados de búsqueda
                </h3>
                <div className="text-sm text-gray-600">
                  {totalResults.toLocaleString()} documentos encontrados - Página {currentPage} de {totalPages}
                </div>
              </div>
            </div>

            {/* Tabla de Resultados */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título/Rubro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Época
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instancia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Materia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Año
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchResults.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                          {document.titulo}
                        </div>
                        {document.rubro && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {document.rubro}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-normal md:whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDocumentTypeColor(document.tipo)}`}>
                          {document.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-normal md:whitespace-nowrap text-sm text-gray-600">
                        {document.epoca || '-'}
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-normal md:whitespace-nowrap text-sm text-gray-600">
                        {document.instancia || '-'}
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-normal md:whitespace-nowrap text-sm text-gray-600">
                        {document.materia || '-'}
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-normal md:whitespace-nowrap text-sm text-gray-600">
                        {document.año || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDocument(document)}
                          className="text-blue-600 hover:text-blue-700 flex items-center gap-1 ml-auto transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {renderPagination()}
          </div>
        )}

        {/* Estado Vacío */}
        {!loading && searchResults.length === 0 && !error && (
          <div className="text-center py-12">
            <Scale className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Biblioteca Jurídica SCJN</h3>
            <p className="text-gray-500 mb-6">
              Utiliza los filtros de búsqueda para encontrar tesis, sentencias y documentos jurídicos oficiales.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <h4 className="font-medium text-blue-900 mb-2">Fuentes disponibles:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• SJF: Semanario Judicial de la Federación</li>
                <li>• SIJ: Sistema de Informática Jurídica</li>
              </ul>
            </div>
          </div>
        )}

        {/* Modal de Detalle del Documento */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDocumentTypeColor(selectedDocument.tipo)}`}>
                      {selectedDocument.tipo}
                    </span>
                    {selectedDocument.epoca && (
                      <span className="text-sm text-gray-500">{selectedDocument.epoca}</span>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">
                    {selectedDocument.titulo}
                  </h2>
                  {selectedDocument.rubro && (
                    <p className="text-sm text-gray-600 mt-1">{selectedDocument.rubro}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 ml-4"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Metadatos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  {selectedDocument.instancia && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-sm"><strong>Instancia:</strong> {selectedDocument.instancia}</span>
                    </div>
                  )}
                  {selectedDocument.organo && (
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-gray-500" />
                      <span className="text-sm"><strong>Órgano:</strong> {selectedDocument.organo}</span>
                    </div>
                  )}
                  {selectedDocument.materia && (
                    <div className="flex items-center gap-2">
                      <Book className="w-4 h-4 text-gray-500" />
                      <span className="text-sm"><strong>Materia:</strong> {selectedDocument.materia}</span>
                    </div>
                  )}
                  {selectedDocument.ponente && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm"><strong>Ponente:</strong> {selectedDocument.ponente}</span>
                    </div>
                  )}
                  {selectedDocument.año && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm"><strong>Año:</strong> {selectedDocument.año}</span>
                    </div>
                  )}
                  {selectedDocument.asunto && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm"><strong>Asunto:</strong> {selectedDocument.asunto}</span>
                    </div>
                  )}
                </div>

                {/* Contenido */}
                {selectedDocument.contenido ? (
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contenido</h3>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedDocument.contenido}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Contenido no disponible para este documento</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cerrar
                </button>
                {selectedDocument.url && (
                  <a
                    href={selectedDocument.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver en SCJN
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryView;