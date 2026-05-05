// Account Settings Component
import React, { useState } from 'react';
import { Lock, Mail, Trash2, Loader, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import { useNavigate } from 'react-router-dom';

export default function AccountSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Password Change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Account Deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await profileService.changePassword(passwordData);
      
      if (response.success) {
        setPasswordSuccess(true);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => {
          setPasswordSuccess(false);
          setShowPasswordForm(false);
        }, 2000);
      } else {
        setPasswordError(response.error || 'Failed to change password');
      }
    } catch (err) {
      setPasswordError('An unexpected error occurred');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Please enter your password');
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const response = await profileService.deleteAccount(deletePassword);
      
      if (response.success) {
        await logout();
        navigate('/');
      } else {
        setDeleteError(response.error || 'Failed to delete account');
      }
    } catch (err) {
      setDeleteError('An unexpected error occurred');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email (Read-only) */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Address
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-900 dark:text-white font-medium">{user?.email}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              This is your primary email address
            </p>
          </div>
          {user?.emailVerified && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Password */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Password
        </h2>

        {!showPasswordForm ? (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Change your password to keep your account secure
            </p>
            <button
              onClick={() => setShowPasswordForm(true)}
              className="btn-secondary"
            >
              Change Password
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordError && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm">
                Password changed successfully!
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordError(null);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="btn-secondary"
                disabled={passwordLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Danger Zone - Delete Account */}
      <div className="card p-6 border-2 border-red-200 dark:border-red-900/30">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h2>

        {!showDeleteConfirm ? (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Once you delete your account, there is no going back. This will permanently delete all your data, including meal plans, profiles, and progress.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-secondary text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="w-5 h-5" />
              Delete Account
            </button>
          </div>
        ) : (
          <div>
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-4">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-2">
                ⚠️ This action cannot be undone!
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                All your data will be permanently deleted. Please confirm by entering your password.
              </p>
            </div>

            {deleteError && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                {deleteError}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm your password
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword('');
                  setDeleteError(null);
                }}
                className="btn-secondary"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="btn-danger"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Yes, Delete My Account
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

