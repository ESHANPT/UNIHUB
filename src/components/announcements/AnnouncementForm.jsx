import { useState } from 'react';
import {
  ANNOUNCEMENT_CATEGORIES,
  cn,
  parseDateTime,
  toDateTimeInput,
} from '../../lib/utils';
import { Field, FormActions, FormError } from '../ui/Field';
import { Input, Textarea, Select } from '../ui/Input';
import Toggle from '../ui/Toggle';

export default function AnnouncementForm({ initial, onSubmit, onCancel, submitLabel = 'Save announcement' }) {
  const [values, setValues] = useState(() => ({
    title: initial?.title ?? '',
    content: initial?.content ?? '',
    category: initial?.category ?? 'General',
    isPublished: initial?.isPublished ?? false,
    publishedAt: initial?.publishedAt
      ? toDateTimeInput(initial.publishedAt)
      : toDateTimeInput(new Date()),
  }));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const update = (key) => (event) => {
    const value = event.target.value;
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!values.title.trim()) nextErrors.title = 'Headline is required.';
    if (!values.content.trim()) nextErrors.content = 'Content is required.';
    if (values.isPublished && !values.publishedAt) nextErrors.publishedAt = 'Publish time is required.';
    else if (values.isPublished && !parseDateTime(values.publishedAt)) {
      nextErrors.publishedAt = 'Invalid date format.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFormError('Please check the required fields.');
      return;
    }

    onSubmit({
      title: values.title.trim(),
      content: values.content.trim(),
      category: values.category,
      isPublished: values.isPublished,
      publishedAt: values.isPublished ? parseDateTime(values.publishedAt)?.toISOString() : null,
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <FormError>{formError}</FormError>

      <Field label="Headline" htmlFor="announcement-title" error={errors.title}>
        <Input
          id="announcement-title"
          placeholder="e.g. Mid-semester examination schedule"
          value={values.title}
          onChange={update('title')}
          error={Boolean(errors.title)}
          autoFocus
        />
      </Field>

      <Field label="Category" htmlFor="announcement-category">
        <Select
          id="announcement-category"
          value={values.category}
          onChange={update('category')}
        >
          {ANNOUNCEMENT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Content" htmlFor="announcement-content" error={errors.content}>
        <Textarea
          id="announcement-content"
          rows={5}
          placeholder="Write announcement details for students…"
          value={values.content}
          onChange={update('content')}
          error={Boolean(errors.content)}
        />
      </Field>

      <div className="space-y-3.5 rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-4">
        <Toggle
          id="publish-toggle"
          checked={values.isPublished}
          onChange={(checked) => setValues((current) => ({ ...current, isPublished: checked }))}
          label="Publish announcement"
          description="Unpublished notices are saved as drafts and hidden from students."
        />

        <Field
          label="Publication schedule"
          htmlFor="announcement-published-at"
          error={errors.publishedAt}
          hint="Future date schedules the announcement automatically."
          className={cn(!values.isPublished && 'opacity-40 pointer-events-none')}
        >
          <Input
            id="announcement-published-at"
            type="datetime-local"
            value={values.publishedAt}
            onChange={update('publishedAt')}
            disabled={!values.isPublished}
            error={Boolean(errors.publishedAt)}
          />
        </Field>
      </div>

      <FormActions onCancel={onCancel} submitLabel={submitLabel} />
    </form>
  );
}
