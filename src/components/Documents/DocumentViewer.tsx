import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, FileText, AlertCircle } from 'lucide-react';
import { Document as PDFDocument, Page, pdfjs } from 'react-pdf';
import { Document } from '../../types';
import { documentsAPI } from '../../services/api';


// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onClose }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pageWidth, setPageWidth] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        // leave some padding
        setPageWidth(Math.floor(w * 0.95));
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [fileUrl]);

  useEffect(() => {
    loadDocument();
    return () => {
      // Cleanup blob URL if created
      if (fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [document.id]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For images and PDFs, we can create a blob URL
      if (isViewableType(document.type)) {
        const response = await documentsAPI.download(document.id);
        const blob = new Blob([response.data], { type: getContentType(document.type) });
        const url = URL.createObjectURL(blob);
        setFileUrl(url);
      }
    } catch (error) {
      console.error('Error loading document:', error);
      setError('Error al cargar el documento');
    } finally {
      setLoading(false);
    }
  };

  const isViewableType = (type: string): boolean => {
    const viewableTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt'];
    return viewableTypes.includes(type.toLowerCase());
  };

  const getContentType = (type: string): string => {
    const contentTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'txt': 'text/plain'
    };
    return contentTypes[type.toLowerCase()] || 'application/octet-stream';
  };

  const handleDownload = async () => {
    try {
      const response = await documentsAPI.download(document.id);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.originalName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error al descargar documento');
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setError('Error al cargar el PDF');
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(3.0, prev + 0.2));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.2));
  };

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const resetView = () => {
    setScale(1.0);
    setRotation(0);
    setPageNumber(1);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando documento...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleDownload}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Descargar archivo
            </button>
          </div>
        </div>
      );
    }

    const docType = document.type.toLowerCase();

    // PDF Viewer
    if (docType === 'pdf') {
      return (
        <div className="flex flex-col items-center w-full" ref={containerRef}>
          <PDFDocument
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              // prefer width on small screens so PDF fits container; fallback to scale on very large screens
              width={pageWidth}
              rotate={rotation}
              loading={
                <div className="flex items-center justify-center h-96">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              }
            />
          </PDFDocument>
        </div>
      );
    }

    // Image Viewer
    if (['jpg', 'jpeg', 'png', 'gif'].includes(docType)) {
      return (
        <div className="flex justify-center">
          <img
            src={fileUrl}
            alt={document.originalName}
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              maxWidth: '100%',
              maxHeight: '70vh',
              objectFit: 'contain'
            }}
            className="transition-transform duration-200"
          />
        </div>
      );
    }

    // Text Viewer
    if (docType === 'txt') {
      return (
        <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto">
          <iframe
            src={fileUrl}
            className="w-full h-80 border-none"
            title={document.originalName}
          />
        </div>
      );
    }

    // Unsupported file type
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Vista previa no disponible</h3>
          <p className="text-gray-600 mb-4">
            Este tipo de archivo ({document.type.toUpperCase()}) no se puede visualizar en el navegador.
          </p>
          <button
            onClick={handleDownload}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 mx-auto"
          >
            <Download className="w-4 h-4" />
            Descargar para ver
          </button>
        </div>
      </div>
    );
  };

  const showControls = isViewableType(document.type) && !loading && !error;
  const isPDF = document.type.toLowerCase() === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(document.type.toLowerCase());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-lg shadow-xl w-full max-w-full sm:max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{document.type === 'pdf' ? '📄' : document.type === 'jpg' || document.type === 'jpeg' || document.type === 'png' || document.type === 'gif' ? '🖼️' : '📁'}</div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{document.originalName}</h2>
              <p className="text-sm text-gray-600">
                {document.type.toUpperCase()} • {(document.size / 1024 / 1024).toFixed(2)} MB
                {document.expedienteTitle && ` • ${document.expedienteTitle}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              title="Descargar"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Controls */}
        {showControls && (
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              {/* PDF Navigation */}
              {isPDF && numPages > 0 && (
                <>
                  <button
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    title="Página anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 px-2">
                    {pageNumber} de {numPages}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                    className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    title="Página siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-2"></div>
                </>
              )}

              {/* Zoom Controls */}
              {(isPDF || isImage) && (
                <>
                  <button
                    onClick={zoomOut}
                    disabled={scale <= 0.5}
                    className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    title="Alejar"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 px-2">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={zoomIn}
                    disabled={scale >= 3.0}
                    className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    title="Acercar"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Rotation Control */}
              {(isPDF || isImage) && (
                <>
                  <div className="w-px h-6 bg-gray-300 mx-2"></div>
                  <button
                    onClick={rotate}
                    className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    title="Rotar"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            <button
              onClick={resetView}
              className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors duration-200"
            >
              Restablecer vista
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          <div className="min-h-full flex items-center justify-center">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;