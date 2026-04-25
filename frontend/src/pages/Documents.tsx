import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Plus, Trash2, Loader2, BookOpen, Link, FileText } from 'lucide-react';

interface Document {
  _id: string;
  title: string;
  description: string;
  url: string;
  class: string;
  subject: string;
  uploaderName: string;
  uploaderId: string;
  createdAt: string;
}

const Documents: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'teacher';

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    class: '10A',
    subject: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [assignedClasses, setAssignedClasses] = useState<string[]>([]);

  useEffect(() => {
    fetchDocuments();
    if (user?.role === 'teacher') {
      fetchTeacherProfile();
    }
  }, [user]);

  const fetchTeacherProfile = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/teachers`);
      const teacherProfile = response.data.find((t: any) => t.email === user?.email);
      if (teacherProfile) {
        setAssignedClasses(teacherProfile.classes);
        setFormData(prev => ({
          ...prev, 
          subject: teacherProfile.subject,
          class: teacherProfile.classes[0] || '10A'
        }));
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/documents`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/documents/${id}`);
      fetchDocuments();
    } catch (error: any) {
       alert(error.response?.data?.message || 'Failed to delete');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url && !selectedFile) {
       alert("Please provide either a resource URL or upload a local file.");
       return;
    }

    setIsSubmitting(true);
    try {
      let finalUrl = formData.url;

      if (selectedFile) {
        const fileData = new FormData();
        fileData.append('file', selectedFile);
        
        const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/upload`, fileData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalUrl = uploadRes.data.url;
      }

      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/documents`, {
        ...formData,
        url: finalUrl
      });
      setShowModal(false);
      setFormData({ ...formData, title: '', description: '', url: '' });
      setSelectedFile(null);
      fetchDocuments();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to post document');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
     return (
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="text-lg font-medium animate-pulse">Loading study materials...</p>
          </div>
        </div>
      );
  }

  // Admin class filter options
  const classOptions = user?.role === 'admin' 
    ? ['6A', '6B', '7A', '7B', '8A', '8B', '9A', '9B', '10A', '10B', '11A', '11B', '12A', '12B']
    : assignedClasses;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
             <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
             Study Materials
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isAdminOrTeacher ? 'Manage and assign class documents' : 'Access assignments and study resources'}
          </p>
        </div>
        {isAdminOrTeacher && (
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Upload Document
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <Card key={doc._id} className="relative group overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
             <div className="flex justify-between items-start mb-4">
                <div className="flex-1 pr-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">{doc.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                       Class {doc.class}
                     </span>
                     <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                       {doc.subject}
                     </span>
                  </div>
                </div>
                {isAdminOrTeacher && (doc.uploaderId === user?.id || user?.role === 'admin') && (
                  <button onClick={() => handleDelete(doc._id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                     <Trash2 className="w-4 h-4" />
                  </button>
                )}
             </div>

             <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2 min-h[2.5rem]">
               {doc.description || 'No description provided.'}
             </p>

             <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex flex-col">
                   <span className="text-xs text-gray-500 dark:text-gray-500">Uploaded by {doc.uploaderName}</span>
                   <span className="text-xs text-gray-400">{new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
                <a 
                  href={doc.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Link className="w-4 h-4" /> View
                </a>
             </div>
          </Card>
        ))}

        {documents.length === 0 && (
           <div className="col-span-full py-16 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No documents found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                 {isAdminOrTeacher ? 'You have not uploaded any study materials yet.' : 'Your teachers have not uploaded any resources for your class yet.'}
              </p>
           </div>
        )}
      </div>

      {showModal && isAdminOrTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
             <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Material</h2>
                   <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                      <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" placeholder="Chapter 5 Notes" />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Class</label>
                        <select 
                          required 
                          value={formData.class} 
                          onChange={e => setFormData({...formData, class: e.target.value})} 
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                        >
                          {classOptions.length > 0 ? (
                            classOptions.map(cls => <option key={cls} value={cls}>{cls}</option>)
                          ) : (
                            <option value="">No classes assigned</option>
                          )}
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                        <input 
                          type="text" 
                          required 
                          disabled={user?.role === 'teacher'} 
                          value={formData.subject} 
                          onChange={e => setFormData({...formData, subject: e.target.value})} 
                          className="w-full px-3 py-2 bg-gray-50 disabled:bg-gray-200 dark:bg-gray-700 dark:disabled:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" 
                          placeholder="Mathematics" 
                        />
                     </div>
                   </div>

                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Local File</label>
                      <input 
                        type="file" 
                        onChange={e => setSelectedFile(e.target.files?.[0] || null)} 
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                      />
                   </div>

                   <div className="flex items-center gap-4 py-2">
                     <span className="h-px w-full bg-gray-200 dark:bg-gray-700"></span>
                     <span className="text-gray-500 font-medium text-sm">OR</span>
                     <span className="h-px w-full bg-gray-200 dark:bg-gray-700"></span>
                   </div>

                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">External Resource URL</label>
                      <input type="url" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" placeholder="https://drive.google.com/..." />
                   </div>

                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brief Description</label>
                      <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none" placeholder="Optional details..." />
                   </div>

                   <Button type="submit" disabled={isSubmitting || !!(user?.role === 'teacher' && classOptions.length === 0)} className="w-full">
                      {isSubmitting ? 'Uploading...' : 'Publish Resource'}
                   </Button>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
