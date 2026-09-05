import React, { useState, useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Pagination } from '../components/ui/Pagination';
import { useAuth } from '../context/useAuth';
import { userHasPermission } from '../utils/permissions';
import {
  useNotificationList,
  useTemplateList,
  useUpdateTemplateMutation,
  useMarkNotificationReadMutation,
} from '../features/communications/hooks/useCommunications';
import { NotificationTable } from '../features/communications/components/NotificationTable';
import { TemplateTable } from '../features/communications/components/TemplateTable';
import { SendCommunicationModal } from '../features/communications/components/SendCommunicationModal';
import { CreateTemplateModal } from '../features/communications/components/CreateTemplateModal';
import { useToast } from '../components/ui/useToast';
import type {
  Notification,
  NotificationChannel,
  NotificationStatus,
  NotificationTemplate,
} from '../types/communication';

export const CommunicationsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const canSend = userHasPermission(user, 'communications.send');
  const canManageTemplates = userHasPermission(user, 'templates.manage');

  const [activeTab, setActiveTab] = useState<'log' | 'templates'>('log');

  // Filters for notifications log
  const [channelFilter, setChannelFilter] = useState<NotificationChannel | ''>('');
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | ''>('');
  const [searchFilter, setSearchFilter] = useState('');
  const [logPage, setLogPage] = useState(1);

  // Filters for templates
  const [templateChannelFilter, setTemplateChannelFilter] = useState<NotificationChannel | ''>('');
  const [templateSearchFilter, setTemplateSearchFilter] = useState('');
  const [templatePage, setTemplatePage] = useState(1);

  // Modal states
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [selectedTemplateForSend, setSelectedTemplateForSend] = useState<NotificationTemplate | undefined>(undefined);

  // Queries
  const { data: notificationsData, isLoading: isLoadingNotifications } = useNotificationList({
    channel: channelFilter,
    status: statusFilter,
    search: searchFilter || undefined,
    page: logPage,
    page_size: 20,
  });

  const { data: templatesData, isLoading: isLoadingTemplates } = useTemplateList({
    channel: templateChannelFilter,
    search: templateSearchFilter || undefined,
    page: templatePage,
    page_size: 20,
  });

  // Mutations
  const updateTemplateMutation = useUpdateTemplateMutation(selectedTemplateForSend?.id || '');
  const markReadMutation = useMarkNotificationReadMutation();

  const notifications = useMemo(() => notificationsData?.items || [], [notificationsData]);
  const templates = useMemo(() => templatesData?.items || [], [templatesData]);

  // Summary KPI calculation
  const summaryKpis = useMemo(() => {
    const total = notificationsData?.total || 0;
    const whatsappCount = notifications.filter((n) => n.channel === 'WHATSAPP').length;
    const emailCount = notifications.filter((n) => n.channel === 'EMAIL').length;
    const inAppCount = notifications.filter((n) => n.channel === 'IN_APP').length;

    return {
      total,
      whatsappCount,
      emailCount,
      inAppCount,
    };
  }, [notifications, notificationsData]);

  const handleUseTemplate = (template: NotificationTemplate) => {
    setSelectedTemplateForSend(template);
    setIsSendModalOpen(true);
  };

  const handleToggleTemplateActive = async (template: NotificationTemplate) => {
    try {
      await updateTemplateMutation.mutateAsync({
        active: !template.active,
      });
      success(`Template "${template.name}" ${template.active ? 'deactivated' : 'activated'}.`);
    } catch (err: unknown) {
      toastError((err as Error)?.message || 'Failed to update template.');
    }
  };

  const handleMarkAsRead = async (notification: Notification) => {
    try {
      await markReadMutation.mutateAsync(notification.id);
      success('Notification marked as read.');
    } catch (err: unknown) {
      toastError((err as Error)?.message || 'Failed to mark notification as read.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-slate-900)', margin: 0 }}>
            Communications & Reminders
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-500)', margin: '0.25rem 0 0 0' }}>
            Manage notification templates, WhatsApp reminders, and multi-channel communication logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {canManageTemplates && (
            <Button
              variant="outline"
              onClick={() => setIsCreateTemplateOpen(true)}
            >
              + New Template
            </Button>
          )}
          {canSend && (
            <Button
              variant="primary"
              onClick={() => {
                setSelectedTemplateForSend(undefined);
                setIsSendModalOpen(true);
              }}
            >
              Send Message / WhatsApp
            </Button>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <Card style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-slate-500)' }}>
            Total Communications
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-slate-900)', margin: '0.25rem 0 0 0' }}>
            {summaryKpis.total}
          </div>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-emerald-600)' }}>
            WhatsApp Reminders
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-emerald-700)', margin: '0.25rem 0 0 0' }}>
            {summaryKpis.whatsappCount}
          </div>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-indigo-600)' }}>
            Email Dispatches
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-indigo-700)', margin: '0.25rem 0 0 0' }}>
            {summaryKpis.emailCount}
          </div>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-slate-600)' }}>
            In-App Notifications
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-slate-800)', margin: '0.25rem 0 0 0' }}>
            {summaryKpis.inAppCount}
          </div>
        </Card>
      </div>

      {/* Main Content Tabs & Tables */}
      <Card style={{ padding: '1.5rem' }}>
        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            borderBottom: '1px solid var(--color-slate-200)',
            paddingBottom: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('log')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem 0.25rem',
              fontSize: '0.9375rem',
              fontWeight: activeTab === 'log' ? 600 : 500,
              color: activeTab === 'log' ? 'var(--color-primary-600)' : 'var(--color-slate-500)',
              borderBottom: activeTab === 'log' ? '2px solid var(--color-primary-600)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            Communication Log ({notificationsData?.total ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem 0.25rem',
              fontSize: '0.9375rem',
              fontWeight: activeTab === 'templates' ? 600 : 500,
              color: activeTab === 'templates' ? 'var(--color-primary-600)' : 'var(--color-slate-500)',
              borderBottom: activeTab === 'templates' ? '2px solid var(--color-primary-600)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            Message Templates ({templatesData?.total ?? 0})
          </button>
        </div>

        {/* Tab 1: Communication Log */}
        {activeTab === 'log' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ width: '220px' }}>
                <Input
                  placeholder="Search subject / recipient..."
                  value={searchFilter}
                  onChange={(e) => {
                    setSearchFilter(e.target.value);
                    setLogPage(1);
                  }}
                />
              </div>

              <div style={{ width: '160px' }}>
                <Select
                  value={channelFilter}
                  onChange={(e) => {
                    setChannelFilter(e.target.value as NotificationChannel | '');
                    setLogPage(1);
                  }}
                  options={[
                    { value: '', label: 'All Channels' },
                    { value: 'WHATSAPP', label: 'WhatsApp' },
                    { value: 'EMAIL', label: 'Email' },
                    { value: 'IN_APP', label: 'In-App' },
                  ]}
                />
              </div>

              <div style={{ width: '160px' }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as NotificationStatus | '');
                    setLogPage(1);
                  }}
                  options={[
                    { value: '', label: 'All Statuses' },
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'SENT', label: 'Sent' },
                    { value: 'DELIVERED', label: 'Delivered' },
                    { value: 'READ', label: 'Read' },
                    { value: 'FAILED', label: 'Failed' },
                  ]}
                />
              </div>
            </div>

            {/* Notification Table */}
            <NotificationTable
              notifications={notifications}
              isLoading={isLoadingNotifications}
              onMarkAsRead={handleMarkAsRead}
            />

            {/* Pagination */}
            {notificationsData && notificationsData.total > 20 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <Pagination
                  page={logPage}
                  totalPages={Math.ceil(notificationsData.total / 20)}
                  onPageChange={setLogPage}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Message Templates */}
        {activeTab === 'templates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ width: '220px' }}>
                <Input
                  placeholder="Search templates..."
                  value={templateSearchFilter}
                  onChange={(e) => {
                    setTemplateSearchFilter(e.target.value);
                    setTemplatePage(1);
                  }}
                />
              </div>

              <div style={{ width: '160px' }}>
                <Select
                  value={templateChannelFilter}
                  onChange={(e) => {
                    setTemplateChannelFilter(e.target.value as NotificationChannel | '');
                    setTemplatePage(1);
                  }}
                  options={[
                    { value: '', label: 'All Channels' },
                    { value: 'WHATSAPP', label: 'WhatsApp' },
                    { value: 'EMAIL', label: 'Email' },
                    { value: 'IN_APP', label: 'In-App' },
                  ]}
                />
              </div>
            </div>

            {/* Template Table */}
            <TemplateTable
              templates={templates}
              isLoading={isLoadingTemplates}
              onUseTemplate={canSend ? handleUseTemplate : undefined}
              onToggleActive={canManageTemplates ? handleToggleTemplateActive : undefined}
            />

            {/* Pagination */}
            {templatesData && templatesData.total > 20 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <Pagination
                  page={templatePage}
                  totalPages={Math.ceil(templatesData.total / 20)}
                  onPageChange={setTemplatePage}
                />
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Modals */}
      <CreateTemplateModal
        isOpen={isCreateTemplateOpen}
        onClose={() => setIsCreateTemplateOpen(false)}
      />

      <SendCommunicationModal
        key={selectedTemplateForSend?.id || 'new'}
        isOpen={isSendModalOpen}
        preselectedTemplate={selectedTemplateForSend}
        onClose={() => {
          setIsSendModalOpen(false);
          setSelectedTemplateForSend(undefined);
        }}
      />
    </div>
  );
};
