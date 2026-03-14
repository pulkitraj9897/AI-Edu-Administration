import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, Loader2, Mail } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Table } from '../components/UI/Table';
import { useAuth } from '../context/AuthContext';

interface Teacher {
  _id: string;
  teacherId: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  classes: string[];
  status: string;
}

const Teachers: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    teacherId: '',
    name: '',
    email: '',
    phone: '',
    subject: '',
    classes: '',
    createAccount: false,
    password: ''
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/teachers');
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await axios.delete(`http://localhost:5000/api/teachers/${id}`);
        fetchTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
        alert('Failed to delete teacher');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        classes: formData.classes.split(',').map(c => c.trim())
      };

      if (editingTeacher) {
        await axios.put(`http://localhost:5000/api/teachers/${editingTeacher._id}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/teachers', payload);
        
        // After creating the teacher record, generate their login credentials if requested
        if (formData.createAccount && formData.password) {
          try {
             await axios.post('http://localhost:5000/api/auth/register-account', {
               name: formData.name,
               email: formData.email,
               password: formData.password,
               role: 'teacher'
             });
             alert('Teacher and login credentials created successfully!');
          } catch (authErr: any) {
             console.error('Auth creation error:', authErr);
             alert(`Teacher record created, but failed to create login account: ${authErr.response?.data?.message || authErr.message}`);
          }
        } else {
          alert('Teacher added successfully!');
        }
      }
      
      setShowModal(false);
      setEditingTeacher(null);
      setFormData({ teacherId: '', name: '', email: '', phone: '', subject: '', classes: '', createAccount: false, password: '' });
      fetchTeachers();
    } catch (error) {
      console.error('Error saving teacher:', error);
      alert('Failed to save teacher');
    }
  };

  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.teacherId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: any[] = [
    { key: 'teacherId', label: 'Teacher ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'subject', label: 'Subject' },
    { 
      key: 'classes', 
      label: 'Assigned Classes',
      render: (classes: string[]) => classes.join(', ') || 'None'
    },
    {
      key: 'status',
      label: 'Status',
      render: (status: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === 'active'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
            }`}
        >
          {status}
        </span>
      )
    }
  ];

  if (isAdmin) {
    columns.push({
      key: 'actions',
      label: 'Actions',
      render: (_: any, teacher: Teacher) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingTeacher(teacher);
              setFormData({
                teacherId: teacher.teacherId,
                name: teacher.name,
                email: teacher.email,
                phone: teacher.phone || '',
                subject: teacher.subject,
                classes: teacher.classes.join(', '),
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
            onClick={() => handleDelete(teacher._id)}
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
          <p className="text-lg font-medium animate-pulse">Loading teachers...</p>
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
            Teacher Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage faculty profiles and assignments
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => {
            setEditingTeacher(null);
            setFormData({ teacherId: '', name: '', email: '', phone: '', subject: '', classes: '', createAccount: false, password: '' });
            setShowModal(true);
          }}>
            <Plus className="w-5 h-5" />
            Add Teacher
          </Button>
        )}
      </div>

      {/* Filters and Actions */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </Card>

      {/* Teachers Table */}
      <Card>
        <Table columns={columns} data={filteredTeachers} />
        {filteredTeachers.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">No teachers found.</p>
        )}
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teacher ID</label>
                  <input type="text" required value={formData.teacherId} onChange={e => setFormData({ ...formData, teacherId: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Specialization</label>
                  <input type="text" required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned Classes (Comma separated)</label>
                  <input type="text" value={formData.classes} onChange={e => setFormData({ ...formData, classes: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="10A, 10B, 11A" />
                </div>

                {!editingTeacher && (
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
                        <Mail className="w-4 h-4" /> Create Login Credentials
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
                         <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">This will create a 'Teacher' role account.</p>
                       </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <Button type="submit" className="flex-1">{editingTeacher ? 'Update' : 'Add Teacher'}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
