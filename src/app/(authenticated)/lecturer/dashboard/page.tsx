'use client';

import { useState, useEffect } from 'react';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import Link from 'next/link';
import { FileText, Clock, AlertCircle, CheckCircle, Circle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function LecturerDashboard() {
  const { user } = useAuth();
  const [papers, setPapers] = useState<any[]>([]);
  const [activeYear, setActiveYear] = useState('');
  const [activeSemester, setActiveSemester] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPapers = async () => {
    if (!user) return;
    try {
      const [papersRes, settingsRes] = await Promise.all([
        fetch(`/api/papers?lecturerId=${user.id}`),
        fetch('/api/settings'),
      ]);

      let year = '';
      let sem = 0;
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        year = settings.academicYear || '';
        sem = Number(settings.semester || 0);
        setActiveYear(year);
        setActiveSemester(sem);
      }

      if (papersRes.ok) {
        const data = await papersRes.json();
        // Show only active-period non-finalized papers
        const filtered = data.filter((p: any) => {
          if (p.status === 'finalized') return false;
          if (year && p.academicYear !== year) return false;
          if (sem && p.semester !== sem) return false;
          return true;
        });
        setPapers(filtered);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: any; label: string }> = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Circle, label: 'Draft' },
      submitted: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock, label: 'Submitted' },
      under_moderation: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Under Moderation' },
      revision_required: { bg: 'bg-orange-100', text: 'text-orange-700', icon: AlertCircle, label: 'Revision Required' },
      finalized: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Finalized' },
    };
    const config = configs[status] || configs.draft;
    const Icon = config.icon;

    return (
      <span className={`flex items-center gap-2 px-3 py-1 ${config.bg} ${config.text} rounded-full text-sm font-medium`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading subjects...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
        <p className="text-gray-600 mt-1">Manage your examination papers</p>
      </div>

      <RoleSwitcher />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Semester
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {papers.map((paper) => (
              <tr key={paper.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {paper.subjectCode}
                </td>
                <td className="px-6 py-4">{paper.subjectName}</td>
                <td className="px-6 py-4 text-gray-600">Semester {paper.semester}</td>
                <td className="px-6 py-4">{getStatusBadge(paper.status)}</td>
                <td className="px-6 py-4">
                  <Link
                    href={
                      paper.status === 'revision_required'
                        ? `/revision/${paper.id}`
                        : `/subject/${paper.subjectId}`
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block text-center min-w-[140px]"
                  >
                    {paper.status === 'revision_required' ? 'Review Feedback' : 'Open'}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {papers.length === 0 && (
          <div className="text-center py-12 text-gray-500 font-medium">
            No active subjects found. Finalized papers can be viewed in History.
          </div>
        )}
      </div>
    </div>
  );
}
