'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  History,
  FileText,
  LogOut,
  ClipboardCheck,
  User as UserIcon,
} from 'lucide-react';

export function Sidebar() {
  const { user, currentRole, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  const departmentHeadLinks = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', path: '/department-head/subjects', label: 'Subjects', icon: BookOpen },
    { id: 'lecturers', path: '/department-head/lecturers', label: 'Lecturers', icon: Users },
    { id: 'academic', path: '/dashboard', label: 'Academic Settings', icon: Settings },
    { id: 'finalized', path: '/history', label: 'Finalized Papers', icon: ClipboardCheck },
  ];

  const lecturerLinks = [
    { id: 'subjects', path: '/lecturer/dashboard', label: 'Current Subjects', icon: BookOpen },
    { id: 'history', path: '/lecturer/history', label: 'History', icon: History },
  ];

  const moderatorLinks = [
    { id: 'papers', path: '/moderator/dashboard', label: 'Assigned Papers', icon: FileText },
    { id: 'reports', path: '/moderator/dashboard', label: 'Submitted Reports', icon: ClipboardCheck },
    { id: 'history', path: '/moderator/history', label: 'History', icon: History },
  ];

  const links = (currentRole === 'department_head'
    ? departmentHeadLinks
    : currentRole === 'lecturer'
    ? lecturerLinks
    : moderatorLinks).concat([{ id: 'profile', path: '/profile', label: 'Profile', icon: UserIcon }]);

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Paper Moderation</h1>
        <p className="text-sm text-gray-400 mt-1">Wayamba University</p>
      </div>

      <div className="p-4 border-b border-gray-800">
        <div className="text-sm">
          <p className="font-semibold">{user?.name}</p>
          <p className="text-gray-400 text-xs">{user?.email}</p>
          <p className="text-gray-400 text-xs mt-1 capitalize">{currentRole.replace('_', ' ')}</p>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.id}>
              <Link
                href={link.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive(link.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
