import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, User, MapPin, RefreshCw } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';

const Timetable: React.FC = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState('10A');
  const [timetable, setTimetable] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTimetable();
  }, [selectedClass]);

  const fetchTimetable = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/timetable', {
        params: { class: selectedClass }
      });
      setTimetable(response.data);
      setEditFormData(JSON.parse(JSON.stringify(response.data))); // Deep copy for editing
    } catch (error) {
      console.error('Error fetching timetable:', error);
    }
  };

  const handleEditChange = (day: string, period: number, field: string, value: string) => {
    setEditFormData(prev => {
        const newData = [...prev];
        let dayIndex = newData.findIndex(t => t.day === day);
        
        if (dayIndex === -1) {
            // Day doesn't exist at all yet! Push a new array element
            newData.push({
                class: selectedClass,
                day: day,
                schedule: []
            });
            dayIndex = newData.length - 1;
        }
        
        const daySchedule = { ...newData[dayIndex] };
        const scheduleCopy = [...daySchedule.schedule];
        
        const periodIndex = scheduleCopy.findIndex((s: any) => s.period === period);
        if (periodIndex !== -1) {
            scheduleCopy[periodIndex] = { ...scheduleCopy[periodIndex], [field]: value };
        } else {
            // If the period didn't exist, create it
            scheduleCopy.push({ period, subject: '', teacher: '', room: '', time: periods.find(p => p.period === period)?.time || '', [field]: value });
        }
        
        daySchedule.schedule = scheduleCopy;
        newData[dayIndex] = daySchedule;
        return newData;
    });
  };

  const saveTimetable = async () => {
    try {
        setSaving(true);
        // Assuming we update one by one for this mock, or we can send them all.
        // We will send PUT requests for all modified day objects down to the mock backend.
        await Promise.all(
            editFormData.map(async (dayData: any) => {
                // If it has an ID, we update, else it's a new day entirely being drafted
                if (dayData.id) {
                    await axios.put(`http://localhost:5000/api/timetable/${dayData.id}`, dayData);
                } else if (dayData.schedule.length > 0) {
                    await axios.post(`http://localhost:5000/api/timetable`, dayData);
                }
            })
        );
        await fetchTimetable();
        setIsEditing(false);
    } catch (error) {
        console.error('Error saving timetable', error);
    } finally {
        setSaving(false);
    }
  };

  const toggleEditMode = () => {
      if (isEditing) {
          // Cancel edit: revert to original
          setEditFormData(JSON.parse(JSON.stringify(timetable)));
      }
      setIsEditing(!isEditing);
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [
    { period: 1, time: '08:00-09:00' },
    { period: 2, time: '09:00-10:00' },
    { period: 3, time: '10:30-11:30' },
    { period: 4, time: '11:30-12:30' }
  ];

  const getScheduleForDay = (sourceData: any[], day: string) => {
    const daySchedule = sourceData.find((t) => t.day === day);
    return daySchedule?.schedule || [];
  };

  const subjectColors: any = {
    Mathematics: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700',
    English: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700',
    Science: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700',
    History: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700',
    Physics: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border-pink-300 dark:border-pink-700',
    Chemistry: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Timetable Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage class schedules
          </p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'admin' && (
              isEditing ? (
                <>
                  <Button onClick={saveTimetable} disabled={saving} className="bg-green-600 hover:bg-green-700">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={toggleEditMode} disabled={saving}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline">
                    <RefreshCw className="w-5 h-5" />
                    Auto-Generate
                  </Button>
                  <Button onClick={toggleEditMode}>Edit Timetable</Button>
                </>
              )
          )}
        </div>
      </div>

      {/* Class Selector */}
      <Card>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Class:
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          >
              {['6A', '6B', '7A', '7B', '8A', '8B', '9A', '9B', '10A', '10B', '11A', '11B', '12A', '12B'].map(cls => (
                  <option key={cls} value={cls}>Class {cls}</option>
              ))}
          </select>
        </div>
      </Card>

      {/* Timetable Grid */}
      <Card title={`Timetable for ${selectedClass}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Period / Day
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period.period}>
                  <td className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Period {period.period}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {period.time}
                    </div>
                  </td>
                  {days.map((day) => {
                    const activeData = isEditing ? editFormData : timetable;
                    const schedule = getScheduleForDay(activeData, day);
                    const classInfo = schedule.find((s: any) => s.period === period.period);
                    
                    return (
                      <td
                        key={`${day}-${period.period}`}
                        className="border border-gray-300 dark:border-gray-700 p-2"
                      >
                        {isEditing ? (
                            <div className="flex flex-col gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <input 
                                    type="text" 
                                    placeholder="Subject" 
                                    value={classInfo?.subject || ''} 
                                    className="px-2 py-1 text-xs border rounded bg-white text-gray-900 dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700 w-full"
                                    onChange={(e) => handleEditChange(day, period.period, 'subject', e.target.value)}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Teacher" 
                                    value={classInfo?.teacher || ''} 
                                    className="px-2 py-1 text-xs border rounded bg-white text-gray-900 dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700 w-full"
                                    onChange={(e) => handleEditChange(day, period.period, 'teacher', e.target.value)}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Room" 
                                    value={classInfo?.room || ''} 
                                    className="px-2 py-1 text-xs border rounded bg-white text-gray-900 dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700 w-full"
                                    onChange={(e) => handleEditChange(day, period.period, 'room', e.target.value)}
                                />
                            </div>
                        ) : classInfo ? (
                          <div
                            className={`p-3 rounded-lg border-2 ${
                              subjectColors[classInfo.subject] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'
                            }`}
                          >
                            <div className="font-semibold text-sm mb-1">
                              {classInfo.subject}
                            </div>
                            <div className="text-xs opacity-80 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {classInfo.teacher}
                            </div>
                            <div className="text-xs opacity-80 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              Room {classInfo.room}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 text-center text-gray-400 dark:text-gray-600 text-sm">
                            Free
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <td
                  colSpan={6}
                  className="border border-gray-300 dark:border-gray-700 bg-green-50 dark:bg-green-900/20 p-3 text-center text-sm font-medium text-green-700 dark:text-green-400"
                >
                  <Calendar className="w-4 h-4 inline-block mr-2" />
                  Break Time: 10:00 AM - 10:30 AM
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Optimization */}
      <Card title="AI-Powered Timetable Optimization">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Let AI automatically generate an optimized timetable based on:
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              Teacher availability and preferences
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              Room capacity and resources
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              Subject complexity and student performance
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              Conflict detection and resolution
            </li>
          </ul>
          <Button>
            <RefreshCw className="w-5 h-5" />
            Generate Optimized Timetable
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Timetable;
