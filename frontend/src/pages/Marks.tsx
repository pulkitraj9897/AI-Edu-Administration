import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Table } from '../components/UI/Table';
import { useAuth } from '../context/AuthContext';

interface Mark {
  _id: string;
  studentId: string;
  examName: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
  date: string;
  studentName?: string;
}

const Marks: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'teacher';

  const [marks, setMarks] = useState<Mark[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMark, setEditingMark] = useState<Mark | null>(null);
  const [formData, setFormData] = useState({
    studentId: '',
    examName: '',
    subject: '',
    marksObtained: 0,
    totalMarks: 100,
    date: new Date().toISOString().split('T')[0]
  });
  const [students, setStudents] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchMarks();
    fetchStudents();
  }, []);

  const fetchMarks = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/marks`);
      setMarks(response.data);
    } catch (error) {
      console.error('Error fetching marks:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/students`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this mark record?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/marks/${id}`);
        alert('Mark record deleted successfully!');
        fetchMarks();
      } catch (error) {
        console.error('Error deleting mark:', error);
        alert('Failed to delete mark record');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMark) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/marks/${editingMark._id}`, formData);
        alert('Mark record updated successfully!');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/marks`, formData);
        alert('Mark record added successfully!');
      }
      setShowModal(false);
      setEditingMark(null);
      resetForm();
      fetchMarks();
    } catch (error: any) {
      console.error('Error saving mark:', error);
      alert(error.response?.data?.message || 'Failed to save mark record');
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      examName: '',
      subject: '',
      marksObtained: 0,
      totalMarks: 100,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const enrichedMarks = marks.map(mark => {
    const student = students.find(s => s.studentId === mark.studentId);
    return {
      ...mark,
      studentName: student ? student.name : 'Unknown'
    };
  });

  const filteredMarks = enrichedMarks.filter(mark => {
    return mark.studentId.toLowerCase().includes(searchTerm.toLowerCase()) || 
           mark.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           mark.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
           mark.examName.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a, b) => a.studentName.localeCompare(b.studentName));

  const totalPages = Math.ceil(filteredMarks.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMarks = filteredMarks.slice(indexOfFirstItem, indexOfLastItem);

  const columns: any[] = [
    { key: 'studentId', label: 'Student ID' },
    { key: 'studentName', label: 'Name' },
    { key: 'examName', label: 'Exam' },
    { key: 'subject', label: 'Subject' },
    { key: 'marksObtained', label: 'Marks', render: (_: any, mark: Mark) => `${mark.marksObtained} / ${mark.totalMarks}` },
    { key: 'grade', label: 'Grade', render: (grade: string) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${['A+', 'A', 'B'].includes(grade) ? 'bg-green-100 text-green-700' : ['C', 'D'].includes(grade) ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
        {grade || 'N/A'}
      </span>
    )
    },
    { key: 'date', label: 'Date', render: (date: string) => new Date(date).toLocaleDateString() }
  ];

  if (isAdminOrTeacher) {
    columns.push({
      key: 'actions',
      label: 'Actions',
      render: (_: any, mark: Mark) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingMark(mark);
              setFormData({
                studentId: mark.studentId,
                examName: mark.examName,
                subject: mark.subject,
                marksObtained: mark.marksObtained,
                totalMarks: mark.totalMarks,
                date: new Date(mark.date).toISOString().split('T')[0]
              });
              setShowModal(true);
            }}
            className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-blue-600 dark:text-blue-400"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(mark._id)}
            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Marks & Performance
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage student academic performance and grades
          </p>
        </div>
        {isAdminOrTeacher && (
          <Button onClick={() => {
            setEditingMark(null);
            resetForm();
            setShowModal(true);
          }}>
            <Plus className="w-5 h-5" />
            Add Mark
          </Button>
        )}
      </div>

      {/* Filters and Actions */}
      {isAdminOrTeacher && (
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
              placeholder="Search by student ID, name, exam, or subject..."
              value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Marks Table */}
      <Card>
        <Table columns={columns} data={currentMarks} />
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 dark:text-gray-400 gap-4">
          <p>
            Showing {filteredMarks.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredMarks.length)} of {filteredMarks.length} records
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="px-2 font-medium text-gray-900 dark:text-gray-100">
              Page {currentPage} of {Math.max(1, totalPages)}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingMark ? 'Edit Mark Record' : 'Add New Mark'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    placeholder="e.g. STU001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Exam Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.examName}
                    onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    placeholder="e.g. Midterm 2026"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    placeholder="e.g. Mathematics"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Marks Obtained
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.marksObtained}
                      onChange={(e) => setFormData({ ...formData, marksObtained: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.totalMarks}
                      onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <Button type="submit" className="flex-1">
                    {editingMark ? 'Update Record' : 'Save Record'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marks;
