import React, { useState, useMemo } from 'react';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { useToast } from '../../../components/ui/useToast';
import { useClientsList } from '../../clients/hooks/useClients';
import { useTemplateList, useSendCommunicationMutation } from '../hooks/useCommunications';
import type { NotificationChannel, NotificationTemplate } from '../../../types/communication';

export interface SendCommunicationModalProps {
  isOpen: boolean;
  preselectedTemplate?: NotificationTemplate;
  onClose: () => void;
}

const CHANNEL_OPTIONS = [
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'IN_APP', label: 'In-App' },
];

export const SendCommunicationModal: React.FC<SendCommunicationModalProps> = ({
  isOpen,
  preselectedTemplate,
  onClose,
}) => {
  const { success, error: toastError } = useToast();
  const sendMutation = useSendCommunicationMutation();

  const { data: templatesData } = useTemplateList({ active: true, page_size: 100 });
  const { data: clientsData } = useClientsList({ page_size: 100 });

  const templates = templatesData?.items || [];
  const clients = clientsData?.items || [];

  const [templateId, setTemplateId] = useState<string>(() => preselectedTemplate?.id || '');
  const [channel, setChannel] = useState<NotificationChannel>(() => preselectedTemplate?.channel || 'WHATSAPP');
  const [subject, setSubject] = useState<string>(() => preselectedTemplate?.subject || '');
  const [body, setBody] = useState<string>(() => preselectedTemplate?.body || '');
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [contextData, setContextData] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  // When template selection changes
  const handleTemplateChange = (selectedId: string) => {
    setTemplateId(selectedId);
    if (!selectedId) return;

    const tpl = templates.find((t) => t.id === selectedId);
    if (tpl) {
      setChannel(tpl.channel);
      setSubject(tpl.subject || '');
      setBody(tpl.body || '');
    }
  };

  // When client selection changes, auto-fill contact info & context data
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    if (!clientId) return;

    const client = clients.find((c) => c.id === clientId);
    if (client) {
      if (client.primary_email && !recipientEmail) {
        setRecipientEmail(client.primary_email);
      }
      if (client.primary_phone && !recipientPhone) {
        setRecipientPhone(client.primary_phone);
      }
      setContextData((prev) => ({
        ...prev,
        client_name: client.display_name || client.legal_name || '',
      }));
    }
  };

  // Extract variables from body & subject
  const detectedVariables = useMemo(() => {
    const text = `${subject} ${body}`;
    const matches = text.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
    if (!matches) return [];
    const vars = matches.map((m) => m.replace(/\{\{\s*|\s*\}\}/g, ''));
    return Array.from(new Set(vars));
  }, [subject, body]);

  // Render preview with variable substitution
  const renderedPreview = useMemo(() => {
    let result = body;
    detectedVariables.forEach((v) => {
      const val = contextData[v] || `{{${v}}}`;
      result = result.replace(new RegExp(`\\{\\{\\s*${v}\\s*\\}\\}`, 'g'), val);
    });
    return result;
  }, [body, detectedVariables, contextData]);

  const handleVariableChange = (key: string, value: string) => {
    setContextData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setWhatsappUrl(null);

    if (channel === 'EMAIL' && !recipientEmail.trim()) {
      setErrorMsg('Recipient email is required for Email communications.');
      return;
    }

    if (channel === 'WHATSAPP' && !recipientPhone.trim()) {
      setErrorMsg('Recipient phone number is required for WhatsApp reminders.');
      return;
    }

    if (!body.trim() && !templateId) {
      setErrorMsg('Message body or template is required.');
      return;
    }

    try {
      const response = await sendMutation.mutateAsync({
        template_id: templateId || undefined,
        channel,
        subject: subject.trim() || undefined,
        body: body.trim() || undefined,
        recipient_email: recipientEmail.trim() || undefined,
        recipient_phone: recipientPhone.trim() || undefined,
        context_data: contextData,
        related_entity_type: selectedClientId ? 'CLIENT' : undefined,
        related_entity_id: selectedClientId || undefined,
      });

      success('Communication dispatched successfully.');

      if (response.whatsapp_url) {
        setWhatsappUrl(response.whatsapp_url);
        // Automatically prompt/open WhatsApp link in a new window/tab
        window.open(response.whatsapp_url, '_blank', 'noopener,noreferrer');
      } else {
        handleClose();
      }
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to send communication.';
      setErrorMsg(message);
      toastError(message);
    }
  };

  const handleClose = () => {
    setTemplateId('');
    setChannel('WHATSAPP');
    setSubject('');
    setBody('');
    setRecipientEmail('');
    setRecipientPhone('');
    setSelectedClientId('');
    setContextData({});
    setErrorMsg('');
    setWhatsappUrl(null);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Send Message / Reminder"
      description="Dispatch reminders and notices via WhatsApp, Email, or In-App."
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
          {whatsappUrl ? (
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-emerald-700)', fontWeight: 500 }}>
                WhatsApp link generated!
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="primary" type="button">
                    Open WhatsApp Web
                  </Button>
                </a>
                <Button variant="outline" onClick={handleClose} type="button">
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} type="button">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={sendMutation.isPending}
                type="submit"
              >
                {channel === 'WHATSAPP' ? 'Generate & Send WhatsApp' : 'Send Communication'}
              </Button>
            </>
          )}
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {errorMsg && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--color-rose-50)',
              color: 'var(--color-rose-700)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              border: '1px solid var(--color-rose-200)',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Template Selector */}
        <div>
          <label
            htmlFor="comm-template"
            style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}
          >
            Use Template (Optional)
          </label>
          <Select
            id="comm-template"
            value={templateId}
            onChange={(e) => handleTemplateChange(e.target.value)}
            options={[
              { value: '', label: '-- Custom / No Template --' },
              ...templates.map((t) => ({
                value: t.id,
                label: `${t.name} (${t.channel})`,
              })),
            ]}
          />
        </div>

        {/* Client Context Selector */}
        <div>
          <label
            htmlFor="comm-client"
            style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}
          >
            Target Client (Optional)
          </label>
          <Select
            id="comm-client"
            value={selectedClientId}
            onChange={(e) => handleClientChange(e.target.value)}
            options={[
              { value: '', label: '-- None / Direct Recipient --' },
              ...clients.map((c) => ({
                value: c.id,
                label: `${c.client_code ? `[${c.client_code}] ` : ''}${c.display_name || c.legal_name}`,
              })),
            ]}
          />
        </div>

        {/* Channel Selection */}
        <div>
          <label
            htmlFor="comm-channel"
            style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}
          >
            Channel *
          </label>
          <Select
            id="comm-channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value as NotificationChannel)}
            options={CHANNEL_OPTIONS}
          />
        </div>

        {/* Recipients */}
        {channel === 'EMAIL' && (
          <div>
            <label
              htmlFor="comm-recipient-email"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}
            >
              Recipient Email *
            </label>
            <Input
              id="comm-recipient-email"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="client@example.com"
              required
            />
          </div>
        )}

        {channel === 'WHATSAPP' && (
          <div>
            <label
              htmlFor="comm-recipient-phone"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}
            >
              Recipient Phone Number (with Country Code) *
            </label>
            <Input
              id="comm-recipient-phone"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder="+91 98765 43210 or 9876543210"
              required
            />
          </div>
        )}

        {channel === 'EMAIL' && (
          <div>
            <label
              htmlFor="comm-subject"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}
            >
              Subject
            </label>
            <Input
              id="comm-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject line"
            />
          </div>
        )}

        {/* Dynamic Context Variables Form */}
        {detectedVariables.length > 0 && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--color-slate-50)',
              borderRadius: '6px',
              border: '1px solid var(--color-slate-200)',
            }}
          >
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-slate-800)', marginBottom: '0.5rem' }}>
              Dynamic Template Variables:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
              {detectedVariables.map((v) => (
                <div key={v}>
                  <label
                    htmlFor={`var-${v}`}
                    style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-slate-600)', marginBottom: '0.125rem' }}
                  >
                    {`{{${v}}}`}
                  </label>
                  <Input
                    id={`var-${v}`}
                    value={contextData[v] || ''}
                    onChange={(e) => handleVariableChange(v, e.target.value)}
                    placeholder={`Value for ${v}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Body */}
        <div>
          <label
            htmlFor="comm-body"
            style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}
          >
            Message Body *
          </label>
          <Textarea
            id="comm-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Type message content here..."
            required
          />
        </div>

        {/* Live Preview */}
        {body.trim() && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: '#f8fafc',
              border: '1px dashed var(--color-slate-300)',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-slate-500)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Live Message Preview
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-slate-800)', whiteSpace: 'pre-wrap' }}>
              {renderedPreview}
            </div>
          </div>
        )}
      </form>
    </Dialog>
  );
};
