'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Mail, Building, Phone, User as UserIcon } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [contact, setContact] = useState(user?.contact ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setContact(user.contact ?? '');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-3xl shadow-md p-10 text-center max-w-xl">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Profile unavailable</h1>
          <p className="text-gray-600">Please log in to view and edit your profile.</p>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileError('');
    setProfileMessage('');

    if (!name.trim()) {
      setProfileError('Please enter your full name.');
      return;
    }

    const digitsOnly = contact.replace(/\D/g, '');
    if (contact.trim() && digitsOnly.length !== 10) {
      setProfileError('Contact number must be exactly 10 digits.');
      return;
    }

    await updateProfile({ name: name.trim(), contact: contact.trim() });
    setProfileMessage('Profile updated successfully.');
  };

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError('Your new password must be different from the current password.');
      return;
    }

    const changed = await changePassword(currentPassword, newPassword);
    if (!changed) {
      setPasswordError('Current password is incorrect.');
      return;
    }

    setPasswordMessage('Password changed successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <main className="p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header card */}
        <div className="bg-white rounded-3xl shadow p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-3xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <UserIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-500">Your Profile</p>
                <h1 className="text-3xl font-semibold text-gray-900">{user.name}</h1>
                <p className="text-sm text-gray-600 mt-1">{user.email}</p>
              </div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
              <p className="text-sm font-medium text-gray-700">Department</p>
              <p className="text-base text-gray-900 mt-2">{user.department}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          {/* Account details - editable: name + contact only */}
          <section className="bg-white rounded-3xl shadow p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Account details</h2>
              <p className="text-sm text-gray-600 mt-2">Update your name and contact number.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Editable: Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={contact}
                    onChange={(e) => {
                      // Allow only digits and common separators (hyphens, spaces)
                      const raw = e.target.value;
                      // Strip everything except digits
                      const digitsOnly = raw.replace(/\D/g, '');
                      if (digitsOnly.length <= 10) {
                        setContact(digitsOnly);
                      }
                    }}
                    className={`w-full rounded-2xl border pl-10 pr-16 py-3 focus:ring-2 focus:ring-blue-100 ${
                      contact.length > 0 && contact.replace(/\D/g, '').length !== 10
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="e.g. 0711234567"
                    maxLength={10}
                    inputMode="numeric"
                  />
                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono ${
                    contact.length === 10 ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {contact.length}/10
                  </span>
                </div>
                {contact.length > 0 && contact.replace(/\D/g, '').length !== 10 && (
                  <p className="text-xs text-red-500 mt-1">Must be exactly 10 digits.</p>
                )}
              </div>

              {/* Read-only: Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email address <span className="text-xs text-gray-400">(cannot be changed)</span></label>
                <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{user.email}</span>
                </div>
              </div>

              {/* Read-only: Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department <span className="text-xs text-gray-400">(cannot be changed)</span></label>
                <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500">
                  <Building className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{user.department}</span>
                </div>
              </div>

              {profileError && <p className="text-sm text-red-600">{profileError}</p>}
              {profileMessage && <p className="text-sm text-green-600">{profileMessage}</p>}

              <button
                type="submit"
                className="rounded-2xl bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Save changes
              </button>
            </form>
          </section>

          {/* Change password */}
          <section className="bg-white rounded-3xl shadow p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Change password</h2>
              <p className="text-sm text-gray-600 mt-2">Update your password securely.</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 focus:ring-2 focus:ring-blue-100 ${
                    newPassword.length > 0 && newPassword.length < 6
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="At least 6 characters"
                />
                {newPassword.length > 0 && newPassword.length < 6 && (
                  <p className="text-xs text-red-500 mt-1">Password must be at least 6 characters.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Confirm new password"
                />
              </div>

              {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
              {passwordMessage && <p className="text-sm text-green-600">{passwordMessage}</p>}

              <button
                type="submit"
                className="w-full rounded-2xl bg-indigo-600 px-6 py-3 text-white font-medium hover:bg-indigo-700 transition-colors"
              >
                Update password
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
