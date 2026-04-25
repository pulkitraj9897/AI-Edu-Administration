import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Search, Download, Upload, Edit2, Trash2, Eye, Loader2 } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Table } from '../components/UI/Table';
import { useAuth } from '../context/AuthContext';

interface Student {
  _id: string;
  studentId: string;
  name: string;
  email: string;
  class: string;
  section: string;
  phone: string;
  photograph?: string;
  status: string;
  performance: {
    gpa: number;
    attendance: number;
    rank?: number;
  };
}

const Students: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'teacher';

  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    class: '10A',
    section: 'A',
    phone: '',
    photograph: '',
    createAccount: false,
    password: ''
  });

  // State for the Student Details View (Eye Icon)
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [studentMarks, setStudentMarks] = useState<any[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/students`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/students/${id}`);
        alert('Student deleted successfully!');
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Failed to delete student');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/students/${editingStudent._id}`, formData);
        alert('Student updated successfully!');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/students`, formData);
        
        // After creating the student record, generate their login credentials if requested
        if (formData.createAccount && formData.password) {
          try {
             await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/register-account`, {
               name: formData.name,
               email: formData.email,
               password: formData.password,
               role: 'student'
             });
             alert('Student and login credentials created successfully!');
          } catch (authErr: any) {
             console.error('Auth creation error:', authErr);
             alert(`Student record created, but failed to create login account: ${authErr.response?.data?.message || authErr.message}`);
          }
        } else {
          alert('Student added successfully!');
        }
      }
      setShowModal(false);
      setEditingStudent(null);
      setFormData({ studentId: '', name: '', email: '', class: '10A', section: 'A', phone: '', photograph: '', createAccount: false, password: '' });
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Failed to save student');
    }
  };

  const handleViewStudent = async (student: Student) => {
    setViewingStudent(student);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/marks?studentId=${student.studentId}`);
      setStudentMarks(response.data);
    } catch (err) {
      console.error('Error fetching student marks:', err);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Name', 'Email', 'Class', 'Section', 'Phone', 'GPA', 'Attendance'];
    const csvContent = [
      headers.join(','),
      ...filteredStudents.map(s =>
        `${s.studentId},${s.name},${s.email},${s.class},${s.section},${s.phone},${s.performance.gpa},${s.performance.attendance}%`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImportCSV = () => {
    alert('CSV Import: Please upload a CSV file with columns: Student ID, Name, Email, Class, Section, Phone');
    // In a real implementation, you would:
    // 1. Show file input dialog
    // 2. Parse CSV file
    // 3. Send data to backend
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      
    const cleanStudentClass = (student.class || '').replace(/class /i, '').trim();
    const cleanSelectedClass = selectedClass.replace(/class /i, '').trim();
    const matchesClass = selectedClass === 'all' || cleanStudentClass === cleanSelectedClass;
    
    return matchesSearch && matchesClass;
  });

  const columns = [
    { 
      key: 'photograph', 
      label: 'Photo', 
      render: (photo: string, student: Student) => (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {photo ? (
            <img src={photo} alt={student.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-xs">No img</span>
          )}
        </div>
      )
    },
    { key: 'studentId', label: 'Student ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'class', label: 'Class' },
    {
      key: 'performance',
      label: 'GPA',
      render: (perf: any) => perf.gpa.toFixed(2)
    },
    {
      key: 'performance',
      label: 'Attendance',
      render: (perf: any) => `${perf.attendance}%`
    },
    {
      key: 'status',
      label: 'Status',
      render: (status: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${status === 'active'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
            }`}
        >
          {status}
        </span>
      )
    }
  ];

  if (isAdminOrTeacher) {
    columns.push({
      key: 'actions',
      label: 'Actions',
      render: (_: any, student: Student) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingStudent(student);
              setFormData({
                studentId: student.studentId,
                name: student.name,
                email: student.email,
                class: student.class,
                section: student.section,
                phone: student.phone,
                photograph: student.photograph || '',
                createAccount: false,
                password: ''
              });
              setShowModal(true);
            }}
            className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-blue-600 dark:text-blue-400"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleViewStudent(student)}
            className="p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded text-green-600 dark:text-green-400"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(student._id)}
            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    });
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-lg font-medium animate-pulse">Loading student records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Student Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage student profiles and academic data
          </p>
        </div>
        {isAdminOrTeacher && (
          <Button onClick={() => {
            setEditingStudent(null);
            setFormData({ studentId: '', name: '', email: '', class: '10A', section: 'A', phone: '', photograph: '', createAccount: false, password: '' });
            setShowModal(true);
          }}>
            <Plus className="w-5 h-5" />
            Add Student
          </Button>
        )}
      </div>

      {/* Filters and Actions */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          >
            <option value="all">All Classes</option>
            {Array.from(new Set(students.map(s => s.class))).sort().map(cls => (
                <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>

          {/* Action Buttons */}
          <Button variant="outline" onClick={handleImportCSV}>
            <Upload className="w-5 h-5" />
            Import CSV
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-5 h-5" />
            Export
          </Button>
        </div>
      </Card>

      {/* Students Table */}
      <Card>
        <Table columns={columns} data={filteredStudents} />

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <p>Showing {filteredStudents.length} of {students.length} students</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </Card>

      {/* AI Insights */}
      <Card title="AI Performance Insights">
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                15 students are performing below average
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Consider personalized intervention programs
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                25 students show exceptional progress
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Eligible for advanced placement programs
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Add/Edit Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingStudent ? 'Edit Student' : 'Add New Student'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingStudent(null);
                  }}
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
                    placeholder="STU001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Class
                    </label>
                    <select
                      value={formData.class}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    >
                      <option value="10A">10A</option>
                      <option value="10B">10B</option>
                      <option value="11A">11A</option>
                      <option value="11B">11B</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Section
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                      placeholder="A"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Photograph URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.photograph}
                    onChange={(e) => setFormData({ ...formData, photograph: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    placeholder="https://example.com/photo.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Provide a URL. File uploads for facial recognition will be supported soon.</p>
                </div>

                {!editingStudent && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input 
                        type="checkbox" 
                        id="createAccount"
                        checked={formData.createAccount}
                        onChange={e => setFormData({ ...formData, createAccount: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <label htmlFor="createAccount" className="text-sm font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                         Create Login Credentials
                      </label>
                    </div>
                    {formData.createAccount && (
                       <div>
                         <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Assign Password</label>
                         <input 
                           type="text" 
                           required={formData.createAccount}
                           value={formData.password}
                           onChange={e => setFormData({ ...formData, password: e.target.value })}
                           className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg dark:bg-gray-800 dark:border-blue-700 dark:text-white"
                           placeholder="Ensure a secure password"
                         />
                         <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">This will create a 'Student' role account.</p>
                       </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <Button type="submit" className="flex-1">
                    {editingStudent ? 'Update Student' : 'Add Student'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      setEditingStudent(null);
                    }}
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

      {/* View Student Details Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                    {viewingStudent.name.charAt(0)}
                  </div>
                  {viewingStudent.name}'s Profile
                </h2>
                <button onClick={() => setViewingStudent(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Student ID</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{viewingStudent.studentId}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Class</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{viewingStudent.class} {viewingStudent.section}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">GPA</p>
                  <p className="font-bold text-lg text-blue-700 dark:text-blue-300">{viewingStudent.performance.gpa.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400 mb-1">Attendance</p>
                  <p className="font-bold text-lg text-green-700 dark:text-green-300">{viewingStudent.performance.attendance}%</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Academic Marks</h3>
              {studentMarks.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      <tr>
                         <th className="px-4 py-3 font-medium">Exam</th>
                         <th className="px-4 py-3 font-medium">Subject</th>
                         <th className="px-4 py-3 font-medium">Score</th>
                         <th className="px-4 py-3 font-medium">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {studentMarks.map((m, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3">{m.examName}</td>
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{m.subject}</td>
                          <td className="px-4 py-3">{m.marksObtained} / {m.totalMarks}</td>
                          <td className="px-4 py-3">
                             <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                               ['A+', 'A', 'B'].includes(m.grade) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                             }`}>
                               {m.grade}
                             </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 italic">No marks recorded for this student yet.</p>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
