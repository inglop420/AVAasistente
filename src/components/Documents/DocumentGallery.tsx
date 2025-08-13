import React, { useState, useCallback } from 'react';
import { useEffect } from 'react';
import { Upload, FileText, Download, Eye, Trash2, Search, Filter } from 'lucide-react';
import { Document } from '../../types';
import { documentsAPI } from '../../services/api';
import { usePermissions } from '../../hooks/usePermissions';

const DocumentGallery: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const permissions = usePermissions();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await documentsAPI.getAll();
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || doc.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const documentTypes = ['all', 'pdf', 'docx', 'jpg', 'png'];

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
    handleFileUpload(files);
  }, []);

  const handleFileUpload = async (files: File[]) => {
    for (const file of files) {
      try {
        const documentData = {
          name: file.name,
          type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
          url: URL.createObjectURL(file), // In production, upload to cloud storage
          size: file.size
        };
        
        const response = await documentsAPI.create(documentData);
        setDocuments(prev => [response.data, ...prev]);
      } catch (error) {
        console.error('Error uploading document:', error);
        alert(`Error al subir ${file.name}`);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      handleFileUpload(files);
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
    switch (type.toLowerCase()) {
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
      default:
        return '📁';
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
            <p className="text-gray-600 mt-1">Gestiona tus archivos y documentos</p>
          </div>
          
          {permissions.documents.create && (
            <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              Subir Documento
              <input
                type="file"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              />
            </label>
          )}
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
                  {type === 'all' ? 'Todos' : type.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        {permissions.documents.create && (
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
            <p className="text-gray-600 mb-2">Arrastra archivos aquí o</p>
            <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
              selecciona archivos
              <input
                type="file"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              />
            </label>
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
                    {document.type}
                  </div>
                </div>
                
                <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                  {document.name}
                </h3>
                
                <p className="text-xs text-gray-500 mb-4">
                  {new Date(document.uploadedAt || document.createdAt).toLocaleDateString('es-ES')}
                </p>

                <div className="flex items-center justify-center gap-2">
                  <button
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="Ver documento"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {permissions.documents.delete && (
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
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all' 
                ? 'No se encontraron documentos que coincidan con los filtros.'
                : 'No hay documentos subidos aún.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentGallery;