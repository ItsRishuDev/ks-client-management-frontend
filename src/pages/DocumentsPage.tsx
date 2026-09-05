import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../../../frontend/src/components/ui/Button';
import { Input } from '../../../frontend/src/components/ui/Input';
import { Select } from '../../../frontend/src/components/ui/Select';
import { Tabs, TabList, Tab, TabPanel } from '../../../frontend/src/components/ui/Tabs';
import { Pagination } from '../../../frontend/src/components/ui/Pagination';
import { EmptyState } from '../../../frontend/src/components/ui/EmptyState';
import { LoadingState } from '../../../frontend/src/components/ui/LoadingState';
import { ErrorState } from '../../../frontend/src/components/ui/ErrorState';
import { useToast } from '../../../frontend/src/components/ui/useToast';
import { useAuth } from '../context/useAuth';
import { userHasPermission } from '../utils/permissions';
import {
  useDocumentList,
  useExpireRequisitionMutation,
  useRequisitionList,
} from '../features/documents/hooks/useDocuments';
import { RequisitionTable } from '../features/documents/components/RequisitionTable';
import { DocumentTable } from '../features/documents/components/DocumentTable';
import { CreateRequisitionModal } from '../features/documents/components/CreateRequisitionModal';
import { UploadDocumentModal } from '../features/documents/components/UploadDocumentModal';
import { DocumentReviewModal } from '../features/documents/components/DocumentReviewModal';
import { RequisitionStatusModal } from '../features/documents/components/RequisitionStatusModal';
import { DocumentDetailModal } from '../features/documents/components/DocumentDetailModal';
import { RequisitionDetailModal } from '../features/documents/components/RequisitionDetailModal';
import { documentsApi } from '../api/documents';
import {
  DOCUMENT_TYPE_LABELS,
  PRIORITY_LABELS,
  type Document,
  type DocumentRequisition,
} from '../types/document';

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'requisitions';
  const setActiveTab = (tab: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  const canUpload = userHasPermission(user, 'documents.upload');
  const canReview = userHasPermission(user, 'documents.review');

  // --- Requisitions State ---
  const [reqPage, setReqPage] = useState(1);
  const [reqSearch, setReqSearch] = useState('');
  const [reqStatus, setReqStatus] = useState('');
  const [reqPriority, setReqPriority] = useState('');
  const [reqDocType, setReqDocType] = useState('');
  const [reqQuickFilter, setReqQuickFilter] = useState<'ALL' | 'REQUESTED' | 'PENDING' | 'RECEIVED' | 'UNDER_REVIEW' | 'ACCEPTED'>('ALL');

  // --- Documents State ---
  const [docPage, setDocPage] = useState(1);
  const [docSearch, setDocSearch] = useState('');
  const [docReviewStatus, setDocReviewStatus] = useState('');
  const [docType, setDocType] = useState('');
  const [docQuickFilter, setDocQuickFilter] = useState<'ALL' | 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED'>('ALL');

  // --- Modal States ---
  const [isCreateReqOpen, setIsCreateReqOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTargetRequisition, setUploadTargetRequisition] = useState<DocumentRequisition | null>(null);
  const [selectedReqForDetail, setSelectedReqForDetail] = useState<DocumentRequisition | null>(null);
  const [selectedReqForStatus, setSelectedReqForStatus] = useState<DocumentRequisition | null>(null);
  const [selectedDocForDetail, setSelectedDocForDetail] = useState<Document | null>(null);
  const [selectedDocForReview, setSelectedDocForReview] = useState<Document | null>(null);

  const expireMutation = useExpireRequisitionMutation();

  // --- Fetch Requisitions ---
  const effectiveReqStatus = reqQuickFilter !== 'ALL' ? reqQuickFilter : reqStatus;
  const {
    data: requisitionsData,
    isLoading: isReqLoading,
    isError: isReqError,
    error: reqError,
    refetch: refetchReqs,
  } = useRequisitionList({
    page: reqPage,
    page_size: 10,
    search: reqSearch.trim() || undefined,
    status: effectiveReqStatus || undefined,
    priority: reqPriority || undefined,
    document_type: reqDocType || undefined,
  });

  // --- Fetch Documents ---
  const effectiveDocReviewStatus = docQuickFilter !== 'ALL' ? docQuickFilter : docReviewStatus;
  const {
    data: documentsData,
    isLoading: isDocLoading,
    isError: isDocError,
    error: docError,
    refetch: refetchDocs,
  } = useDocumentList({
    page: docPage,
    page_size: 10,
    search: docSearch.trim() || undefined,
    review_status: effectiveDocReviewStatus || undefined,
    document_type: docType || undefined,
  });

  // Quick stats queries
  const { data: allReqsData } = useRequisitionList({ page_size: 100 });
  const { data: allDocsData } = useDocumentList({ page_size: 100 });

  const totalOpenReqs = (allReqsData?.items || []).filter(
    (r) => r.status !== 'ACCEPTED' && r.status !== 'EXPIRED'
  ).length;
  const totalPendingReviewDocs = (allDocsData?.items || []).filter(
    (d) => d.review_status === 'PENDING'
  ).length;
  const totalAcceptedDocs = (allDocsData?.items || []).filter(
    (d) => d.review_status === 'ACCEPTED'
  ).length;
  const totalOverdueReqs = (allReqsData?.items || []).filter((r) => {
    if (!r.due_date || r.status === 'ACCEPTED' || r.status === 'EXPIRED') return false;
    const due = new Date(r.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  const handleDownload = async (doc: Document) => {
    try {
      const res = await documentsApi.downloadDocument(doc.id);
      if (res.download_url) {
        window.open(res.download_url, '_blank');
      }
    } catch {
      toastError('Failed to generate download URL.');
    }
  };

  const handleExpire = async (req: DocumentRequisition) => {
    if (window.confirm(`Are you sure you want to expire requisition for ${req.client_name}?`)) {
      try {
        await expireMutation.mutateAsync(req.id);
        success('Document requisition expired.');
        if (selectedReqForDetail?.id === req.id) {
          setSelectedReqForDetail(null);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to expire requisition.';
        toastError(msg);
      }
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="document-page-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-slate-900)', margin: 0 }}>
            Documents & Requisitions
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)', marginTop: '4px' }}>
            Manage client document requests, secure file storage, and verification reviews.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {canUpload && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setUploadTargetRequisition(null);
                  setIsUploadOpen(true);
                }}
              >
                + Upload Document
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsCreateReqOpen(true)}
              >
                + Request Document
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="document-stats-grid">
        <div className="document-stat-card">
          <div className="document-stat-icon" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
            📋
          </div>
          <div className="document-stat-info">
            <span className="document-stat-value">{totalOpenReqs}</span>
            <span className="document-stat-label">Open Requisitions</span>
          </div>
        </div>

        <div className="document-stat-card">
          <div className="document-stat-icon" style={{ backgroundColor: '#fffbeb', color: '#b45309' }}>
            ⏳
          </div>
          <div className="document-stat-info">
            <span className="document-stat-value">{totalPendingReviewDocs}</span>
            <span className="document-stat-label">Pending Verification</span>
          </div>
        </div>

        <div className="document-stat-card">
          <div className="document-stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
            ✓
          </div>
          <div className="document-stat-info">
            <span className="document-stat-value">{totalAcceptedDocs}</span>
            <span className="document-stat-label">Verified Documents</span>
          </div>
        </div>

        <div className="document-stat-card">
          <div className="document-stat-icon" style={{ backgroundColor: '#fef2f2', color: '#b91c1c' }}>
            ⚠️
          </div>
          <div className="document-stat-info">
            <span className="document-stat-value">{totalOverdueReqs}</span>
            <span className="document-stat-label">Overdue Requests</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--color-slate-200)', padding: '1.25rem' }}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabList style={{ marginBottom: '1.25rem' }}>
            <Tab value="requisitions">Document Requisitions ({requisitionsData?.total ?? 0})</Tab>
            <Tab value="documents">Uploaded Documents ({documentsData?.total ?? 0})</Tab>
          </TabList>

          {/* TAB 1: Document Requisitions */}
          <TabPanel value="requisitions">
            {/* Quick Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {(
                [
                  { label: 'All Requests', value: 'ALL' },
                  { label: 'Requested', value: 'REQUESTED' },
                  { label: 'Pending Client', value: 'PENDING' },
                  { label: 'Received', value: 'RECEIVED' },
                  { label: 'Under Review', value: 'UNDER_REVIEW' },
                  { label: 'Accepted', value: 'ACCEPTED' },
                ] as const
              ).map((pill) => (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() => {
                    setReqQuickFilter(pill.value);
                    setReqPage(1);
                  }}
                  style={{
                    fontSize: '0.8125rem',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '20px',
                    border: '1px solid',
                    cursor: 'pointer',
                    fontWeight: reqQuickFilter === pill.value ? 600 : 500,
                    borderColor:
                      reqQuickFilter === pill.value ? 'var(--color-primary-600)' : 'var(--color-slate-300)',
                    backgroundColor:
                      reqQuickFilter === pill.value ? 'var(--color-primary-50)' : '#ffffff',
                    color:
                      reqQuickFilter === pill.value ? 'var(--color-primary-800)' : 'var(--color-slate-700)',
                    transition: 'all 0.15s ease-in-out',
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Filter Bar */}
            <div className="document-toolbar">
              <div style={{ flex: '1 1 280px', maxWidth: '360px' }}>
                <Input
                  placeholder="Search by client, GSTIN, description..."
                  value={reqSearch}
                  onChange={(e) => {
                    setReqSearch(e.target.value);
                    setReqPage(1);
                  }}
                />
              </div>

              <div className="document-filter-group">
                <Select
                  value={reqPriority}
                  onChange={(e) => {
                    setReqPriority(e.target.value);
                    setReqPage(1);
                  }}
                >
                  <option value="">All Priorities</option>
                  {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label} Priority
                    </option>
                  ))}
                </Select>

                <Select
                  value={reqDocType}
                  onChange={(e) => {
                    setReqDocType(e.target.value);
                    setReqPage(1);
                  }}
                >
                  <option value="">All Document Types</option>
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </Select>

                {(reqSearch || reqPriority || reqDocType || reqQuickFilter !== 'ALL') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReqSearch('');
                      setReqPriority('');
                      setReqDocType('');
                      setReqQuickFilter('ALL');
                      setReqStatus('');
                      setReqPage(1);
                    }}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Content States */}
            {isReqLoading && <LoadingState message="Loading document requisitions..." />}
            {isReqError && (
              <ErrorState
                title="Failed to load requisitions"
                description={reqError instanceof Error ? reqError.message : 'Unknown error'}
                onRetry={() => refetchReqs()}
              />
            )}
            {!isReqLoading && !isReqError && requisitionsData?.items.length === 0 && (
              <EmptyState
                title="No document requisitions found"
                description={
                  reqSearch || reqPriority || reqDocType || reqQuickFilter !== 'ALL'
                    ? 'Try adjusting your search criteria or active filters.'
                    : 'No document requests exist yet. Create a formal request for your clients.'
                }
              />
            )}
            {!isReqLoading && !isReqError && (requisitionsData?.items.length ?? 0) > 0 && (
              <>
                <RequisitionTable
                  requisitions={requisitionsData!.items}
                  onSelectRequisition={(req) => setSelectedReqForDetail(req)}
                  onUploadForRequisition={(req) => {
                    setUploadTargetRequisition(req);
                    setIsUploadOpen(true);
                  }}
                  onUpdateStatus={(req) => setSelectedReqForStatus(req)}
                  onExpireRequisition={(req) => handleExpire(req)}
                  canUpload={canUpload}
                />
                <div style={{ marginTop: '1rem' }}>
                  <Pagination
                    page={reqPage}
                    totalPages={Math.ceil((requisitionsData?.total || 0) / (requisitionsData?.page_size || 10)) || 1}
                    onPageChange={setReqPage}
                  />
                </div>
              </>
            )}
          </TabPanel>

          {/* TAB 2: Uploaded Documents */}
          <TabPanel value="documents">
            {/* Quick Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {(
                [
                  { label: 'All Files', value: 'ALL' },
                  { label: 'Pending Review', value: 'PENDING' },
                  { label: 'Under Review', value: 'UNDER_REVIEW' },
                  { label: 'Accepted', value: 'ACCEPTED' },
                  { label: 'Rejected', value: 'REJECTED' },
                ] as const
              ).map((pill) => (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() => {
                    setDocQuickFilter(pill.value);
                    setDocPage(1);
                  }}
                  style={{
                    fontSize: '0.8125rem',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '20px',
                    border: '1px solid',
                    cursor: 'pointer',
                    fontWeight: docQuickFilter === pill.value ? 600 : 500,
                    borderColor:
                      docQuickFilter === pill.value ? 'var(--color-primary-600)' : 'var(--color-slate-300)',
                    backgroundColor:
                      docQuickFilter === pill.value ? 'var(--color-primary-50)' : '#ffffff',
                    color:
                      docQuickFilter === pill.value ? 'var(--color-primary-800)' : 'var(--color-slate-700)',
                    transition: 'all 0.15s ease-in-out',
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Filter Bar */}
            <div className="document-toolbar">
              <div style={{ flex: '1 1 280px', maxWidth: '360px' }}>
                <Input
                  placeholder="Search files by name, client, GSTIN..."
                  value={docSearch}
                  onChange={(e) => {
                    setDocSearch(e.target.value);
                    setDocPage(1);
                  }}
                />
              </div>

              <div className="document-filter-group">
                <Select
                  value={docType}
                  onChange={(e) => {
                    setDocType(e.target.value);
                    setDocPage(1);
                  }}
                >
                  <option value="">All Document Types</option>
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </Select>

                {(docSearch || docType || docQuickFilter !== 'ALL') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDocSearch('');
                      setDocType('');
                      setDocQuickFilter('ALL');
                      setDocReviewStatus('');
                      setDocPage(1);
                    }}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Content States */}
            {isDocLoading && <LoadingState message="Loading uploaded documents..." />}
            {isDocError && (
              <ErrorState
                title="Failed to load documents"
                description={docError instanceof Error ? docError.message : 'Unknown error'}
                onRetry={() => refetchDocs()}
              />
            )}
            {!isDocLoading && !isDocError && documentsData?.items.length === 0 && (
              <EmptyState
                title="No documents found"
                description={
                  docSearch || docType || docQuickFilter !== 'ALL'
                    ? 'Try adjusting your search criteria or active filters.'
                    : 'No documents have been uploaded yet.'
                }
              />
            )}
            {!isDocLoading && !isDocError && (documentsData?.items.length ?? 0) > 0 && (
              <>
                <DocumentTable
                  documents={documentsData!.items}
                  onSelectDocument={(doc) => setSelectedDocForDetail(doc)}
                  onDownloadDocument={(doc) => handleDownload(doc)}
                  onReviewDocument={(doc) => setSelectedDocForReview(doc)}
                  canReview={canReview}
                />
                <div style={{ marginTop: '1rem' }}>
                  <Pagination
                    page={docPage}
                    totalPages={Math.ceil((documentsData?.total || 0) / (documentsData?.page_size || 10)) || 1}
                    onPageChange={setDocPage}
                  />
                </div>
              </>
            )}
          </TabPanel>
        </Tabs>
      </div>

      {/* --- Modals --- */}
      {isCreateReqOpen && (
        <CreateRequisitionModal
          isOpen={isCreateReqOpen}
          onClose={() => setIsCreateReqOpen(false)}
        />
      )}

      {isUploadOpen && (
        <UploadDocumentModal
          isOpen={isUploadOpen}
          onClose={() => {
            setIsUploadOpen(false);
            setUploadTargetRequisition(null);
          }}
          preselectedRequisition={uploadTargetRequisition}
        />
      )}

      {selectedReqForDetail && (
        <RequisitionDetailModal
          isOpen={!!selectedReqForDetail}
          onClose={() => setSelectedReqForDetail(null)}
          requisition={selectedReqForDetail}
          onUploadForRequisition={(req) => {
            setSelectedReqForDetail(null);
            setUploadTargetRequisition(req);
            setIsUploadOpen(true);
          }}
          onUpdateStatus={(req) => {
            setSelectedReqForDetail(null);
            setSelectedReqForStatus(req);
          }}
          onExpireRequisition={(req) => handleExpire(req)}
          onSelectDocument={(doc) => {
            setSelectedReqForDetail(null);
            setSelectedDocForDetail(doc);
          }}
          onDownloadDocument={(doc) => handleDownload(doc)}
          canUpload={canUpload}
        />
      )}

      {selectedReqForStatus && (
        <RequisitionStatusModal
          isOpen={!!selectedReqForStatus}
          onClose={() => setSelectedReqForStatus(null)}
          requisition={selectedReqForStatus}
        />
      )}

      {selectedDocForDetail && (
        <DocumentDetailModal
          isOpen={!!selectedDocForDetail}
          onClose={() => setSelectedDocForDetail(null)}
          document={selectedDocForDetail}
          onDownload={(doc) => handleDownload(doc)}
          onReview={(doc) => {
            setSelectedDocForDetail(null);
            setSelectedDocForReview(doc);
          }}
          canReview={canReview}
        />
      )}

      {selectedDocForReview && (
        <DocumentReviewModal
          isOpen={!!selectedDocForReview}
          onClose={() => setSelectedDocForReview(null)}
          document={selectedDocForReview}
        />
      )}
    </div>
  );
};
