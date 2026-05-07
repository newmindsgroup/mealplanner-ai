import { useState } from 'react';
import { 
  FileText, TrendingUp, AlertCircle, Plus, Activity, Calendar,
  ArrowUp, ArrowDown, Minus, ChevronRight
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { format } from 'date-fns';
import type { LabAnalyticsSummary } from '../../types/labs';

export default function LabsDashboard() {
  const { 
    people, 
    getLabAnalyticsSummary, 
    getActiveLabAlerts,
    getLatestLabReport 
  } = useStore();
  
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    people.length > 0 ? people[0].id : ''
  );

  const summary: LabAnalyticsSummary | null = selectedMemberId 
    ? getLabAnalyticsSummary(selectedMemberId)
    : null;
  
  const activeAlerts = selectedMemberId ? getActiveLabAlerts(selectedMemberId) : [];
  const latestReport = selectedMemberId ? getLatestLabReport(selectedMemberId) : null;

  const getTrendIcon = (trend?: 'improving' | 'stable' | 'worsening' | 'fluctuating') => {
    switch (trend) {
      case 'improving':
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'worsening':
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-50';
      case 'high':
      case 'low':
        return 'text-orange-600 bg-orange-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (people.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Family Members Yet
          </h2>
          <p className="text-gray-600 mb-6">
            Add family members to start tracking lab results
          </p>
          <a
            href="#/profile"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Family Member
          </a>
        </div>
      </div>
    );
  }

  return (
    <div id="tour-labs-dashboard" className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Labs Dashboard</h1>
          <p className="text-gray-600 mt-1">Track and analyze blood work results</p>
        </div>
        <a
          id="tour-labs-scan"
          href="#/labs/scan"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Scan Lab Report
        </a>
      </div>

      {/* Member Selector */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          View Labs For:
        </label>
        <div className="flex gap-2 flex-wrap">
          {people.map((person) => {
            const memberSummary = getLabAnalyticsSummary(person.id);
            const hasAlerts = memberSummary.activeAlerts > 0;
            
            return (
              <button
                key={person.id}
                onClick={() => setSelectedMemberId(person.id)}
                className={`relative px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedMemberId === person.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {person.name}
                {hasAlerts && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                    {memberSummary.activeAlerts}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {summary && summary.totalReports > 0 ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">
                    {summary.totalReports}
                  </p>
                </div>
                <FileText className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Alerts</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">
                    {summary.activeAlerts}
                  </p>
                  {summary.criticalAlerts > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      {summary.criticalAlerts} critical
                    </p>
                  )}
                </div>
                <AlertCircle className="w-12 h-12 text-orange-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Improving</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {summary.improvementCount}
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Latest Report</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">
                    {summary.latestReportDate 
                      ? format(new Date(summary.latestReportDate), 'MMM dd, yyyy')
                      : 'N/A'}
                  </p>
                </div>
                <Calendar className="w-12 h-12 text-gray-600 opacity-20" />
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          {activeAlerts.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-600" />
                Active Alerts
              </h2>
              <div className="space-y-3">
                {activeAlerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.severity === 'critical'
                        ? 'border-red-600 bg-red-50'
                        : alert.severity === 'high'
                        ? 'border-orange-600 bg-orange-50'
                        : 'border-yellow-600 bg-yellow-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {alert.testName}
                        </h3>
                        <p className="text-sm text-gray-700 mt-1">
                          {alert.message}
                        </p>
                        {alert.recommendation && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            {alert.recommendation}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        alert.severity === 'critical'
                          ? 'bg-red-600 text-white'
                          : alert.severity === 'high'
                          ? 'bg-orange-600 text-white'
                          : 'bg-yellow-600 text-white'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {activeAlerts.length > 5 && (
                <a
                  href="#/labs/alerts"
                  className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All Alerts ({activeAlerts.length})
                  <ChevronRight className="w-4 h-4" />
                </a>
              )}
            </div>
          )}

          {/* Key Health Markers */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Key Health Markers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.keyMarkers.map((marker) => (
                <div
                  key={marker.testName}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {marker.testName}
                    </h3>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(marker.trend)}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(marker.status)}`}>
                        {marker.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {marker.value} <span className="text-sm text-gray-600">{marker.unit}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(marker.date), 'MMM dd, yyyy')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="#/labs/history"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <FileText className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-1">View History</h3>
              <p className="text-sm text-gray-600">
                Browse all past lab reports and results
              </p>
            </a>

            <a
              id="tour-labs-trends"
              href="#/labs/trends"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <TrendingUp className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-1">View Trends</h3>
              <p className="text-sm text-gray-600">
                Analyze changes in lab values over time
              </p>
            </a>

            <a
              href="#/labs/education"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <Activity className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-1">Learn About Labs</h3>
              <p className="text-sm text-gray-600">
                Understand what each lab test measures
              </p>
            </a>
          </div>
        </>
      ) : (
        /* No Reports Yet */
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Lab Reports Yet
          </h2>
          <p className="text-gray-600 mb-6">
            Get started by scanning your first lab report for {summary?.memberName || 'this member'}
          </p>
          <a
            href="#/labs/scan"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Scan First Lab Report
          </a>
        </div>
      )}
    </div>
  );
}

