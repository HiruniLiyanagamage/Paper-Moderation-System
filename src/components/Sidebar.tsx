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
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
}

export function Sidebar({ mobileOpen, setMobileOpen, collapsed, setCollapsed }: SidebarProps) {
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

  const links = (
    currentRole === 'department_head'
      ? departmentHeadLinks
      : currentRole === 'lecturer'
      ? lecturerLinks
      : moderatorLinks
  ).concat([{ id: 'profile', path: '/profile', label: 'Profile', icon: UserIcon }]);

  const sidebarContent = (
    <div className="h-full flex flex-col bg-gray-900 text-white select-none">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-800 flex items-center justify-between">
        <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'md:hidden' : ''}`}>
          <img src="/logo.png" alt="Wayamba Crest" className="w-8 h-8 rounded shrink-0 object-contain" />
          <div className="min-w-0">
            <h1 className="text-base font-bold text-white truncate">Paper Moderation</h1>
            <p className="text-xs text-gray-400 truncate">Wayamba University</p>
          </div>
        </div>
        
        {/* Close button for Mobile Drawer */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Close Sidebar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Collapse toggle for Desktop */}
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="hidden md:flex text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 ml-auto transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* User Card */}
      <div className={`p-4 border-b border-gray-800 ${collapsed ? 'md:px-2 md:py-4 md:text-center' : ''}`}>
        {!collapsed ? (
          <div className="text-sm">
            <p className="font-semibold text-gray-100 truncate">{user?.name}</p>
            <p className="text-gray-400 text-xs truncate">{user?.email}</p>
            <p className="text-blue-400 text-xs mt-1 font-medium capitalize truncate">
              {currentRole?.replace('_', ' ')}
            </p>
          </div>
        ) : (
          <div className="hidden md:flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white" title={user?.name}>
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1.5">
          {links.map((link) => {
            const active = isActive(link.path);
            return (
              <li key={link.id}>
                <Link
                  href={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    active
                      ? 'bg-blue-600 text-white font-medium shadow-sm'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  } ${collapsed ? 'md:justify-center md:px-2' : ''}`}
                  title={collapsed ? link.label : undefined}
                >
                  <link.icon className="w-5 h-5 shrink-0" />
                  <span className={`text-sm truncate ${collapsed ? 'md:hidden' : ''}`}>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={() => {
            setMobileOpen(false);
            logout();
            router.push('/login');
          }}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-red-900/40 hover:text-red-300 w-full transition-colors ${
            collapsed ? 'md:justify-center md:px-2' : ''
          }`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0 text-red-400" />
          <span className={`text-sm font-medium ${collapsed ? 'md:hidden' : ''}`}>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Mobile Drawer (Slide in from left) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 transition-all duration-300 shrink-0 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
