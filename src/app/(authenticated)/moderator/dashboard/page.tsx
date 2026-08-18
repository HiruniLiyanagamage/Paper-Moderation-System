'use client';

import { useState, useEffect } from 'react';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import Link from 'next/link';
import { Eye, FileText } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function ModeratorDashboard() {
  const { user } = useAuth();
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPapers = async () => {
      if (!user) return;
      try {
        const [papersRes, settingsRes] = await Promise.all([
          fetch(`/api/papers?moderatorId=${user.id}`),
          fetch('/api/settings'),
        ]);

        let year = '';
        let sem = 0;
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          year = settings.academicYear || '';
          sem = Number(settings.semester || 0);
        }

        if (papersRes.ok) {
          const data = await papersRes.json();
          // Filter: under_moderation status AND matching active academic period
          const filtered = data.filter((p: any) => {
            if (p.status !== 'under_moderation') return false;
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
    fetchPapers();
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading assigned papers...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Assigned Papers</h1>
        <p className="text-gray-600 mt-1">Review and moderate examination papers</p>
      </div>

      <RoleSwitcher />

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paper ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lecturer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Academic Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Semester
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {papers.map((paper) => (
              <tr key={paper.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  #{paper.id.substring(0, 8)}
                </td>
                <td className="px-6 py-4 font-medium">{paper.subjectCode}</td>
                <td className="px-6 py-4">{paper.lecturerName}</td>
                <td className="px-6 py-4 text-gray-600">{paper.academicYear}</td>
                <td className="px-6 py-4 text-gray-600">Semester {paper.semester}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <a
                      href={paper.paperUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View Paper
                    </a>
                    <a
                      href={paper.markingSchemeUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View Scheme
                    </a>
                    <Link
                      href={`/moderator/form/${paper.id}`}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      Moderate
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {papers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No papers assigned for moderation
          </div>
        )}
      </div>
    </div>
  );
}
