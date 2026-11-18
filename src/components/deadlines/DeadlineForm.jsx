import { useState } from 'react';
import {
  DEADLINE_CATEGORIES,
  PRIORITIES,
  cn,
  defaultDueDate,
  parseDateTime,
  toDateTimeInput,
} from '../../lib/utils';
import { Field, FormActions, FormError } from '../ui/Field';

export default function DeadlineForm({ initial, subjects = [], onSubmit, onCancel, submitLabel = 'Save deadline' }) {
  const [values, setValues] = useState(() => ({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    subject: initial?.subject ?? '',
    category: initial?.category ?? 'Assignment',
    priority: initial?.priority ?? 'Medium',
    dueDate: initial?.dueDate ? toDateTimeInput(initial.dueDate) : defaultDueDate(),
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
    if (!values.title.trim()) nextErrors.title = 'Give this deadline a title.';
    if (!values.subject.trim()) nextErrors.subject = 'Which subject is this for?';
    if (!values.dueDate) nextErrors.dueDate = 'Choose a due date and time.';
    else if (!parseDateTime(values.dueDate)) nextErrors.dueDate = 'That date does not look valid.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFormError('Please fix the highlighted fields before saving.');
      return;
    }

    onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      subject: values.subject.trim(),
      category: values.category,
      priority: values.priority,
      dueDate: toDateTimeInput(parseDateTime(values.dueDate)),
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <FormError>{formError}</FormError>

      <Field label="Title" htmlFor="deadline-title" error={errors.title}>
        <input
          id="deadline-title"
          className="input"
          placeholder="e.g. Binary search tree assignment"
          value={values.title}
          onChange={update('title')}
          aria-invalid={Boolean(errors.title)}
          autoFocus
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Subject" htmlFor="deadline-subject" error={errors.subject}>
          <input
            id="deadline-subject"
            className="input"
            list="deadline-subjects"
            placeholder="e.g. Data Structures"
            value={values.subject}
            onChange={update('subject')}
            aria-invalid={Boolean(errors.subject)}
          />
          <datalist id="deadline-subjects">
            {subjects.map((subject) => (
              <option key={subject} value={subject} />
            ))}
          </datalist>
        </Field>

        <Field label="Category" htmlFor="deadline-category">
          <select id="deadline-category" className="input select" value={values.category} onChange={update('category')}>
            {DEADLINE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Due date & time" htmlFor="deadline-due" error={errors.dueDate}>
          <input
            id="deadline-due"
            type="datetime-local"
            className="input"
            value={values.dueDate}
            onChange={update('dueDate')}
            aria-invalid={Boolean(errors.dueDate)}
          />
        </Field>

        <Field label="Priority">
          <div className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-soft p-1">
            {PRIORITIES.map((priority) => (
              <button
                key={priority}
                type="button"
                aria-pressed={values.priority === priority}
                onClick={() => setValues((current) => ({ ...current, priority }))}
                className={cn(
                  'rounded-lg px-2 py-2 text-xs font-semibold transition',
                  values.priority === priority
                    ? 'bg-surface text-ink shadow-sm ring-1 ring-line'
                    : 'text-muted hover:text-ink',
                )}
              >
                <span
                  className={cn(
                    'mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle',
                    priority === 'High' ? 'bg-rose-500' : priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500',
                  )}
                />
                {priority}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <Field label="Description" htmlFor="deadline-description" hint="Optional — add what needs to be submitted.">
        <textarea
          id="deadline-description"
          className="input min-h-[84px] resize-y"
          rows={3}
          placeholder="Add notes, requirements or a checklist…"
          value={values.description}
          onChange={update('description')}
        />
      </Field>

      <FormActions onCancel={onCancel} submitLabel={submitLabel} />
    </form>
  );
}
