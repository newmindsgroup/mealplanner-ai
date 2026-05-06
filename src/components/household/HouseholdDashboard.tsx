// Household Dashboard Component
import React, { useState, useEffect } from 'react';
import { Users, Settings, UserPlus, Calendar, ShoppingCart, TrendingUp } from 'lucide-react';
import { useHousehold } from '../../contexts/HouseholdContext';
import { useStore } from '../../store/useStore';
import MemberList from './MemberList';
import HouseholdSettings from './HouseholdSettings';
import HouseholdFoodComparison from './HouseholdFoodComparison';
import CreateHouseholdModal from './CreateHouseholdModal';
import InviteMemberModal from '../invitations/InviteMemberModal';
import { hasPermission } from '../../utils/permissions';

export default function HouseholdDashboard() {
  const { currentHousehold, households, members, refreshHouseholds } = useHousehold();
  const { plans, people } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'settings'>('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Get current user's role in household
  const currentUserRole = members.find(m => m.status === 'active')?.role || 'viewer';
  const canInvite = hasPermission(currentUserRole, 'invite_members');
  const canManageSettings = hasPermission(currentUserRole, 'manage_settings');

  useEffect(() => {
    refreshHouseholds();
  }, [refreshHouseholds]);

  if (households.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="card p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/20 mb-4">
            <Users className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Collaboration
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create a household to share meal plans and collaborate with your family
          </p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary btn-lg">
            <UserPlus className="w-5 h-5" />
            Create Household
          </button>
        </div>
        {showCreateModal && <CreateHouseholdModal onClose={() => setShowCreateModal(false)} />}
      </div>
    );
  }

  if (!currentHousehold) {
    return <div>Select a household...</div>;
  }

  // Stats
  const stats = [
    {
      label: 'Members',
      value: members.length,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      label: 'Family Profiles',
      value: people.length,
      icon: Calendar,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      label: 'Meal Plans',
      value: plans.length,
      icon: ShoppingCart,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      label: 'Active This Week',
      value: members.filter(m => m.status === 'active').length,
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {currentHousehold.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Household Dashboard
          </p>
        </div>
        {canInvite && (
          <button onClick={() => setShowInviteModal(true)} className="btn-primary">
            <UserPlus className="w-5 h-5" />
            Invite Member
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {['overview', 'members', canManageSettings && 'settings'].filter(Boolean).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Members Overview
              </h3>
              <div className="space-y-3">
                {members.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          {member.user.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {member.user.name}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 capitalize">
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Activity
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p>No recent activity</p>
              </div>
            </div>
          </div>

          {/* Family Food Compatibility */}
          <div className="card p-6">
            <HouseholdFoodComparison />
          </div>
        </div>
      )}

      {activeTab === 'members' && <MemberList />}
      
      {activeTab === 'settings' && canManageSettings && (
        <HouseholdSettings household={currentHousehold} />
      )}

      {/* Modals */}
      {showInviteModal && (
        <InviteMemberModal
          householdId={currentHousehold.id}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}

