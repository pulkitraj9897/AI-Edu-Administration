import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Search, Download, Upload, Edit2, Trash2, Eye } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Table } from '../components/UI/Table';

interface Student {
  id: number;
  studentId: string;
  name: string;
  email: string;
  class: string;
  section: string;
  phone: string;
  status: string;
  performance: {
    gpa: number;
    attendance: number;
    rank?: number;
  };
}

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    class: '10A',
    section: 'A',
    phone: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`http://localhost:5000/api/students/${id}`);
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
        await axios.put(`http://localhost:5000/api/students/${editingStudent.id}`, formData);
        alert('Student updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/students', formData);
        alert('Student added successfully!');
      }
      setShowModal(false);
      setEditingStudent(null);
      setFormData({ studentId: '', name: '', email: '', class: '10A', section: 'A', phone: '' });
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Failed to save student');
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
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const columns = [
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
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === 'active'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
          }`}
        >
          {status}
        </span>
      )
    },
    {
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
              });
              setShowModal(true);
            }}
            className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-blue-600 dark:text-blue-400"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => alert(`Viewing details for ${student.name}`)}
            className="p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded text-green-600 dark:text-green-400"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(student.id)}
            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Student Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage student profiles and academic data
          </p>
        </div>
        <Button onClick={() => {
          setEditingStudent(null);
          setFormData({ studentId: '', name: '', email: '', class: '10A', section: 'A', phone: '' });
          setShowModal(true);
        }}>
          <Plus className="w-5 h-5" />
          Add Student
        </Button>
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
            <option value="10A">Class 10A</option>
            <option value="10B">Class 10B</option>
            <option value="11A">Class 11A</option>
            <option value="11B">Class 11B</option>
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
    </div>
  );
};

export default Students;
