// Avatar Upload Component
import React, { useState } from 'react';
import { Camera, Loader, Upload } from 'lucide-react';
import { profileService } from '../../services/profileService';
import { useAuth } from '../../contexts/AuthContext';

interface AvatarUploadProps {
  currentAvatar?: string;
}

export default function AvatarUpload({ currentAvatar }: AvatarUploadProps) {
  const { user, updateUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const response = await profileService.uploadAvatar(file);
      
      if (response.success && response.data && user) {
        updateUser({ ...user, avatar: response.data.avatarUrl });
      } else {
        setError(response.error || 'Failed to upload avatar');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-6">
      {/* Current Avatar */}
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl font-semibold text-white">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        
        {/* Upload Overlay */}
        <label
          htmlFor="avatar-upload"
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          {isUploading ? (
            <Loader className="w-8 h-8 text-white animate-spin" />
          ) : (
            <Camera className="w-8 h-8 text-white" />
          )}
        </label>
        
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
      </div>

      {/* Upload Info */}
      <div className="flex-1">
        <label
          htmlFor="avatar-upload"
          className="btn-secondary inline-flex items-center cursor-pointer"
        >
          <Upload className="w-5 h-5 mr-2" />
          Upload new photo
        </label>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          JPG, PNG or GIF. Max size 5MB.
        </p>
        {error && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

