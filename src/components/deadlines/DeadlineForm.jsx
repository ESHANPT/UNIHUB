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
import { Input, Textarea, Select } from '../ui/Input';

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
    if (!values.title.trim()) nextErrors.title = 'Title is required.';
    if (!values.subject.trim()) nextErrors.subject = 'Subject is required.';
    if (!values.dueDate) nextErrors.dueDate = 'Due date is required.';
    else if (!parseDateTime(values.dueDate)) nextErrors.dueDate = 'Invalid date format.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFormError('Please check the required fields.');
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
        <Input
          id="deadline-title"
          placeholder="e.g. Distributed Systems coursework"
          value={values.title}
          onChange={update('title')}
          error={Boolean(errors.title)}
          autoFocus
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Subject" htmlFor="deadline-subject" error={errors.subject}>
          <Input
            id="deadline-subject"
            list="deadline-subjects"
            placeholder="e.g. Computer Science"
            value={values.subject}
            onChange={update('subject')}
            error={Boolean(errors.subject)}
          />
          <datalist id="deadline-subjects">
            {subjects.map((subject) => (
              <option key={subject} value={subject} />
            ))}
          </datalist>
        </Field>

        <Field label="Category" htmlFor="deadline-category">
          <Select id="deadline-category" value={values.category} onChange={update('category')}>
            {DEADLINE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Due date & time" htmlFor="deadline-due" error={errors.dueDate}>
          <Input
            id="deadline-due"
            type="datetime-local"
            value={values.dueDate}
            onChange={update('dueDate')}
            error={Boolean(errors.dueDate)}
          />
        </Field>

        <Field label="Priority">
          <div className="grid grid-cols-3 gap-1 rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-1">
            {PRIORITIES.map((priority) => {
              const active = values.priority === priority;
              const dotColor =
                priority === 'High'
                  ? 'bg-danger'
                  : priority === 'Medium'
                    ? 'bg-warning'
                    : 'bg-success';

              return (
                <button
                  key={priority}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setValues((current) => ({ ...current, priority }))}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-[9px] py-1.5 text-xs font-medium transition-all duration-fast select-none cursor-pointer',
                    active
                      ? 'bg-surface text-text shadow-elev-1 border border-hairline'
                      : 'text-text-3 hover:text-text'
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full', dotColor)} />
                  <span>{priority}</span>
                </button>
              );
            })}
          </div>
        </Field>
      </div>

      <Field label="Description" htmlFor="deadline-description" hint="Optional notes or checklist for students.">
        <Textarea
          id="deadline-description"
          rows={3}
          placeholder="Submission details or syllabus notes…"
          value={values.description}
          onChange={update('description')}
        />
      </Field>

      <FormActions onCancel={onCancel} submitLabel={submitLabel} />
    </form>
  );
}
