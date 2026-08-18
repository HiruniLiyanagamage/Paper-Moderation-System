'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Department of Computing & Information Systems');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(email, password, department);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Invalid credentials or incorrect department selection.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Paper Moderation System</h1>
          <p className="text-gray-600 mt-2">Wayamba University of Sri Lanka</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-950"
              required
            >
              <option value="Department of Computing & Information Systems">Department of Computing & Information Systems</option>
              <option value="Department of Electronics">Department of Electronics</option>
              <option value="Department of Industrial Management">Department of Industrial Management</option>
              <option value="Department of Mathematical Sciences">Department of Mathematical Sciences</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg max-h-56 overflow-y-auto text-xs text-gray-500">
          <p className="text-gray-700 font-semibold mb-2">Demo Accounts (Password: password):</p>
          <div className="space-y-2">
            <div>
              <p className="font-medium text-gray-600">1. Computing &amp; Information Systems</p>
              <p className="ml-2">• HOD: hod.cis@wayamba.lk</p>
              <p className="ml-2">• Lecturer: lecturer.cis@wayamba.lk</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">2. Electronics</p>
              <p className="ml-2">• HOD: hod.el@wayamba.lk</p>
              <p className="ml-2">• Lecturer: lecturer.el@wayamba.lk</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">3. Industrial Management</p>
              <p className="ml-2">• HOD: hod.im@wayamba.lk</p>
              <p className="ml-2">• Lecturer: lecturer.im@wayamba.lk</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">4. Mathematical Sciences</p>
              <p className="ml-2">• HOD: hod.ms@wayamba.lk</p>
              <p className="ml-2">• Lecturer: lecturer.ms@wayamba.lk</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
