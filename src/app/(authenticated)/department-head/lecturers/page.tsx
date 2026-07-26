'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Edit2, Trash2, User, Mail, Phone, Building } from 'lucide-react';
import Link from 'next/link';

interface LecturerDetail {
  id: string;
  name: string;
  email: string;
  contact: string;
  department: string;
  role: string;
}

export default function LecturerDetailsPage() {
  const router = useRouter();
  const { user, currentRole } = useAuth();
  const [lecturers, setLecturers] = useState<LecturerDetail[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<LecturerDetail>>({});
  const [loading, setLoading] = useState(true);

  const fetchLecturers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        // Display all users except the department head if desired, or all users.
        // We will display all users but map their roles to matches.
        setLecturers(
          data.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            contact: u.contact || 'No contact info',
            department: u.department || 'Department of Computing and Information Systems',
            role: u.role === 'DEPARTMENT_HEAD' ? 'Department Head' : 'Lecturer',
          }))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.isDepartmentHead || currentRole !== 'department_head') {
      router.push('/dashboard');
      return;
    }
    fetchLecturers();
  }, [user, currentRole, router]);

  const startEditing = (lecturer: LecturerDetail) => {
    setEditingId(lecturer.id);
    setEditForm(lecturer);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveLecturer = async () => {
    if (!editingId) return;
    try {
      const response = await fetch(`/api/users/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        fetchLecturers();
        cancelEditing();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteLecturer = async (lecturerId: string) => {
    if (!confirm('Are you sure you want to delete this lecturer? All their assigned subjects will be unassigned.')) {
      return;
    }
    try {
      const response = await fetch(`/api/users/${lecturerId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchLecturers();
        if (editingId === lecturerId) {
          cancelEditing();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading lecturer details...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500">Department Head</p>
          <h1 className="text-3xl font-bold text-gray-900">Lecturer Details</h1>
          <p className="text-gray-600 mt-2">Manage lecturer contact details and update or remove records.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
          <Link
            href="/add-lecturer"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <User className="w-4 h-4" />
            Add Lecturer
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow p-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {lecturers.map((lecturer) => (
              <tr key={lecturer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {editingId === lecturer.id ? (
                    <input
                      type="text"
                      value={editForm.name ?? ''}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">{lecturer.name}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {editingId === lecturer.id ? (
                    <input
                      type="email"
                      value={editForm.email ?? ''}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{lecturer.email}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {editingId === lecturer.id ? (
                    <input
                      type="text"
                      value={editForm.contact ?? ''}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, contact: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{lecturer.contact}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {editingId === lecturer.id ? (
                    <input
                      type="text"
                      value={editForm.department ?? ''}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, department: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span>{lecturer.department}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 space-x-2 text-sm">
                  {editingId === lecturer.id ? (
                    <>
                      <button
                        onClick={saveLecturer}
                        className="rounded-xl bg-green-600 px-3 py-2 text-white hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="rounded-xl bg-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(lecturer)}
                        className="rounded-xl bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteLecturer(lecturer.id)}
                        className="rounded-xl bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
