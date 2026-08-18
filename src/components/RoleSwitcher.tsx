'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

export function RoleSwitcher() {
  const { user, currentRole, setCurrentRole } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const availableRoles: Array<{ role: 'department_head' | 'lecturer' | 'moderator'; label: string }> = [];

  if (user.isDepartmentHead) {
    availableRoles.push({ role: 'department_head', label: 'Department Head' });
  }
  if (user.isLecturer) {
    availableRoles.push({ role: 'lecturer', label: 'Lecturer' });
  }
  if (user.isModerator) {
    availableRoles.push({ role: 'moderator', label: 'Moderator' });
  }

  if (availableRoles.length <= 1) return null;

  const handleRoleChange = (role: 'department_head' | 'lecturer' | 'moderator') => {
    setCurrentRole(role);

    if (role === 'department_head') {
      router.push('/dashboard');
    } else if (role === 'lecturer') {
      router.push('/lecturer/dashboard');
    } else {
      router.push('/moderator/dashboard');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Switch Role</label>
          <div className="flex gap-2">
            {availableRoles.map(({ role, label }) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentRole === role
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
