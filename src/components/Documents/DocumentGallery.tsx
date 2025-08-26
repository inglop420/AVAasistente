import React, { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, Download, Trash2, Search, Filter, FolderOpen, File, Plus } from 'lucide-react';
import { Document, Expediente } from '../../types';
import { documentsAPI, expedientesAPI } from '../../services/api';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../contexts/AuthContext';
import DocumentUploadModal from './DocumentUploadModal';
import DocumentViewer from './DocumentViewer';

const DocumentGallery: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterExpediente, setFilterExpediente] = useState('all');
  const [activeTab, setActiveTab] = useState<'documents' | 'templates'>('documents');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const permissions = usePermissions();
  const { user } = useAuth();

  useEffect(() => {
    fetchDocuments();
    fetchExpedientes();
  }, [activeTab]);

  const fetchDocuments = async () => {
    try {
      const response = await documentsAPI.getByCategory(activeTab === 'documents' ? 'document' : 'template');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpedientes = async () => {
    try {
      const response = await expedientesAPI.getAll();
      setExpedientes(response.data);
    } catch (error) {
      console.error('Error fetching expedientes:', error);
    }
  };

  const filteredDocuments = documents.filter(doc => {
  const matchesSearch =
    doc.originalName &&
    doc.originalName.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesType =
    filterType === 'all' ||
    (doc.type && doc.type.toLowerCase() === filterType.toLowerCase());

  const matchesExpediente =
    filterExpediente === 'all' || doc.expedienteId === filterExpediente;

  return matchesSearch && matchesType && matchesExpediente;
});

  const documentTypes = ['all', 'pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png', 'gif', 'txt'];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setShowUploadModal(true);
    }
  }, []);

  const handleUploadSuccess = (newDocument: Document) => {
    setDocuments(prev => [newDocument, ...prev]);
    setShowUploadModal(false);
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      const response = await documentsAPI.download(doc.id);
      
      // Create blob and download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error al descargar documento');
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      try {
        await documentsAPI.delete(docId);
        setDocuments(documents.filter(doc => doc.id !== docId));
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Error al eliminar documento');
      }
    }
  };

  const getFileIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    switch (lowerType) {
      case 'pdf':
        return '📄';
      case 'docx':
      case 'doc':
        return '📝';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'txt':
        return '📃';
      default:
        return '📁';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canUpload = activeTab === 'documents' ? permissions.documents.create : user?.role === 'superadmin';
  const canDelete = (doc: Document) => {
    if (doc.category === 'template') {
      return user?.role === 'superadmin';
    }
    return permissions.documents.delete;
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando documentos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Documentos</h1>
            <p className="text-gray-600 mt-1">Organiza y gestiona tus archivos jurídicos</p>
          </div>
          
          {canUpload && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Subir {activeTab === 'documents' ? 'Documento' : 'Plantilla'}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('documents')}
                className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'documents'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <File className="w-4 h-4" />
                Documentos de Expedientes
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'templates'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                Formatos y Plantillas
              </button>
            </nav>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              {documentTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'Todos los tipos' : type.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'documents' && (
            <select
              value={filterExpediente}
              onChange={(e) => setFilterExpediente(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">Todos los expedientes</option>
              {expedientes.map(exp => (
                <option key={exp.id} value={exp.id}>
                  {exp.title} - {exp.clientName}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Drag and Drop Zone */}
        {canUpload && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 mb-8 text-center transition-colors duration-200 ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Arrastra {activeTab === 'documents' ? 'documentos' : 'plantillas'} aquí o
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
            >
              selecciona archivos
            </button>
            <p className="text-xs text-gray-500 mt-1">
              PDF, DOC, DOCX, JPG, PNG, TXT (máx. 10MB cada uno)
            </p>
          </div>
        )}

        {/* Document Grid */}
        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{getFileIcon(document.type)}</div>
                  <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {document.type.toUpperCase()}
                  </div>
                </div>
                
                <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2" title={document.originalName}>
                  {document.originalName}
                </h3>
                
                <div className="space-y-1 text-xs text-gray-500 mb-4">
                  <p>Tamaño: {formatFileSize(document.size)}</p>
                  <p>Subido: {new Date(document.uploadedAt).toLocaleDateString('es-ES')}</p>
                  {document.expedienteTitle && (
                    <p className="text-blue-600 font-medium" title={document.expedienteTitle}>
                      📁 {document.expedienteTitle.length > 20 
                        ? document.expedienteTitle.substring(0, 20) + '...' 
                        : document.expedienteTitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleViewDocument(document)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="Ver documento"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadDocument(document)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  {canDelete(document) && (
                    <button
                      onClick={() => handleDeleteDocument(document.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay {activeTab === 'documents' ? 'documentos' : 'plantillas'} disponibles
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterType !== 'all' || filterExpediente !== 'all'
                ? 'No se encontraron archivos que coincidan con los filtros.'
                : activeTab === 'documents' 
                  ? 'Comienza subiendo documentos relacionados a tus expedientes.'
                  : user?.role === 'superadmin'
                    ? 'Sube plantillas y formatos para que estén disponibles para todos los usuarios.'
                    : 'No hay plantillas disponibles aún.'
              }
            </p>
            {canUpload && (searchTerm === '' && filterType === 'all' && filterExpediente === 'all') && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Subir {activeTab === 'documents' ? 'Documento' : 'Plantilla'}
              </button>
            )}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <DocumentUploadModal
            category={activeTab === 'documents' ? 'document' : 'template'}
            expedientes={expedientes}
            onSuccess={handleUploadSuccess}
            onClose={() => setShowUploadModal(false)}
          />
        )}

        {/* Document Viewer */}
        {selectedDocument && (
          <DocumentViewer
            document={selectedDocument}
            onClose={() => setSelectedDocument(null)}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentGallery;