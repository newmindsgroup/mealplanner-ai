import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Download, FileText, AlertCircle, CheckCircle, Image as ImageIcon,
  TrendingUp, Info
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { format } from 'date-fns';
import { exportLabReportToPDF } from '../../services/labExport';
import { getLabEducation } from '../../data/labEducation';
import type { LabResult } from '../../types/labs';
import { LAB_PANELS } from '../../types/labs';

export default function LabReportView() {
  const { labReports } = useStore();
  const [showImage, setShowImage] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabResult | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  useEffect(() => {
    // Extract report ID from hash
    const hash = window.location.hash;
    if (hash.startsWith('#/labs/report/')) {
      const id = hash.replace('#/labs/report/', '');
      setReportId(id);
    }
  }, []);
  
  const report = reportId ? labReports.find(r => r.id === reportId) : null;

  if (!report) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Not Found</h2>
          <p className="text-gray-600 mb-6">The lab report you're looking for doesn't exist.</p>
          <a
            href="#/labs/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Organize results by category
  const resultsByCategory = report.results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, LabResult[]>);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'high':
      case 'low':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'high':
      case 'low':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getCategoryName = (category: string) => {
    const panel = LAB_PANELS.find(p => p.category === category);
    return panel?.name || category;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <a
            href="#/labs/history"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </a>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Lab Report</h1>
            <p className="text-gray-600 mt-1">
              {report.memberName} • {format(new Date(report.testDate), 'MMMM dd, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {report.imageUrl && (
            <button
              onClick={() => setShowImage(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
              View Original
            </button>
          )}
          <button
            onClick={() => exportLabReportToPDF(report)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Report Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Patient</p>
            <p className="font-semibold text-gray-800">{report.memberName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Test Date</p>
            <p className="font-semibold text-gray-800">
              {format(new Date(report.testDate), 'MMM dd, yyyy')}
            </p>
          </div>
          {report.labName && (
            <div>
              <p className="text-sm text-gray-600">Lab</p>
              <p className="font-semibold text-gray-800">{report.labName}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">Total Tests</p>
            <p className="font-semibold text-gray-800">{report.results.length}</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600">
            {report.results.filter(r => r.status === 'normal').length}
          </div>
          <div className="text-sm text-gray-600">Normal</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">
            {report.results.filter(r => r.status === 'high' || r.status === 'low').length}
          </div>
          <div className="text-sm text-gray-600">Abnormal</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-red-600">
            {report.results.filter(r => r.status === 'critical').length}
          </div>
          <div className="text-sm text-gray-600">Critical</div>
        </div>
      </div>

      {/* AI Insights */}
      {report.aiInsights && (
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            AI Insights
          </h2>
          <p className="text-gray-700">{report.aiInsights}</p>
        </div>
      )}

      {/* Results by Category */}
      <div className="space-y-6">
        {Object.entries(resultsByCategory).map(([category, results]) => (
          <div key={category} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {getCategoryName(category)}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Test</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Result</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Reference Range</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Info</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr 
                      key={result.id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        result.status !== 'normal' ? 'bg-orange-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-800">{result.testName}</span>
                        {result.isPriority && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                            Key Marker
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-800">
                          {result.value} {result.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {result.referenceRangeText || 
                          (result.referenceRangeLow && result.referenceRangeHigh 
                            ? `${result.referenceRangeLow}-${result.referenceRangeHigh} ${result.unit}`
                            : 'N/A')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getStatusIcon(result.status)}
                          <span className="capitalize text-sm">{result.status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedTest(result)}
                          className="p-1 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Info className="w-5 h-5 text-blue-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {showImage && report.imageUrl && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-gray-800">Original Lab Report</h3>
              <button
                onClick={() => setShowImage(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <img src={report.imageUrl} alt="Lab report" className="w-full" />
            </div>
          </div>
        </div>
      )}

      {/* Test Details Modal */}
      {selectedTest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">{selectedTest.testName}</h3>
              <button
                onClick={() => setSelectedTest(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {(() => {
                const education = getLabEducation(selectedTest.testName);
                if (!education) {
                  return <p className="text-gray-600">No educational content available for this test.</p>;
                }
                
                return (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                      <p className="text-gray-700">{education.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Purpose</h4>
                      <p className="text-gray-700">{education.purpose}</p>
                    </div>
                    
                    {selectedTest.status !== 'normal' && (
                      <div className={`p-4 rounded-lg ${getStatusColor(selectedTest.status)}`}>
                        <h4 className="font-semibold mb-2">
                          What {selectedTest.status === 'high' ? 'High' : 'Low'} Levels Mean
                        </h4>
                        <p className="text-sm mb-2">
                          {selectedTest.status === 'high' || selectedTest.status === 'critical'
                            ? education.highMeans.description
                            : education.lowMeans.description}
                        </p>
                        <div className="text-sm">
                          <strong>Common Causes:</strong>
                          <ul className="list-disc ml-5 mt-1">
                            {(selectedTest.status === 'high' || selectedTest.status === 'critical'
                              ? education.highMeans.causes
                              : education.lowMeans.causes
                            ).slice(0, 3).map((cause, i) => (
                              <li key={i}>{cause}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Lifestyle Factors</h4>
                      <ul className="list-disc ml-5 text-gray-700">
                        {education.lifestyleFactors.map((factor, i) => (
                          <li key={i}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

