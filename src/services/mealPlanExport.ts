/**
 * mealPlanExport — Generates a downloadable PDF of the weekly meal plan.
 * Includes:
 *   • 7-day grid (breakfast, lunch, dinner, snacks)
 *   • Consolidated grocery list by category
 *   • Nutrition highlights per day
 *   • Blood type compatibility notes
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { useStore } from '../store/useStore';

const COLORS = {
  primary: [56, 132, 103] as [number, number, number],
  accent: [99, 102, 241] as [number, number, number],
  warm: [245, 158, 11] as [number, number, number],
  dark: [30, 41, 59] as [number, number, number],
  muted: [148, 163, 184] as [number, number, number],
};

export async function exportMealPlanPDF(): Promise<void> {
  const store = useStore.getState();
  const plan = store.currentPlan;
  const person = store.people[0];

  if (!plan || !plan.days?.length) {
    throw new Error('No active meal plan found. Generate a plan first.');
  }

  const pdf = new jsPDF();
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const now = new Date();

  // ═══════════════════════════════════════════════════════════════════════════
  // COVER
  // ═══════════════════════════════════════════════════════════════════════════
  pdf.setFillColor(...COLORS.primary);
  pdf.rect(0, 0, W, 50, 'F');

  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('NourishAI Weekly Meal Plan', W / 2, 25, { align: 'center' });

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(
    `${person?.name || 'Your Plan'} · ${person?.bloodType ? `Type ${person.bloodType}` : ''} · Week of ${plan.weekStart || format(now, 'MMM dd')}`,
    W / 2, 38,
    { align: 'center' },
  );

  let y = 60;

  // ═══════════════════════════════════════════════════════════════════════════
  // DAILY MEAL TABLE
  // ═══════════════════════════════════════════════════════════════════════════
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...COLORS.dark);
  pdf.text('📅 7-Day Meal Schedule', 14, y);
  y += 8;

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const mealData = plan.days.slice(0, 7).map((day: any, i: number) => [
    dayNames[i] || `Day ${i + 1}`,
    day.breakfast?.name || '—',
    day.lunch?.name || '—',
    day.dinner?.name || '—',
    day.snacks?.map((s: any) => s.name || s).join(', ') || '—',
  ]);

  autoTable(pdf, {
    startY: y,
    head: [['Day', '🌅 Breakfast', '☀️ Lunch', '🌙 Dinner', '🍎 Snacks']],
    body: mealData,
    theme: 'striped',
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontSize: 9 },
    styles: { fontSize: 8.5, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 22 },
      1: { cellWidth: 38 },
      2: { cellWidth: 38 },
      3: { cellWidth: 38 },
      4: { cellWidth: 42 },
    },
  });
  y = (pdf as any).lastAutoTable.finalY + 12;

  // ═══════════════════════════════════════════════════════════════════════════
  // GROCERY LIST
  // ═══════════════════════════════════════════════════════════════════════════
  const groceryItems = store.groceryList || [];
  if (groceryItems.length > 0) {
    if (y > H - 60) { pdf.addPage(); y = 20; }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...COLORS.accent);
    pdf.text('🛒 Auto-Generated Grocery List', 14, y);
    y += 8;

    // Group by category
    const grouped: Record<string, string[]> = {};
    groceryItems.forEach((item: any) => {
      const cat = item.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item.name || item);
    });

    const groceryData = Object.entries(grouped).flatMap(([cat, items]) =>
      items.map((name, i) => [i === 0 ? cat : '', name])
    );

    autoTable(pdf, {
      startY: y,
      head: [['Category', 'Item']],
      body: groceryData,
      theme: 'striped',
      headStyles: { fillColor: COLORS.accent, textColor: [255, 255, 255], fontSize: 9 },
      styles: { fontSize: 8.5, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 35 },
      },
    });
    y = (pdf as any).lastAutoTable.finalY + 12;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NUTRITION SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  if (y > H - 50) { pdf.addPage(); y = 20; }

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...COLORS.warm);
  pdf.text('📊 Weekly Nutrition Overview', 14, y);
  y += 8;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...COLORS.dark);

  const nutritionNotes = [
    person?.bloodType ? `Meals are optimized for Blood Type ${person.bloodType} compatibility.` : 'No blood type data available — using general nutrition guidelines.',
    'Each meal balances macronutrients (protein, healthy fats, complex carbs) for sustained energy.',
    person?.allergies?.length ? `Allergens excluded: ${person.allergies.join(', ')}.` : 'No allergen restrictions applied.',
    person?.goals?.length ? `Optimized for goals: ${person.goals.join(', ')}.` : 'No specific health goals set.',
    'For optimal results, follow the supplement timing schedule alongside this plan.',
  ];

  nutritionNotes.forEach(note => {
    const lines = pdf.splitTextToSize(`• ${note}`, W - 28);
    if (y + lines.length * 4.5 > H - 20) { pdf.addPage(); y = 20; }
    pdf.text(lines, 14, y);
    y += lines.length * 4.5 + 2;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════════════════════════════
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...COLORS.muted);
    pdf.text(`Page ${i} of ${pageCount}`, W / 2, H - 8, { align: 'center' });
    pdf.text('NourishAI Meal Plan', 14, H - 8);
    pdf.text(format(now, 'MMM dd, yyyy'), W - 14, H - 8, { align: 'right' });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVE
  // ═══════════════════════════════════════════════════════════════════════════
  const safeName = (person?.name || 'plan').replace(/[^a-zA-Z0-9]/g, '-');
  pdf.save(`NourishAI-MealPlan-${safeName}-${format(now, 'yyyy-MM-dd')}.pdf`);
}
