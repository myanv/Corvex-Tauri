'use client'
import React, { useEffect, useState } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/cjs/Page/AnnotationLayer.css';
import 'react-pdf/dist/cjs/Page/TextLayer.css';

import { invoke } from '@tauri-apps/api/core';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface LaTeXRendererProps {
  content: string;
}

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export const LaTeXRenderer: React.FC<LaTeXRendererProps> = ({ content }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);  
  } 

  const generatePDF = async () => {
    try {
      
      const pdfBytes = await invoke<Uint8Array>('generate_pdf', { content });
      if (pdfBytes) {
        const pdfBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
        const pdfBlobUrl = URL.createObjectURL(pdfBlob);
        setPdfUrl(pdfBlobUrl);
        console.log(pdfBlobUrl);
      } else {
        console.error('Failed to generate PDF.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleDownloadPdf = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="latex-renderer h-full w-full">
        <div>
          <Button onClick={generatePDF}>Compile</Button>
          <Button variant='outline' onClick={handleDownloadPdf}>Download PDF</Button>
        </div>
        {pdfUrl ? (
          <>
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              
            >
              <Page pageNumber={pageNumber} />
            </Document>
            <p>
              Page {pageNumber} of {numPages}
            </p>
          </>
        ) : null}
      </div>
    </ScrollArea>
  );
};
