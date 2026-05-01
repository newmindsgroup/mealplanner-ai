// Household Context
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Household, HouseholdMember } from '../types/household';
import { householdService } from '../services/householdService';
import { useAuth } from './AuthContext';

interface HouseholdContextType {
  households: Household[];
  currentHousehold: Household | null;
  members: HouseholdMember[];
  isLoading: boolean;
  error: string | null;
  setCurrentHousehold: (household: Household | null) => void;
  refreshHouseholds: () => Promise<void>;
  refreshMembers: (householdId: string) => Promise<void>;
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export const useHousehold = (): HouseholdContextType => {
  const context = useContext(HouseholdContext);
  if (!context) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  return context;
};

interface HouseholdProviderProps {
  children: React.ReactNode;
}

export const HouseholdProvider: React.FC<HouseholdProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [currentHousehold, setCurrentHouseholdState] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's households
  const refreshHouseholds = useCallback(async () => {
    if (!isAuthenticated) {
      setHouseholds([]);
      setCurrentHouseholdState(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await householdService.getUserHouseholds();

    if (response.success && response.data) {
      setHouseholds(response.data);
      
      // Auto-select first household if none selected
      if (!currentHousehold && response.data.length > 0) {
        setCurrentHouseholdState(response.data[0]);
      }
    } else {
      setError(response.error || 'Failed to load households');
    }

    setIsLoading(false);
  }, [isAuthenticated, currentHousehold]);

  // Fetch household members
  const refreshMembers = useCallback(async (householdId: string) => {
    setIsLoading(true);
    setError(null);

    const response = await householdService.getHouseholdMembers(householdId);

    if (response.success && response.data) {
      setMembers(response.data);
    } else {
      setError(response.error || 'Failed to load members');
    }

    setIsLoading(false);
  }, []);

  // Set current household
  const setCurrentHousehold = useCallback((household: Household | null) => {
    setCurrentHouseholdState(household);
    if (household) {
      refreshMembers(household.id);
      // Store in localStorage for persistence
      localStorage.setItem('currentHouseholdId', household.id);
    } else {
      setMembers([]);
      localStorage.removeItem('currentHouseholdId');
    }
  }, [refreshMembers]);

  // Initialize households on auth
  useEffect(() => {
    if (isAuthenticated) {
      refreshHouseholds();
    }
  }, [isAuthenticated, refreshHouseholds]);

  // Restore current household from localStorage
  useEffect(() => {
    if (households.length > 0 && !currentHousehold) {
      const savedHouseholdId = localStorage.getItem('currentHouseholdId');
      if (savedHouseholdId) {
        const household = households.find((h) => h.id === savedHouseholdId);
        if (household) {
          setCurrentHousehold(household);
        }
      }
    }
  }, [households, currentHousehold, setCurrentHousehold]);

  const value: HouseholdContextType = {
    households,
    currentHousehold,
    members,
    isLoading,
    error,
    setCurrentHousehold,
    refreshHouseholds,
    refreshMembers,
  };

  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>;
};

