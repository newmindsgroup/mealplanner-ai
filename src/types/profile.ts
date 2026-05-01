// User Profile Type Definitions

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  phone?: string;
  timezone: string;
  language: string;
  dietaryPreferences: string[];
  favoriteCuisines: string[];
  avatar?: string;
  preferences: ProfilePreferences;
  createdAt: string;
  updatedAt?: string;
}

export interface ProfilePreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
  shareProgressWithHousehold: boolean;
  publicProfile: boolean;
}

export interface UpdateProfileData {
  bio?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  dietaryPreferences?: string[];
  favoriteCuisines?: string[];
  preferences?: Partial<ProfilePreferences>;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const defaultProfilePreferences: ProfilePreferences = {
  emailNotifications: true,
  pushNotifications: true,
  weeklyDigest: true,
  marketingEmails: false,
  shareProgressWithHousehold: true,
  publicProfile: false,
};

