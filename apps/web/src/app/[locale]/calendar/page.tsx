'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views, View, Event } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek as dfStartOfWeek, getDay, addMinutes } from 'date-fns';
import { enUS, ar, he } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { CreateAppointmentGuard, EditAppointmentGuard, DeleteAppointmentGuard } from '@/components/PermissionGuard';
import { useToast } from '@/contexts/ToastContext';

type ApiAppointment = {
  id: string;
  title: string;
  description?: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  type: string;
  location?: string | null;
  meeting_link?: string | null;
  notes?: string | null;
  client?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  case?: {
    id: string;
    case_number: string;
    title: string;
  } | null;
  lawyer: {
    id: string;
    display_name: string;
  };
};

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: ApiAppointment;
  appointment?: ApiAppointment;
};

// Appointment type and status enums
enum AppointmentType {
  CONSULTATION = 'consultation',
  COURT_HEARING = 'court_hearing',
  CLIENT_MEETING = 'client_meeting',
  DOCUMENT_REVIEW = 'document_review',
  PHONE_CALL = 'phone_call',
  VIDEO_CALL = 'video_call',
  OTHER = 'other'
}

enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show'
}

// Function to decode JWT token and get user ID
function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

// Get color for appointment type
function getAppointmentTypeColor(type: string): string {
  switch (type) {
    case AppointmentType.CONSULTATION:
      return '#3B82F6'; // blue
    case AppointmentType.COURT_HEARING:
      return '#EF4444'; // red
    case AppointmentType.CLIENT_MEETING:
      return '#10B981'; // green
    case AppointmentType.DOCUMENT_REVIEW:
      return '#F59E0B'; // amber
    case AppointmentType.PHONE_CALL:
      return '#8B5CF6'; // purple
    case AppointmentType.VIDEO_CALL:
      return '#06B6D4'; // cyan
    default:
      return '#6B7280'; // gray
  }
}

// Get color for appointment status
function getAppointmentStatusColor(status: string): string {
  switch (status) {
    case AppointmentStatus.CONFIRMED:
      return '#10B981'; // green
    case AppointmentStatus.CANCELLED:
      return '#EF4444'; // red
    case AppointmentStatus.COMPLETED:
      return '#6B7280'; // gray
    case AppointmentStatus.NO_SHOW:
      return '#F59E0B'; // amber
    default:
      return '#3B82F6'; // blue (scheduled)
  }
}

export default function CalendarPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { addToast } = useToast();

  const locale = useMemo(() => {
    const first = pathname?.split('/')?.[1] || 'en';
    return ['en', 'ar', 'he'].includes(first) ? first : 'en';
  }, [pathname]);

  const isRTL = locale === 'ar' || locale === 'he';

  const localizer = useMemo(() => {
    return dateFnsLocalizer({
      format,
      parse,
      startOfWeek: (date: Date) => dfStartOfWeek(date, { weekStartsOn: 0 }),
      getDay,
      locales: { enUS: enUS, en: enUS, ar, he },
    });
  }, []);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/en');
      return;
    }

    fetchAppointments();
  }, [router]);

  const fetchAppointments = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:4005/api/v1/appointments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to load appointments');
      
      const data: ApiAppointment[] = await response.json();
      const mapped: CalendarEvent[] = data.map((a) => {
        const start = new Date(a.scheduled_at);
        const end = addMinutes(start, a.duration_minutes || 60);
        return {
          id: a.id,
          title: a.title,
          start,
          end,
          resource: a,
          appointment: a,
        };
      });
      setEvents(mapped);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleEventSelect = (event: CalendarEvent) => {
    handleEventClick(event);
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm(t('Appointments.deleteConfirm'))) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:4005/api/v1/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete appointment');

      addToast('success', t('Appointments.deleteSuccess'));
      setShowEventModal(false);
      fetchAppointments(); // Refresh the calendar
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to delete appointment');
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:4005/api/v1/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update appointment status');

      addToast('success', t('Appointments.updateSuccess'));
      setShowEventModal(false);
      fetchAppointments(); // Refresh the calendar
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to update appointment status');
    }
  };

  // Filter events based on selected filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const appointment = event.appointment;
      if (!appointment) return true;

      const matchesType = !typeFilter || appointment.type === typeFilter;
      const matchesStatus = !statusFilter || appointment.status === statusFilter;

      return matchesType && matchesStatus;
    });
  }, [events, typeFilter, statusFilter]);

  // Custom event component
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const appointment = event.appointment;
    if (!appointment) return <div>{event.title}</div>;

    const typeColor = getAppointmentTypeColor(appointment.type);
    const statusColor = getAppointmentStatusColor(appointment.status);

    return (
      <div className="p-1 h-full">
        <div 
          className="text-xs font-medium truncate"
          style={{ color: typeColor }}
        >
          {event.title}
        </div>
        {appointment.client && (
          <div className="text-xs text-gray-600 truncate">
            {appointment.client.first_name} {appointment.client.last_name}
          </div>
        )}
        <div className="flex items-center gap-1 mt-1">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColor }}
          />
          <span className="text-xs text-gray-500 capitalize">
            {appointment.status}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('Common.loading')}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold">{t('Dashboard.calendar.title')}</h1>
            <CreateAppointmentGuard>
              <Link
                href="/calendar/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {t('Appointments.newAppointment')}
              </Link>
            </CreateAppointmentGuard>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Appointments.filter.byType')}
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('Appointments.filter.allTypes')}</option>
                {Object.values(AppointmentType).map(type => (
                  <option key={type} value={type}>
                    {t(`Appointments.type.${type}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Appointments.filter.byStatus')}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('Appointments.filter.allStatuses')}</option>
                {Object.values(AppointmentStatus).map(status => (
                  <option key={status} value={status}>
                    {t(`Appointments.status.${status}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <Calendar
            localizer={localizer}
            culture={locale}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            view={view}
            onView={handleViewChange}
            date={date}
            onNavigate={handleNavigate}
            style={{ height: '70vh' }}
            popup
            rtl={isRTL}
            onSelectEvent={handleEventSelect}
            components={{
              event: EventComponent,
            }}
            messages={{
              next: t('Calendar.next', { default: 'Next' }),
              previous: t('Calendar.previous', { default: 'Back' }),
              today: t('Calendar.today', { default: 'Today' }),
              month: t('Calendar.month', { default: 'Month' }),
              week: t('Calendar.week', { default: 'Week' }),
              day: t('Calendar.day', { default: 'Day' }),
              agenda: t('Calendar.agenda', { default: 'Agenda' }),
            }}
            tooltipAccessor={(event) => {
              const appointment = event.appointment;
              if (!appointment) return event.title;
              
              let tooltip = `${event.title}\n`;
              tooltip += `Type: ${appointment.type.replace('_', ' ')}\n`;
              tooltip += `Status: ${appointment.status.replace('_', ' ')}\n`;
              if (appointment.client) {
                tooltip += `Client: ${appointment.client.first_name} ${appointment.client.last_name}\n`;
              }
              if (appointment.location) {
                tooltip += `Location: ${appointment.location}\n`;
              }
              if (appointment.description) {
                tooltip += `Description: ${appointment.description}`;
              }
              return tooltip;
            }}
          />
        </div>
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && selectedEvent.appointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">{selectedEvent.appointment.title}</h3>
                <p className="text-sm text-gray-600">{selectedEvent.appointment.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="ml-2 capitalize">{selectedEvent.appointment.type.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="ml-2 capitalize">{selectedEvent.appointment.status.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Date:</span>
                  <span className="ml-2">{format(selectedEvent.start, 'PPP')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Time:</span>
                  <span className="ml-2">{format(selectedEvent.start, 'p')} - {format(selectedEvent.end, 'p')}</span>
                </div>
                {selectedEvent.appointment.client && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Client:</span>
                    <span className="ml-2">{selectedEvent.appointment.client.first_name} {selectedEvent.appointment.client.last_name}</span>
                  </div>
                )}
                {selectedEvent.appointment.location && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="ml-2">{selectedEvent.appointment.location}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <EditAppointmentGuard>
                  <Link
                    href={`/calendar/${selectedEvent.appointment.id}/edit`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </Link>
                </EditAppointmentGuard>
                <DeleteAppointmentGuard>
                  <button
                    onClick={() => handleDeleteAppointment(selectedEvent.appointment!.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </DeleteAppointmentGuard>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
