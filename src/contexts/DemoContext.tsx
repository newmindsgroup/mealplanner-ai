import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Person, WeeklyPlan, GroceryList, PantryItem, ChatMessage, LabelAnalysis, Progress } from '../types';
import {
  demoPeople,
  demoWeeklyPlan,
  demoGroceryList,
  demoPantryItems,
  demoChatMessages,
  demoLabelAnalysis,
  demoProgress
} from '../data/demoData';

interface DemoContextType {
  people: Person[];
  weeklyPlan: WeeklyPlan;
  groceryList: GroceryList;
  pantryItems: PantryItem[];
  chatMessages: ChatMessage[];
  labelAnalysis: LabelAnalysis;
  progress: Progress;
  toggleGroceryItem: (itemId: string) => void;
  selectedMealId: string | null;
  setSelectedMealId: (id: string | null) => void;
  selectedBloodType: string;
  setSelectedBloodType: (bloodType: string) => void;
  scanningLabel: boolean;
  triggerLabelScan: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [groceryList, setGroceryList] = useState(demoGroceryList);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [selectedBloodType, setSelectedBloodType] = useState('A+');
  const [scanningLabel, setScanningLabel] = useState(false);

  const toggleGroceryItem = (itemId: string) => {
    setGroceryList(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    }));
  };

  const triggerLabelScan = () => {
    setScanningLabel(true);
    setTimeout(() => setScanningLabel(false), 2500);
  };

  const value: DemoContextType = {
    people: demoPeople,
    weeklyPlan: demoWeeklyPlan,
    groceryList,
    pantryItems: demoPantryItems,
    chatMessages: demoChatMessages,
    labelAnalysis: demoLabelAnalysis,
    progress: demoProgress,
    toggleGroceryItem,
    selectedMealId,
    setSelectedMealId,
    selectedBloodType,
    setSelectedBloodType,
    scanningLabel,
    triggerLabelScan
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}

