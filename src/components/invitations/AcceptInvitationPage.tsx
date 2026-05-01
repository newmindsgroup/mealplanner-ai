// Accept Invitation Page Component
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Loader, Home } from 'lucide-react';
import { invitationService } from '../../services/invitationService';
import { useAuth } from '../../contexts/AuthContext';
import type { Invitation } from '../../types/invitation';

export default function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setIsLoading(false);
      return;
    }

    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await invitationService.getInvitationByToken(token);
      
      if (response.success && response.data) {
        setInvitation(response.data);
      } else {
        setError(response.error || 'Invalid or expired invitation');
      }
    } catch (err) {
      setError('Failed to load invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!invitation) return;

    setActionLoading(true);
    setError(null);

    try {
      const response = await invitationService.acceptInvitation(invitation.id);
      
      if (response.success) {
        setAccepted(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(response.error || 'Failed to accept invitation');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!invitation) return;

    if (!confirm('Are you sure you want to decline this invitation?')) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const response = await invitationService.declineInvitation(invitation.id);
      
      if (response.success) {
        navigate('/');
      } else {
        setError(response.error || 'Failed to decline invitation');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <Loader className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/20 mb-4">
            <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Sign In Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in or create an account to accept this invitation
          </p>
          <button
            onClick={() => navigate(`/login?redirect=/accept-invitation?token=${token}`)}
            className="btn-primary w-full"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
        <div className="card p-8 max-w-md w-full text-center animate-scale-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to the Household!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You've successfully joined {invitation?.householdName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Invalid Invitation
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'This invitation link is invalid or has expired'}
          </p>
          <button onClick={() => navigate('/')} className="btn-primary w-full">
            <Home className="w-5 h-5 mr-2" />
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
      <div className="card p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/20 mb-4">
            <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Household Invitation
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You've been invited to join a household
          </p>
        </div>

        {/* Invitation Details */}
        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {invitation.householdName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Invited by <strong>{invitation.invitedBy.name}</strong> ({invitation.invitedBy.email})
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Role: <strong className="capitalize">{invitation.role}</strong>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            disabled={actionLoading}
            className="btn-secondary flex-1"
          >
            <XCircle className="w-5 h-5 mr-2" />
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={actionLoading}
            className="btn-primary flex-1"
          >
            {actionLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin mr-2" />
                Accepting...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Accept
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

