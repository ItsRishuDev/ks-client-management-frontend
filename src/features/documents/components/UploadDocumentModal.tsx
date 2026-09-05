import React, { useState, useRef } from 'react';
import { Dialog } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { useClientsList } from '../../clients/hooks/useClients';
import { useUploadDocumentMutation } from '../hooks/useDocuments';
import { useToast } from '../../../components/ui/useToast';
import { formatFileSize } from './documentBadges';
import {
  DOCUMENT_TYPE_LABELS,
  type DocumentRequisition,
  type DocumentType,
} from '../../../types/document';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedRequisition?: DocumentRequisition | null;
  preselectedClientId?: string;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  preselectedRequisition,
  preselectedClientId,
}) => {
  const { success, error: toastError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadDocumentMutation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clientId, setClientId] = useState(
    preselectedRequisition?.client || preselectedClientId || ''
  );
  const [documentType, setDocumentType] = useState<DocumentType>(
    preselectedRequisition?.document_type || 'SALES_REGISTER'
  );
  const [errorMsg, setErrorMsg] = useState('');

  const { data: clientsData, isLoading: isLoadingClients } = useClientsList({ page_size: 100 });
  const clients = clientsData?.items || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Max 25 MB limit check
      if (file.size > 25 * 1024 * 1024) {
        setErrorMsg('File size exceeds the 25 MB limit.');
        return;
      }
      setSelectedFile(file);
      setErrorMsg('');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 25 * 1024 * 1024) {
        setErrorMsg('File size exceeds the 25 MB limit.');
        return;
      }
      setSelectedFile(file);
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveClientId = preselectedRequisition?.client || clientId;
    if (!effectiveClientId) {
      setErrorMsg('Please select a client.');
      return;
    }
    if (!selectedFile) {
      setErrorMsg('Please select a file to upload.');
      return;
    }

    try {
      setErrorMsg('');
      await uploadMutation.mutateAsync({
        file: selectedFile,
        payload: {
          client_id: effectiveClientId,
          entity_id: preselectedRequisition?.entity || undefined,
          gst_registration_id: preselectedRequisition?.gst_registration || undefined,
          compliance_id: preselectedRequisition?.compliance || undefined,
          document_requisition_id: preselectedRequisition?.id || undefined,
          document_type: documentType,
        },
      });

      success(`Document '${selectedFile.name}' uploaded successfully.`);
      setSelectedFile(null);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload document.';
      setErrorMsg(msg);
      toastError(msg);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={preselectedRequisition ? `Upload Document for Requisition` : 'Upload Document'}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {errorMsg && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: 'var(--color-danger-700)',
              padding: '0.75rem',
              borderRadius: '6px',
              fontSize: '0.875rem',
            }}
          >
            {errorMsg}
          </div>
        )}

        {preselectedRequisition && (
          <div
            style={{
              backgroundColor: 'var(--color-primary-50)',
              border: '1px solid var(--color-primary-200)',
              borderRadius: '6px',
              padding: '0.75rem',
              fontSize: '0.8125rem',
              color: 'var(--color-primary-900)',
            }}
          >
            <strong>Fulfilling Requisition:</strong> {preselectedRequisition.description || DOCUMENT_TYPE_LABELS[preselectedRequisition.document_type]}
            <br />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-700)' }}>
              Client: {preselectedRequisition.client_name}
            </span>
          </div>
        )}

        {!preselectedRequisition && (
          <Select
            label="Client *"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            disabled={isLoadingClients || !!preselectedClientId}
            required
          >
            <option value="">Select Client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.display_name || c.legal_name} ({c.client_code})
              </option>
            ))}
          </Select>
        )}

        <Select
          label="Document Type *"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as DocumentType)}
          required
        >
          {Object.entries(DOCUMENT_TYPE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </Select>

        {/* File Dropzone Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--color-slate-300)',
            borderRadius: '8px',
            padding: '1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: selectedFile ? 'var(--color-slate-50)' : '#ffffff',
            transition: 'border-color 0.2s, background-color 0.2s',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {selectedFile ? (
            <div>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📄</div>
              <div style={{ fontWeight: 600, color: 'var(--color-slate-900)' }}>
                {selectedFile.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown MIME'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-600)', marginTop: '6px' }}>
                Click or drag another file to replace
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>☁️</div>
              <div style={{ fontWeight: 600, color: 'var(--color-slate-800)', fontSize: '0.9375rem' }}>
                Choose a file or drag and drop here
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '4px' }}>
                PDF, Excel (.xlsx, .xls), CSV, Images up to 25 MB
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={uploadMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={uploadMutation.isPending}
            disabled={!selectedFile}
          >
            Upload File
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
