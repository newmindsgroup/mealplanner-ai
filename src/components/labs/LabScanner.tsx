import { useState, useRef } from 'react';
import { Camera, Upload, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { scanLabReport, type LabScanProgress } from '../../services/labScanning';
import { generateLabAlerts } from '../../services/labAlerts';
import type { LabReport, LabResult } from '../../types/labs';
import LoadingSpinner from '../LoadingSpinner';

export default function LabScanner() {
  const { people, addLabReport, addLabAlert } = useStore();
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState<LabScanProgress | null>(null);
  const [result, setResult] = useState<LabReport | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [showCamera, setShowCamera] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        setImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleScan = async () => {
    if (!image || !selectedMemberId) {
      alert('Please select a household member and upload/capture a lab report image.');
      return;
    }

    const member = people.find((p) => p.id === selectedMemberId);
    if (!member) return;

    setScanning(true);
    setProgress(null);
    setResult(null);

    try {
      const report = await scanLabReport(
        image,
        member.id,
        member.name,
        (prog) => setProgress(prog)
      );

      setResult(report);
      
      // Auto-save the report
      addLabReport(report);
      
      // Generate and add alerts for abnormal values
      const alerts = generateLabAlerts(report);
      alerts.forEach((alert) => addLabAlert(alert));
      
    } catch (error) {
      console.error('Scan error:', error);
      alert(error instanceof Error ? error.message : 'Error scanning lab report. Please try again.');
    } finally {
      setScanning(false);
      setProgress(null);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Scan Lab Report</h2>

        {!result ? (
          <>
            {/* Member Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Family Member
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select Member --</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload/Capture */}
            {!image && !showCamera && (
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  Upload Image
                </button>
                <button
                  onClick={startCamera}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  Take Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}

            {/* Camera View */}
            {showCamera && (
              <div className="relative mb-6">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                  <button
                    onClick={capturePhoto}
                    className="px-6 py-3 bg-white text-gray-800 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                  >
                    Capture
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Image Preview */}
            {image && !showCamera && (
              <div className="mb-6">
                <div className="relative">
                  <img
                    src={image}
                    alt="Lab report"
                    className="w-full rounded-lg shadow-md"
                  />
                  <button
                    onClick={reset}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Scan Button */}
            {image && selectedMemberId && !scanning && (
              <button
                onClick={handleScan}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Scan Lab Report
              </button>
            )}

            {/* Progress Indicator */}
            {scanning && progress && (
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Loader className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-lg font-medium text-gray-800">
                    {progress.message}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  {progress.progress}% complete
                </p>
              </div>
            )}
          </>
        ) : (
          /* Success Result */
          <div>
            <div className="flex items-center gap-3 mb-6 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Lab Report Processed Successfully!
                </h3>
                <p className="text-sm text-gray-600">
                  Found {result.results.length} lab values for {result.memberName}
                </p>
              </div>
            </div>

            {/* Quick Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-gray-800">
                  {result.results.filter((r) => r.status === 'normal').length}
                </div>
                <div className="text-sm text-gray-600">Normal</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {result.results.filter((r) => r.status === 'high' || r.status === 'low').length}
                </div>
                <div className="text-sm text-gray-600">Abnormal</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-red-600">
                  {result.results.filter((r) => r.status === 'critical').length}
                </div>
                <div className="text-sm text-gray-600">Critical</div>
              </div>
            </div>

            {/* AI Insights */}
            {result.aiInsights && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  AI Insights
                </h4>
                <p className="text-gray-700 text-sm">{result.aiInsights}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  reset();
                  window.location.href = '#/labs/dashboard';
                }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View Dashboard
              </button>
              <button
                onClick={reset}
                className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Scan Another
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-2">Tips for Best Results:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Ensure the lab report is well-lit and all text is visible</li>
          <li>• Capture the entire page including test names, values, and reference ranges</li>
          <li>• Avoid shadows and glare on the document</li>
          <li>• For multi-page reports, scan each page separately</li>
        </ul>
      </div>
    </div>
  );
}

