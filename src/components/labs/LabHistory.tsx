import { useState } from 'react';
import { 
  FileText, Search, Filter, Download, Eye, Trash2, Calendar
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { format } from 'date-fns';
import { exportLabReportsToCSV } from '../../services/labExport';

export default function LabHistory() {
  const { people, labReports, deleteLabReport } = useStore();
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'member'>('date');

  // Filter reports
  let filteredReports = labReports;
  
  if (selectedMemberId !== 'all') {
    filteredReports = filteredReports.filter(r => r.memberId === selectedMemberId);
  }
  
  if (searchTerm) {
    filteredReports = filteredReports.filter(r => 
      r.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.labName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.results.some(result => 
        result.testName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }
  
  // Sort reports
  filteredReports = [...filteredReports].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.testDate).getTime() - new Date(a.testDate).getTime();
    } else {
      return a.memberName.localeCompare(b.memberName);
    }
  });

  const handleDelete = (reportId: string, memberName: string) => {
    if (confirm(`Are you sure you want to delete this lab report for ${memberName}? This action cannot be undone.`)) {
      deleteLabReport(reportId);
    }
  };

  const handleExportAll = () => {
    const reportsToExport = selectedMemberId === 'all' 
      ? labReports 
      : labReports.filter(r => r.memberId === selectedMemberId);
    
    exportLabReportsToCSV(reportsToExport, selectedMemberId !== 'all' ? selectedMemberId : undefined);
  };

  const getStatusBadge = (results: any[]) => {
    const critical = results.filter(r => r.status === 'critical').length;
    const abnormal = results.filter(r => r.status === 'high' || r.status === 'low').length;
    const normal = results.filter(r => r.status === 'normal').length;
    
    if (critical > 0) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">Critical</span>;
    }
    if (abnormal > 0) {
      return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">Abnormal</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Normal</span>;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Lab History</h1>
          <p className="text-gray-600 mt-1">Browse all lab reports and results</p>
        </div>
        {filteredReports.length > 0 && (
          <button
            onClick={handleExportAll}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export to CSV
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Member Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Members</option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'member')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="member">Sort by Member</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length > 0 ? (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {report.memberName}
                    </h3>
                    {getStatusBadge(report.results)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(report.testDate), 'MMM dd, yyyy')}
                    </span>
                    {report.labName && (
                      <span>• {report.labName}</span>
                    )}
                    <span>• {report.results.length} tests</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`#/labs/report/${report.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Report"
                  >
                    <Eye className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => handleDelete(report.id, report.memberName)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Report"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {report.results.filter(r => r.status === 'normal').length}
                  </div>
                  <div className="text-xs text-gray-600">Normal</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {report.results.filter(r => r.status === 'high' || r.status === 'low').length}
                  </div>
                  <div className="text-xs text-gray-600">Abnormal</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {report.results.filter(r => r.status === 'critical').length}
                  </div>
                  <div className="text-xs text-gray-600">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {report.results.filter(r => r.isPriority).length}
                  </div>
                  <div className="text-xs text-gray-600">Key Markers</div>
                </div>
              </div>

              {/* AI Insights Preview */}
              {report.aiInsights && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    <span className="font-semibold">AI Insights:</span> {report.aiInsights}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* No Reports */
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Lab Reports Found
          </h2>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search or filters'
              : 'Start by scanning your first lab report'}
          </p>
          {!searchTerm && (
            <a
              href="#/labs/scan"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-5 h-5" />
              Scan Lab Report
            </a>
          )}
        </div>
      )}
    </div>
  );
}

