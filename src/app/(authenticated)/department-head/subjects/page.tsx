'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, BookOpen, Edit2, Trash2 } from 'lucide-react';
import type { Subject } from '@/types';
import Link from 'next/link';

export default function SubjectManagementPage() {
  const router = useRouter();
  const { user, currentRole } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<any>>({});
  const [loading, setLoading] = useState(true);

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/subjects');
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
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
    fetchSubjects();
  }, [user, currentRole, router]);

  const startEditing = (subject: any) => {
    setEditingId(subject.id);
    setEditForm(subject);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveSubject = async () => {
    if (!editingId) return;
    try {
      const response = await fetch(`/api/subjects/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        fetchSubjects();
        cancelEditing();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteSubject = async (subjectId: string) => {
    if (!confirm('Are you sure you want to delete this subject? All associated papers and reports will be deleted.')) {
      return;
    }
    try {
      const response = await fetch(`/api/subjects/${subjectId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchSubjects();
        if (editingId === subjectId) {
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
        <p className="text-gray-600 mt-4">Loading subject management...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500">Department Head</p>
          <h1 className="text-3xl font-bold text-gray-900">Subject Management</h1>
          <p className="text-gray-600 mt-2">Review subjects, year, semester, and manage subject records.</p>
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
            href="/add-subject"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            <BookOpen className="w-4 h-4" />
            Add Subject
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow p-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lecturer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {subjects.map((subject) => (
              <tr key={subject.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {editingId === subject.id ? (
                    <input
                      type="text"
                      value={editForm.code ?? ''}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, code: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  ) : (
                    subject.code
                  )}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {editingId === subject.id ? (
                    <input
                      type="text"
                      value={editForm.name ?? ''}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  ) : (
                    subject.name
                  )}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {editingId === subject.id ? (
                    <select
                      value={editForm.semester ?? 1}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, semester: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value={1}>Semester 1</option>
                      <option value={2}>Semester 2</option>
                    </select>
                  ) : (
                    `Semester ${subject.semester}`
                  )}
                </td>
                <td className="px-6 py-4 text-gray-700">{subject.lecturer?.name ?? 'Unassigned'}</td>
                <td className="px-6 py-4 space-x-2 text-sm">
                  {editingId === subject.id ? (
                    <>
                      <button
                        onClick={saveSubject}
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
                        onClick={() => startEditing(subject)}
                        className="rounded-xl bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteSubject(subject.id)}
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
