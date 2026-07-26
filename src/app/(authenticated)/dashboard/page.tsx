'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { Plus, Edit2, Calendar, Check, X, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

// Generate a range of years: 10 years back to 10 years ahead from current year
function generateYears() {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear - 10; y <= currentYear + 10; y++) {
    years.push(y);
  }
  return years;
}
const YEAR_OPTIONS = generateYears();

export default function DepartmentHeadDashboard() {
  const router = useRouter();
  const { user, currentRole } = useAuth();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [currentYear, setCurrentYear] = useState('2025/2026');
  const [startYear, setStartYear] = useState(2025);
  const [currentSemester, setCurrentSemester] = useState(1);
  const [isEditingAcademic, setIsEditingAcademic] = useState(false);
  const [loading, setLoading] = useState(true);

  // Editing state for subject assignments
  const [isEditingAssignments, setIsEditingAssignments] = useState<boolean>(false);
  const [tempAssignments, setTempAssignments] = useState<Record<string, { lecturerId: string; moderatorId: string }>>({});

  const fetchData = async () => {
    try {
      const [subjectsRes, usersRes, settingsRes] = await Promise.all([
        fetch('/api/subjects'),
        fetch('/api/users'),
        fetch('/api/settings'),
      ]);

      if (subjectsRes.ok && usersRes.ok) {
        const subjectsData = await subjectsRes.json();
        const usersData = await usersRes.json();
        setSubjects(subjectsData);
        setUsers(usersData);

        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          const year = settings.academicYear || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;
          const sem = Number(settings.semester || 1);
          setCurrentYear(year);
          setStartYear(Number(year.split('/')[0]) || new Date().getFullYear());
          setCurrentSemester(sem);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.isDepartmentHead || currentRole !== 'department_head') {
      router.push('/lecturer/dashboard');
      return;
    }
    fetchData();
  }, [user, currentRole, router]);

  // Turn on edit mode and copy existing assignments to temporary state
  const handleStartEditAssignments = () => {
    const initialTemp: Record<string, { lecturerId: string; moderatorId: string }> = {};
    subjects.forEach((s) => {
      initialTemp[s.id] = {
        lecturerId: s.lecturerId || '',
        moderatorId: s.moderatorId || '',
      };
    });
    setTempAssignments(initialTemp);
    setIsEditingAssignments(true);
  };

  const handleTempLecturerChange = (subjectId: string, lecturerId: string) => {
    setTempAssignments((prev) => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        lecturerId,
      },
    }));
  };

  const handleTempModeratorChange = (subjectId: string, moderatorId: string) => {
    setTempAssignments((prev) => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        moderatorId,
      },
    }));
  };

  const handleSaveAssignments = async () => {
    setLoading(true);
    try {
      await Promise.all(
        Object.entries(tempAssignments).map(([subjectId, { lecturerId, moderatorId }]) =>
          fetch(`/api/subjects/${subjectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lecturerId: lecturerId || null,
              moderatorId: moderatorId || null,
            }),
          })
        )
      );
      await fetchData();
      setIsEditingAssignments(false);
    } catch (e) {
      console.error(e);
      alert('Failed to save subject assignments.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEditAssignments = () => {
    setIsEditingAssignments(false);
    setTempAssignments({});
  };

  const handleSaveAcademicSettings = async () => {
    if (isEditingAcademic) {
      try {
        await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            academicYear: currentYear,
            semester: currentSemester,
          }),
        });
      } catch (e) {
        console.error('Failed to save academic settings:', e);
      }
    }
    setIsEditingAcademic(!isEditingAcademic);
  };

  const getUserName = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    return found ? found.name : '';
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Department Head Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage subjects, lecturers, and moderators</p>
      </div>

      <RoleSwitcher />

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Academic Settings</h2>
          <button
            onClick={handleSaveAcademicSettings}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            {isEditingAcademic ? 'Save' : 'Change'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Academic Year</label>
            {isEditingAcademic ? (
              <div className="flex items-center gap-2">
                <select
                  value={startYear}
                  onChange={(e) => {
                    const y = Number(e.target.value);
                    setStartYear(y);
                    setCurrentYear(`${y}/${y + 1}`);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <span className="text-gray-500 font-bold text-lg">/</span>
                <div className="flex-1 px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-center font-medium text-gray-600">
                  {startYear + 1}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="font-medium">{currentYear}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Semester</label>
            {isEditingAcademic ? (
              <select
                value={currentSemester}
                onChange={(e) => setCurrentSemester(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Semester 1</option>
                <option value={2}>Semester 2</option>
              </select>
            ) : (
              <div className="px-4 py-2 bg-gray-50 rounded-lg">
                <span className="font-medium">Semester {currentSemester}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Subject Assignments</h2>
              <p className="text-sm text-gray-500 mt-1">
                {isEditingAssignments 
                  ? 'Change lecturers and moderators below, then click Save.' 
                  : 'Assign academic staff members to lecture and moderate courses.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isEditingAssignments ? (
                <>
                  <button
                    onClick={handleSaveAssignments}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <Check className="w-4 h-4" />
                    Save Assignments
                  </button>
                  <button
                    onClick={handleCancelEditAssignments}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleStartEditAssignments}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Assignments
                  </button>
                  <Link
                    href="/add-subject"
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Subject
                  </Link>
                  <Link
                    href="/add-lecturer"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-755 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Lecturer
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
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
                  Lecturer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Moderator
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(() => {
                const filteredSubjects = subjects.filter(
                  (s) => s.semester === currentSemester && s.academicYear === currentYear
                );
                
                if (filteredSubjects.length === 0) {
                  return (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium bg-white">
                        No subjects found for Semester {currentSemester} ({currentYear}).
                      </td>
                    </tr>
                  );
                }

                return filteredSubjects.map((subject) => {
                  const currentLecturerId = isEditingAssignments
                    ? tempAssignments[subject.id]?.lecturerId
                    : subject.lecturerId;
                  const currentModeratorId = isEditingAssignments
                    ? tempAssignments[subject.id]?.moderatorId
                    : subject.moderatorId;

                  return (
                    <tr key={subject.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                        {subject.code}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{subject.name}</td>
                      
                      {/* Lecturer Column */}
                      <td className="px-6 py-4">
                        {isEditingAssignments ? (
                          <select
                            value={currentLecturerId || ''}
                            onChange={(e) => handleTempLecturerChange(subject.id, e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="">Select Lecturer</option>
                            {users.map((lecturer) => (
                              <option key={lecturer.id} value={lecturer.id}>
                                {lecturer.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div>
                            {subject.lecturer?.name ? (
                              <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                                {subject.lecturer.name}
                              </span>
                            ) : (
                              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                Unassigned
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Moderator Column */}
                      <td className="px-6 py-4">
                        {isEditingAssignments ? (
                          <select
                            value={currentModeratorId || ''}
                            onChange={(e) => handleTempModeratorChange(subject.id, e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="">Select Moderator</option>
                            {users.map((moderator) => (
                              <option key={moderator.id} value={moderator.id}>
                                {moderator.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div>
                            {subject.moderator?.name ? (
                              <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700">
                                {subject.moderator.name}
                              </span>
                            ) : (
                              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                Unassigned
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
