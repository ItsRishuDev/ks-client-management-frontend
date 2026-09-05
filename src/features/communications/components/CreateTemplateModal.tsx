import React, { useState, useMemo } from 'react';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Badge } from '../../../components/ui/Badge';
import { useToast } from '../../../components/ui/useToast';
import { useCreateTemplateMutation } from '../hooks/useCommunications';
import type { NotificationChannel } from '../../../types/communication';

export interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHANNEL_OPTIONS = [
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'IN_APP', label: 'In-App' },
];

export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { success, error: toastError } = useToast();
  const createTemplateMutation = useCreateTemplateMutation();

  const [name, setName] = useState('');
  const [channel, setChannel] = useState<NotificationChannel>('WHATSAPP');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [active, setActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Extract variables automatically from body and subject
  const detectedVariables = useMemo(() => {
    const text = `${subject} ${body}`;
    const matches = text.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
    if (!matches) return [];
    const vars = matches.map((m) => m.replace(/\{\{\s*|\s*\}\}/g, ''));
    return Array.from(new Set(vars));
  }, [subject, body]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Template name is required.');
      return;
    }
    if (!body.trim()) {
      setErrorMsg('Template body is required.');
      return;
    }
    if (channel === 'EMAIL' && !subject.trim()) {
      setErrorMsg('Subject is required for email templates.');
      return;
    }

    try {
      await createTemplateMutation.mutateAsync({
        name: name.trim(),
        channel,
        subject: subject.trim(),
        body: body.trim(),
        variables: detectedVariables,
        active,
      });

      success('Notification template created successfully.');
      handleClose();
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to create notification template.';
      setErrorMsg(message);
      toastError(message);
    }
  };

  const handleClose = () => {
    setName('');
    setChannel('WHATSAPP');
    setSubject('');
    setBody('');
    setActive(true);
    setErrorMsg('');
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Notification Template"
      description="Create reusable notification and reminder templates with dynamic variables."
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="outline" onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={createTemplateMutation.isPending}
            type="submit"
          >
            Create Template
          </Button>
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

        <div>
          <label
            htmlFor="template-name"
            style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}
          >
            Template Name *
          </label>
          <Input
            id="template-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. GST Filing Reminder GSTR-3B"
            required
          />
        </div>

        <div>
          <label
            htmlFor="template-channel"
            style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}
          >
            Channel *
          </label>
          <Select
            id="template-channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value as NotificationChannel)}
            options={CHANNEL_OPTIONS}
          />
        </div>

        {channel === 'EMAIL' && (
          <div>
            <label
              htmlFor="template-subject"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}
            >
              Email Subject *
            </label>
            <Input
              id="template-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Reminder: GST Return Filing for {{period}}"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="template-body"
            style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}
          >
            Message Body *
          </label>
          <Textarea
            id="template-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Dear {{client_name}}, please note that the due date for {{period}} is {{due_date}}."
            required
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '0.25rem' }}>
            Tip: Use <code>&#123;&#123;variable_name&#125;&#125;</code> for dynamic values like <code>&#123;&#123;client_name&#125;&#125;</code>, <code>&#123;&#123;due_date&#125;&#125;</code>, <code>&#123;&#123;amount&#125;&#125;</code>.
          </div>
        </div>

        {detectedVariables.length > 0 && (
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-slate-700)', marginBottom: '0.25rem' }}>
              Detected Variables ({detectedVariables.length}):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {detectedVariables.map((v) => (
                <Badge key={v} variant="primary" size="sm">
                  {`{{${v}}}`}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.25rem' }}>
          <Checkbox
            id="template-active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            label="Active template"
          />
        </div>
      </form>
    </Dialog>
  );
};
