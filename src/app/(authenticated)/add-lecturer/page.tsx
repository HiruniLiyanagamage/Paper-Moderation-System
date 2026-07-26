'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function AddLecturerPage() {
  const router = useRouter();
  const { user, currentRole } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.isDepartmentHead || currentRole !== 'department_head') {
      router.push('/dashboard');
    }
  }, [user, currentRole, router]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contact: '',
    department: 'Department of Computing and Information Systems',
    isLecturer: true,
    isModerator: true,
    isDepartmentHead: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add lecturer');
        return;
      }

      alert('Lecturer added successfully! They can now log in with their email and password.');
      router.push('/department-head/lecturers');
    } catch (e: any) {
      setError(e.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="p-8">
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Lecturer</h1>
            <p className="text-gray-600">Create a new lecturer account</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Dr. Jane Smith"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 071-123-4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. jane.smith@wayamba.lk"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Initial password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Roles</label>
            <p className="text-sm text-gray-600 mb-3">
              {formData.isDepartmentHead
                ? 'Department Head will have all 3 roles (Head, Lecturer, Moderator)'
                : 'All lecturers have both Lecturer and Moderator roles'}
            </p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border-2 border-blue-200 bg-blue-50 rounded-lg opacity-70">
                <input type="checkbox" checked disabled className="w-4 h-4 text-blue-600 rounded" />
                <div>
                  <div className="font-medium">Lecturer / Setter</div>
                  <div className="text-sm text-gray-500">Can upload and manage papers</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border-2 border-blue-200 bg-blue-50 rounded-lg opacity-70">
                <input type="checkbox" checked disabled className="w-4 h-4 text-blue-600 rounded" />
                <div>
                  <div className="font-medium">Moderator / 2nd Examiner</div>
                  <div className="text-sm text-gray-500">Can review and moderate papers</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDepartmentHead}
                  onChange={(e) => setFormData({ ...formData, isDepartmentHead: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium">Department Head</div>
                  <div className="text-sm text-gray-500">Full administrative access</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add Lecturer
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
