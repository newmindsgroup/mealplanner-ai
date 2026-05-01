// Pending Invitations Component
import React, { useState, useEffect } from 'react';
import { Mail, Clock, CheckCircle, XCircle, MoreVertical, Loader } from 'lucide-react';
import { invitationService } from '../../services/invitationService';
import type { Invitation } from '../../types/invitation';

interface PendingInvitationsProps {
  householdId: string;
}

export default function PendingInvitations({ householdId }: PendingInvitationsProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadInvitations();
  }, [householdId]);

  const loadInvitations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await invitationService.getHouseholdInvitations(householdId);
      if (response.success && response.data) {
        setInvitations(response.data);
      } else {
        setError(response.error || 'Failed to load invitations');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async (invitationId: string) => {
    setActionLoading(invitationId);
    try {
      const response = await invitationService.resendInvitation(invitationId);
      if (response.success) {
        await loadInvitations();
      }
    } catch (err) {
      console.error('Failed to resend invitation:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async (invitationId: string) => {
    if (!confirm('Are you sure you want to revoke this invitation?')) {
      return;
    }

    setActionLoading(invitationId);
    try {
      const response = await invitationService.revokeInvitation(invitationId);
      if (response.success) {
        await loadInvitations();
      }
    } catch (err) {
      console.error('Failed to revoke invitation:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'declined':
      case 'expired':
      case 'revoked':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'accepted':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'declined':
      case 'expired':
      case 'revoked':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="card p-8 text-center">
        <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Invitations Yet
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Invite members to your household to start collaborating
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card divide-y divide-gray-200 dark:divide-gray-700">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              {/* Invitation Info */}
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/20">
                  {getStatusIcon(invitation.status)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {invitation.email}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                        invitation.status
                      )}`}
                    >
                      {invitation.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Invited as {invitation.role} by {invitation.invitedBy.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {invitation.status === 'pending'
                      ? `Expires ${new Date(invitation.expiresAt).toLocaleDateString()}`
                      : `Sent ${new Date(invitation.createdAt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {invitation.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResend(invitation.id)}
                    disabled={actionLoading === invitation.id}
                    className="btn-secondary text-sm"
                  >
                    {actionLoading === invitation.id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      'Resend'
                    )}
                  </button>
                  <button
                    onClick={() => handleRevoke(invitation.id)}
                    disabled={actionLoading === invitation.id}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

