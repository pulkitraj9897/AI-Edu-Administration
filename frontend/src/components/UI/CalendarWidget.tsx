import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Calendar as CalendarIcon, Loader2, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { Card } from './Card';
import { useAuth } from '../../context/AuthContext';

interface EventData {
  _id: string;
  title: string;
  description?: string;
  date: string;
  type: string;
}

const CalendarWidget: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'event', description: '' });
  const [addingEvent, setAddingEvent] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    
    try {
      setAddingEvent(true);
      await api.post('/events', newEvent);
      setShowAddModal(false);
      setNewEvent({ title: '', date: '', type: 'event', description: '' });
      await fetchEvents();
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Failed to add event.');
    } finally {
      setAddingEvent(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const hasEventOnDate = (dateInfo: number, month: number, year: number) => {
    return events.some(e => {
        const d = new Date(e.date);
        return d.getDate() === dateInfo && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const getEventsForDate = (date: Date) => {
      return events.filter(e => {
          const d = new Date(e.date);
          return d.getDate() === date.getDate() && 
                 d.getMonth() === date.getMonth() && 
                 d.getFullYear() === date.getFullYear();
      });
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'holiday': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800';
      case 'exam': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case 'event': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  // Generate calendar grid
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];
  
  // Empty slots for days before the 1st
  for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
  }
  
  // Actual days
  for (let i = 1; i <= daysInMonth; i++) {
      const isToday = new Date().getDate() === i && 
                      new Date().getMonth() === currentDate.getMonth() && 
                      new Date().getFullYear() === currentDate.getFullYear();
      
      const isSelected = selectedDate.getDate() === i && 
                         selectedDate.getMonth() === currentDate.getMonth() && 
                         selectedDate.getFullYear() === currentDate.getFullYear();
                         
      const hasEvents = hasEventOnDate(i, currentDate.getMonth(), currentDate.getFullYear());

      days.push(
          <button 
              key={`day-${i}`}
              onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))}
              className={`h-10 w-full rounded-lg flex items-center justify-center relative font-medium transition-all
                  ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40'}
                  ${isToday && !isSelected ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}
              `}
          >
              {i}
              {hasEvents && (
                  <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`}></span>
              )}
          </button>
      );
  }

  const selectedEvents = getEventsForDate(selectedDate);
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  if (loading) {
    return (
      <Card title="Interactive Calendar" className="h-full border-t-4 border-t-indigo-500">
        <div className="flex justify-center items-center h-48 text-indigo-500">
           <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card title="Interactive Calendar" className="h-full border-t-4 border-t-indigo-500 flex flex-col transition-shadow hover:shadow-md">
      
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              {isAdmin && (
                 <button onClick={() => setShowAddModal(true)} className="p-1 bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/50 transition-colors" title="Add Event">
                     <Plus className="w-4 h-4" />
                 </button>
              )}
          </h2>
          <div className="flex items-center gap-1">
              <button 
                  onClick={prevMonth}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
              >
                  <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                  onClick={nextMonth}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
              >
                  <ChevronRight className="w-5 h-5" />
              </button>
          </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      {day}
                  </div>
              ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
              {days}
          </div>
      </div>

      <hr className="border-gray-100 dark:border-gray-800 mb-4" />

      {/* Selected Date Events */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Events on {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{selectedEvents.length}</span>
          </h3>

          {selectedEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-gray-400 dark:text-gray-500">
                  <CalendarIcon className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-xs">No events scheduled.</p>
              </div>
          ) : (
              selectedEvents.map(event => (
                  <div key={event._id} className={`p-3 rounded-lg border ${getEventColor(event.type)} transition-transform hover:-translate-y-0.5`}>
                      <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-sm leading-tight">{event.title}</h4>
                          <span className="text-[9px] font-bold uppercase tracking-wider opacity-70 border border-current rounded-full px-2 py-0.5">
                              {event.type}
                          </span>
                      </div>
                      {event.description && <p className="text-xs opacity-80 mt-1">{event.description}</p>}
                  </div>
              ))
          )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-indigo-500" />
                        Add New Event
                    </h3>
                    <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleAddEvent} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Title</label>
                        <input type="text" required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" placeholder="e.g., Science Fair" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                        <input type="date" required value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Type</label>
                        <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white">
                            <option value="event">General Event</option>
                            <option value="holiday">Holiday</option>
                            <option value="exam">Examination</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                        <textarea value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white resize-none h-20" placeholder="Details about the event..."></textarea>
                    </div>
                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={addingEvent} className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex justify-center items-center">
                            {addingEvent ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </Card>
  );
};

export default CalendarWidget;
