// ─── API-Synced Hooks ──────────────────────────────────────────────
// These hooks bridge the Zustand store with the backend API.
// When the backend is available, they sync data from the API into the store.
// When offline/mock mode, the store operates as before (localStorage-backed).
//
// USAGE: Replace direct useStore() calls in components with these hooks
// for any data that should be persisted server-side.

import { useCallback, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import type { Person, WeeklyPlan, GroceryList, PantryItem, ChatMessage } from '../types';
import type { LabReport } from '../types/labs';
import { memberService } from '../services/memberService';
import { mealPlanApiService } from '../services/mealPlanApiService';
import { pantryApiService } from '../services/pantryApiService';
import { groceryApiService } from '../services/groceryApiService';
import { labApiService } from '../services/labApiService';
import { chatApiService } from '../services/chatApiService';
import { isMockMode } from '../services/apiClient';

// ─── People / Family Members ──────────────────────────────────────

export function useMembers() {
  const people = useStore((s) => s.people);
  const addPersonLocal = useStore((s) => s.addPerson);
  const updatePersonLocal = useStore((s) => s.updatePerson);
  const removePersonLocal = useStore((s) => s.removePerson);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync from API on mount
  useEffect(() => {
    if (isMockMode()) return;
    setLoading(true);
    memberService.getMembers().then((res) => {
      if (res.success && res.data) {
        // Replace store with server data
        useStore.setState({ people: res.data });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const addPerson = useCallback(async (person: Person) => {
    addPersonLocal(person);
    if (!isMockMode()) {
      const res = await memberService.addMember(person);
      if (res.success && res.data) {
        // Update with server-assigned ID
        updatePersonLocal(person.id, res.data);
      }
    }
  }, [addPersonLocal, updatePersonLocal]);

  const updatePerson = useCallback(async (id: string, updates: Partial<Person>) => {
    updatePersonLocal(id, updates);
    if (!isMockMode()) {
      await memberService.updateMember(id, updates);
    }
  }, [updatePersonLocal]);

  const removePerson = useCallback(async (id: string) => {
    removePersonLocal(id);
    if (!isMockMode()) {
      await memberService.removeMember(id);
    }
  }, [removePersonLocal]);

  return { people, addPerson, updatePerson, removePerson, loading, error };
}

// ─── Meal Plans ────────────────────────────────────────────────────

export function useMealPlans() {
  const currentPlan = useStore((s) => s.currentPlan);
  const plans = useStore((s) => s.plans);
  const setCurrentPlan = useStore((s) => s.setCurrentPlan);
  const addPlanLocal = useStore((s) => s.addPlan);
  const [loading, setLoading] = useState(false);

  // Sync plans from server on mount
  useEffect(() => {
    if (isMockMode()) return;
    setLoading(true);
    mealPlanApiService.getPlans().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        useStore.setState({ plans: res.data, currentPlan: res.data[0] });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const generatePlan = useCallback(async (people: Person[], options?: any) => {
    setLoading(true);
    const res = await mealPlanApiService.generatePlan(people, options);
    if (res.success && res.data) {
      addPlanLocal(res.data);
    }
    setLoading(false);
    return res;
  }, [addPlanLocal]);

  return { currentPlan, plans, setCurrentPlan, generatePlan, loading };
}

// ─── Pantry ────────────────────────────────────────────────────────

export function usePantry() {
  const pantryItems = useStore((s) => s.pantryItems);
  const addItemLocal = useStore((s) => s.addPantryItem);
  const updateItemLocal = useStore((s) => s.updatePantryItem);
  const removeItemLocal = useStore((s) => s.removePantryItem);
  const adjustQuantityLocal = useStore((s) => s.adjustPantryQuantity);
  const [loading, setLoading] = useState(false);

  // Sync from API
  useEffect(() => {
    if (isMockMode()) return;
    setLoading(true);
    pantryApiService.getItems().then((res) => {
      if (res.success && res.data) {
        useStore.setState({ pantryItems: res.data });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const addItem = useCallback(async (item: PantryItem) => {
    addItemLocal(item);
    if (!isMockMode()) {
      const res = await pantryApiService.addItem(item);
      if (res.success && res.data) {
        updateItemLocal(item.id, res.data);
      }
    }
  }, [addItemLocal, updateItemLocal]);

  const updateItem = useCallback(async (id: string, updates: Partial<PantryItem>) => {
    updateItemLocal(id, updates);
    if (!isMockMode()) {
      await pantryApiService.updateItem(id, updates);
    }
  }, [updateItemLocal]);

  const removeItem = useCallback(async (id: string) => {
    removeItemLocal(id);
    if (!isMockMode()) {
      await pantryApiService.removeItem(id);
    }
  }, [removeItemLocal]);

  const adjustQuantity = useCallback(async (id: string, change: number) => {
    adjustQuantityLocal(id, change);
    if (!isMockMode()) {
      await pantryApiService.adjustQuantity(id, change);
    }
  }, [adjustQuantityLocal]);

  return { pantryItems, addItem, updateItem, removeItem, adjustQuantity, loading };
}

// ─── Grocery Lists ─────────────────────────────────────────────────

export function useGroceryLists() {
  const groceryLists = useStore((s) => s.groceryLists);
  const currentGroceryList = useStore((s) => s.currentGroceryList);
  const setCurrentGroceryList = useStore((s) => s.setCurrentGroceryList);
  const addListLocal = useStore((s) => s.addGroceryList);
  const updateItemLocal = useStore((s) => s.updateGroceryItem);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isMockMode()) return;
    setLoading(true);
    groceryApiService.getLists().then((res) => {
      if (res.success && res.data) {
        useStore.setState({ groceryLists: res.data });
        if (res.data.length > 0) {
          setCurrentGroceryList(res.data[0]);
        }
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [setCurrentGroceryList]);

  const generateFromPlan = useCallback(async (plan: WeeklyPlan) => {
    setLoading(true);
    const res = await groceryApiService.generateFromPlan(plan);
    if (res.success && res.data) {
      addListLocal(res.data);
    }
    setLoading(false);
    return res;
  }, [addListLocal]);

  const updateGroceryItem = useCallback(async (listId: string, itemId: string, checked: boolean) => {
    updateItemLocal(listId, itemId, checked);
    if (!isMockMode()) {
      await groceryApiService.updateItem(listId, itemId, checked);
    }
  }, [updateItemLocal]);

  return { groceryLists, currentGroceryList, setCurrentGroceryList, generateFromPlan, updateGroceryItem, loading };
}

// ─── Lab Reports ───────────────────────────────────────────────────

export function useLabReports(memberId?: string) {
  const labReports = useStore((s) => s.labReports);
  const addReportLocal = useStore((s) => s.addLabReport);
  const updateReportLocal = useStore((s) => s.updateLabReport);
  const deleteReportLocal = useStore((s) => s.deleteLabReport);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isMockMode()) return;
    setLoading(true);
    labApiService.getReports(memberId).then((res) => {
      if (res.success && res.data) {
        useStore.setState({ labReports: res.data });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [memberId]);

  const addReport = useCallback(async (report: LabReport) => {
    addReportLocal(report);
    if (!isMockMode()) {
      const res = await labApiService.addReport(report);
      if (res.success && res.data) {
        updateReportLocal(report.id, res.data);
      }
    }
  }, [addReportLocal, updateReportLocal]);

  const deleteReport = useCallback(async (id: string) => {
    deleteReportLocal(id);
    if (!isMockMode()) {
      await labApiService.deleteReport(id);
    }
  }, [deleteReportLocal]);

  const filteredReports = memberId
    ? labReports.filter((r) => r.memberId === memberId)
    : labReports;

  return { labReports: filteredReports, addReport, deleteReport, loading };
}

// ─── Chat ──────────────────────────────────────────────────────────

export function useChat() {
  const chatMessages = useStore((s) => s.chatMessages);
  const addMessageLocal = useStore((s) => s.addChatMessage);
  const clearChatLocal = useStore((s) => s.clearChat);
  const people = useStore((s) => s.people);
  const currentPlan = useStore((s) => s.currentPlan);
  const knowledgeBase = useStore((s) => s.knowledgeBase);
  const [sending, setSending] = useState(false);

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    addMessageLocal(userMsg);

    setSending(true);
    const res = await chatApiService.sendMessage(text, {
      people,
      currentPlan: currentPlan || undefined,
      knowledgeBase,
    });

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: res.success && res.data ? res.data.response : (res.error || 'Sorry, something went wrong.'),
      timestamp: new Date().toISOString(),
    };
    addMessageLocal(assistantMsg);
    setSending(false);

    return assistantMsg;
  }, [addMessageLocal, people, currentPlan, knowledgeBase]);

  const clearChat = useCallback(async () => {
    clearChatLocal();
    if (!isMockMode()) {
      await chatApiService.clearHistory();
    }
  }, [clearChatLocal]);

  return { chatMessages, sendMessage, clearChat, sending };
}
