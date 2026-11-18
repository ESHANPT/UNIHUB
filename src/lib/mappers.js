const toIso = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const clock = (value) => (typeof value === 'string' ? value.slice(0, 5) : '');

/* -------------------------------------------------------------------------- */
/* Database row -> UI model                                                   */
/* -------------------------------------------------------------------------- */

export function mapDeadline(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    subject: row.subject,
    category: row.category,
    priority: row.priority,
    dueDate: row.due_date,
    status: row.status,
    completed: row.status === 'completed',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapClass(row) {
  return {
    id: row.id,
    subject: row.subject,
    lecturer: row.lecturer ?? '',
    location: row.classroom ?? '',
    day: row.day_of_week,
    startTime: clock(row.start_time),
    endTime: clock(row.end_time),
    createdAt: row.created_at,
  };
}

export function mapReminder(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    datetime: row.reminder_date,
    category: row.category,
    completed: false,
    createdAt: row.created_at,
  };
}

export function mapAnnouncement(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    isPublished: row.is_published,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    date: (row.published_at || row.created_at || '').slice(0, 10),
  };
}

/* -------------------------------------------------------------------------- */
/* UI form values -> database payload                                         */
/* -------------------------------------------------------------------------- */

export function deadlinePayload(values) {
  const payload = {
    title: values.title,
    description: values.description ?? '',
    subject: values.subject,
    category: values.category,
    priority: values.priority,
    due_date: toIso(values.dueDate),
  };
  if (values.status) payload.status = values.status;
  return payload;
}

export function classPayload(values) {
  return {
    subject: values.subject,
    lecturer: values.lecturer ?? '',
    classroom: values.location ?? '',
    day_of_week: values.day,
    start_time: values.startTime,
    end_time: values.endTime,
  };
}

export function reminderPayload(values) {
  return {
    title: values.title,
    description: values.description ?? '',
    reminder_date: toIso(values.datetime),
    category: values.category ?? 'General',
  };
}

export function announcementPayload(values) {
  return {
    title: values.title,
    content: values.content,
    category: values.category,
    is_published: Boolean(values.isPublished),
    published_at: values.isPublished ? toIso(values.publishedAt) : null,
  };
}

/* -------------------------------------------------------------------------- */
/* Legacy localStorage records -> database payload                            */
/* -------------------------------------------------------------------------- */

export function legacyDeadlinePayload(record) {
  return {
    title: record.title,
    description: record.description ?? '',
    subject: record.subject,
    category: record.category,
    priority: record.priority,
    status: record.completed ? 'completed' : 'pending',
    due_date: toIso(record.dueDate),
    created_at: toIso(record.createdAt) || new Date().toISOString(),
  };
}

export function legacyTimetablePayload(record) {
  return {
    subject: record.subject,
    lecturer: record.lecturer ?? '',
    classroom: record.location ?? '',
    day_of_week: record.day,
    start_time: record.startTime,
    end_time: record.endTime,
    created_at: toIso(record.createdAt) || new Date().toISOString(),
  };
}

export function legacyReminderPayload(record) {
  return {
    title: record.title,
    description: record.description ?? '',
    reminder_date: toIso(record.datetime),
    category: 'General',
    created_at: toIso(record.createdAt) || new Date().toISOString(),
  };
}

export function legacyAnnouncementPayload(record) {
  // Preserve the prototype's date-only value at 09:00 local time.
  const published = toIso(`${record.date}T09:00:00`) || new Date().toISOString();
  return {
    title: record.title,
    content: record.content,
    category: record.category,
    created_at: published,
    published_at: published,
  };
}
