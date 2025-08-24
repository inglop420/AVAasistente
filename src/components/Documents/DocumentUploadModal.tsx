import React, { useState, useCallback } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import { Document, Expediente } from '../../types';
import { documentsAPI } from '../../services/api';

interface DocumentUploadModalProps {
  category: 'document' | 'template';
  expedientes: Expediente[];
  onSuccess: (document: Document) => void;
  onClose: () => void;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  category,
  expedientes,
  onSuccess,
  onClose
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [expedienteId, setExpedienteId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `Tipo de archivo no permitido: ${file.type}`;
    }
    if (file.size > maxFileSize) {
      return `Archivo demasiado grande: ${(file.size / 1024 / 1024).toFixed(2)}MB (máx. 10MB)`;
    }
    return null;
  };

  const handleFileSelect = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      alert('Errores en archivos:\n' + errors.join('\n'));
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Selecciona al menos un archivo');
      return;
    }

    if (category === 'document' && !expedienteId) {
      alert('Selecciona un expediente para asociar el documento');
      return;
    }

    setUploading(true);

    try {
      // Upload files one by one
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        
        if (category === 'document' && expedienteId) {
          formData.append('expedienteId', expedienteId);
        }

        const response = await documentsAPI.upload(formData);
        onSuccess(response.data);
      }

      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error al subir archivos. Intenta nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('image')) return '🖼️';
    if (type.includes('text')) return '📃';
    return '📁';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Subir {category === 'document' ? 'Documento' : 'Plantilla'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Expediente Selection (only for documents) */}
          {category === 'document' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expediente *
              </label>
              <select
                value={expedienteId}
                onChange={(e) => setExpedienteId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar expediente</option>
                {expedientes.map(exp => (
                  <option key={exp.id} value={exp.id}>
                    {exp.title} - {exp.clientName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <span className="text-lg font-medium text-gray-700 mb-2">
                Arrastra archivos aquí o haz clic para seleccionar
              </span>
              <span className="text-sm text-gray-500">
                PDF, DOC, DOCX, JPG, PNG, GIF, TXT (máx. 10MB cada uno)
              </span>
            </label>
          </div>

          {/* File List */}
          {selectedFiles.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Archivos seleccionados ({selectedFiles.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFileIcon(file.type)}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {file.type.split('/')[1]?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 p-1 rounded transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  {category === 'document' ? 'Documentos de Expediente' : 'Plantillas y Formatos'}
                </h4>
                <p className="text-sm text-blue-700">
                  {category === 'document' 
                    ? 'Los documentos se asociarán al expediente seleccionado y estarán disponibles para todos los miembros de tu organización.'
                    : 'Las plantillas estarán disponibles para todos los usuarios de la organización. Solo los superadministradores pueden gestionar plantillas.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading || (category === 'document' && !expedienteId)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Subir {selectedFiles.length > 1 ? `${selectedFiles.length} archivos` : 'archivo'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;