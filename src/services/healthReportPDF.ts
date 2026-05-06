/**
 * healthReportPDF — Comprehensive Health Intelligence Report Generator
 * Produces a multi-section PDF that combines all health domains:
 *   • Personal profile & blood type
 *   • Lab biomarkers with status
 *   • Neurotransmitter assessment results
 *   • Fitness profile & nutrition targets
 *   • Supplement schedule
 *   • Proactive insights
 *   • Meal plan summary
 *
 * Uses jsPDF + autoTable (already installed).
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { useStore } from '../store/useStore';
import { useAssessmentStore } from '../store/assessmentStore';
import { generateProactiveInsights } from './proactiveInsights';
import { getDailySupplementSchedule, SUPPLEMENT_COUNT } from '../data/supplementTimingDatabase';
import type { Person } from '../types/index';

// ─── Colors ─────────────────────────────────────────────────────────────────
const COLORS = {
  primary: [56, 132, 103] as [number, number, number],    // emerald-600
  secondary: [99, 102, 241] as [number, number, number],  // indigo-500
  accent: [168, 85, 247] as [number, number, number],     // violet-500
  danger: [239, 68, 68] as [number, number, number],      // red-500
  warning: [245, 158, 11] as [number, number, number],    // amber-500
  success: [34, 197, 94] as [number, number, number],     // green-500
  muted: [148, 163, 184] as [number, number, number],     // slate-400
  dark: [30, 41, 59] as [number, number, number],         // slate-800
};

// ─── Main Export Function ───────────────────────────────────────────────────

export interface HealthReportOptions {
  personId?: string;
  includeLabs?: boolean;
  includeNeuro?: boolean;
  includeFitness?: boolean;
  includeSupplements?: boolean;
  includeInsights?: boolean;
  includeMealPlan?: boolean;
}

export async function generateHealthReportPDF(options: HealthReportOptions = {}): Promise<void> {
  const store = useStore.getState();
  const assessmentStore = useAssessmentStore.getState();
  const {
    includeLabs = true,
    includeNeuro = true,
    includeFitness = true,
    includeSupplements = true,
    includeInsights = true,
    includeMealPlan = true,
  } = options;

  const person = options.personId
    ? store.people.find(p => p.id === options.personId) || store.people[0]
    : store.people[0];

  if (!person) {
    throw new Error('No health profile found. Please set up your profile first.');
  }

  const pdf = new jsPDF();
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const now = new Date();

  // ═══════════════════════════════════════════════════════════════════════════
  // COVER PAGE
  // ═══════════════════════════════════════════════════════════════════════════
  drawCoverPage(pdf, person, W, H, now);

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 1 — Personal Health Profile
  // ═══════════════════════════════════════════════════════════════════════════
  pdf.addPage();
  let y = drawSectionHeader(pdf, '1. Personal Health Profile', COLORS.primary, W);

  const profileData: string[][] = [
    ['Name', person.name],
    ['Blood Type', person.bloodType || 'Not set'],
    ['Age', person.age ? `${person.age} years` : 'Not set'],
    ['Allergies', person.allergies?.length ? person.allergies.join(', ') : 'None recorded'],
    ['Dietary Restrictions', person.dietaryRestrictions?.length ? person.dietaryRestrictions.join(', ') : 'None'],
    ['Health Goals', person.goals?.length ? person.goals.join(', ') : 'None set'],
  ];

  autoTable(pdf, {
    startY: y,
    body: profileData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55, textColor: COLORS.dark },
      1: { cellWidth: 120 },
    },
  });
  y = (pdf as any).lastAutoTable.finalY + 10;

  // Blood type summary
  if (person.bloodType) {
    y = drawSubheading(pdf, `Blood Type ${person.bloodType} Overview`, y);
    const btInfo = getBloodTypeSummary(person.bloodType);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...COLORS.dark);
    const lines = pdf.splitTextToSize(btInfo, W - 28);
    pdf.text(lines, 14, y);
    y += lines.length * 4.5 + 8;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 2 — Lab Biomarkers
  // ═══════════════════════════════════════════════════════════════════════════
  if (includeLabs) {
    const latestReport = store.getLatestLabReport(person.id);
    if (latestReport && latestReport.results?.length > 0) {
      pdf.addPage();
      y = drawSectionHeader(pdf, '2. Lab Biomarkers', COLORS.danger, W);

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Test Date: ${format(new Date(latestReport.testDate), 'MMMM dd, yyyy')}`, 14, y);
      if (latestReport.labName) pdf.text(`Lab: ${latestReport.labName}`, W - 14, y, { align: 'right' });
      y += 8;

      const labData = latestReport.results.map((r: any) => [
        r.testName,
        `${r.value} ${r.unit}`,
        r.referenceRangeText || (r.referenceRangeLow && r.referenceRangeHigh ? `${r.referenceRangeLow}-${r.referenceRangeHigh}` : 'N/A'),
        r.status === 'normal' ? '✓ Normal' : r.status === 'high' ? '↑ High' : r.status === 'low' ? '↓ Low' : '⚠ Critical',
      ]);

      autoTable(pdf, {
        startY: y,
        head: [['Biomarker', 'Result', 'Reference Range', 'Status']],
        body: labData,
        theme: 'striped',
        headStyles: { fillColor: COLORS.danger, textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 55 },
          3: { cellWidth: 30, halign: 'center' },
        },
        didParseCell: (data) => {
          if (data.column.index === 3 && data.section === 'body') {
            const status = latestReport.results[data.row.index]?.status;
            if (status === 'high' || status === 'low') data.cell.styles.textColor = COLORS.warning;
            else if (status === 'critical') data.cell.styles.textColor = COLORS.danger;
            else data.cell.styles.textColor = COLORS.success;
          }
        },
      });

      // AI insights
      if (latestReport.aiInsights) {
        y = (pdf as any).lastAutoTable.finalY + 10;
        y = drawSubheading(pdf, 'AI Lab Insights', y);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        const insightLines = pdf.splitTextToSize(latestReport.aiInsights, W - 28);
        if (y + insightLines.length * 4.5 > H - 30) { pdf.addPage(); y = 20; }
        pdf.text(insightLines, 14, y);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 3 — Neurotransmitter Profile
  // ═══════════════════════════════════════════════════════════════════════════
  if (includeNeuro) {
    const neuroResult = assessmentStore.getAdjustedResult() || assessmentStore.result;
    if (neuroResult) {
      pdf.addPage();
      y = drawSectionHeader(pdf, '3. Neurotransmitter Profile', COLORS.accent, W);

      const neuroData: string[][] = [
        ['Dominant Nature', neuroResult.dominantNature || 'Balanced'],
        ['Primary Deficiency', neuroResult.primaryDeficiency || 'None detected'],
      ];

      // Add nature scores
      if (neuroResult.natureScores) {
        Object.entries(neuroResult.natureScores).forEach(([nature, score]) => {
          neuroData.push([`${nature} Score`, `${score}%`]);
        });
      }

      // Add deficiency scores
      if (neuroResult.deficiencyScores) {
        Object.entries(neuroResult.deficiencyScores).forEach(([def, score]) => {
          neuroData.push([`${def} Deficiency`, `${score}%`]);
        });
      }

      autoTable(pdf, {
        startY: y,
        body: neuroData,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 55, textColor: COLORS.dark },
          1: { cellWidth: 120 },
        },
      });

      // AI protocol if available
      if (assessmentStore.aiProtocol) {
        y = (pdf as any).lastAutoTable.finalY + 10;
        y = drawSubheading(pdf, 'AI Nutritional Protocol', y);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const protocolLines = pdf.splitTextToSize(assessmentStore.aiProtocol, W - 28);
        if (y + protocolLines.length * 4.5 > H - 30) { pdf.addPage(); y = 20; }
        pdf.text(protocolLines, 14, y);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 4 — Supplement Schedule
  // ═══════════════════════════════════════════════════════════════════════════
  if (includeSupplements) {
    pdf.addPage();
    y = drawSectionHeader(pdf, '4. Supplement Timing Schedule', COLORS.secondary, W);

    const schedule = getDailySupplementSchedule();
    const bt = person.bloodType?.replace(/[+-]/, '').toUpperCase() || '';

    const timeSlots = [
      { key: 'morning', label: '☀️ Morning' },
      { key: 'afternoon', label: '☕ Afternoon' },
      { key: 'evening', label: '🌅 Evening' },
      { key: 'bedtime', label: '🌙 Bedtime' },
      { key: 'any', label: '🔄 Any Time' },
    ];

    for (const slot of timeSlots) {
      const supps = schedule[slot.key];
      if (!supps || supps.length === 0) continue;

      if (y > H - 50) { pdf.addPage(); y = 20; }

      y = drawSubheading(pdf, slot.label, y);

      const suppData = supps.map(s => {
        const btNote = bt && s.bloodTypeNotes?.[bt] ? s.bloodTypeNotes[bt] : '';
        return [
          s.name,
          s.dosageRange,
          s.mealTiming === 'with food' ? 'With food' : s.mealTiming === 'empty stomach' ? 'Empty stomach' : 'Either',
          btNote || '—',
        ];
      });

      autoTable(pdf, {
        startY: y,
        head: [['Supplement', 'Dosage', 'Timing', `Type ${bt || '?'} Note`]],
        body: suppData,
        theme: 'striped',
        headStyles: { fillColor: COLORS.secondary, textColor: [255, 255, 255] },
        styles: { fontSize: 8.5 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          3: { cellWidth: 55, fontStyle: 'italic' },
        },
      });
      y = (pdf as any).lastAutoTable.finalY + 8;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 5 — Proactive Health Insights
  // ═══════════════════════════════════════════════════════════════════════════
  if (includeInsights) {
    const insights = generateProactiveInsights();
    if (insights.length > 0) {
      pdf.addPage();
      y = drawSectionHeader(pdf, '5. Proactive Health Insights', COLORS.primary, W);

      const insightData = insights.slice(0, 12).map(i => [
        i.severity === 'urgent' ? '⚠️ URGENT' : i.severity === 'warning' ? '⚡ WARNING' : i.severity === 'suggestion' ? '💡 TIP' : 'ℹ️ INFO',
        i.title,
        i.description,
      ]);

      autoTable(pdf, {
        startY: y,
        head: [['Priority', 'Insight', 'Details']],
        body: insightData,
        theme: 'striped',
        headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255] },
        styles: { fontSize: 8.5, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 45, fontStyle: 'bold' },
          2: { cellWidth: 110 },
        },
        didParseCell: (data) => {
          if (data.column.index === 0 && data.section === 'body') {
            const sev = insights[data.row.index]?.severity;
            if (sev === 'urgent') data.cell.styles.textColor = COLORS.danger;
            else if (sev === 'warning') data.cell.styles.textColor = COLORS.warning;
            else if (sev === 'suggestion') data.cell.styles.textColor = COLORS.secondary;
          }
        },
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 6 — Active Meal Plan Summary
  // ═══════════════════════════════════════════════════════════════════════════
  if (includeMealPlan && store.currentPlan) {
    pdf.addPage();
    y = drawSectionHeader(pdf, '6. Active Meal Plan', COLORS.success, W);

    const plan = store.currentPlan;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Week Starting: ${plan.weekStart}`, 14, y);
    y += 8;

    const mealData = plan.days.slice(0, 7).map((d: any, i: number) => [
      `Day ${i + 1}`,
      d.breakfast?.name || '—',
      d.lunch?.name || '—',
      d.dinner?.name || '—',
    ]);

    autoTable(pdf, {
      startY: y,
      head: [['Day', 'Breakfast', 'Lunch', 'Dinner']],
      body: mealData,
      theme: 'striped',
      headStyles: { fillColor: COLORS.success, textColor: [255, 255, 255] },
      styles: { fontSize: 8.5, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 20, fontStyle: 'bold' },
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FOOTER ON ALL PAGES
  // ═══════════════════════════════════════════════════════════════════════════
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...COLORS.muted);

    // Page number
    pdf.text(`Page ${i} of ${pageCount}`, W / 2, H - 8, { align: 'center' });

    // Branding
    if (i > 1) {
      pdf.text('NourishAI Health Intelligence Report', 14, H - 8);
      pdf.text(`Generated: ${format(now, 'MMM dd, yyyy h:mm a')}`, W - 14, H - 8, { align: 'right' });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVE
  // ═══════════════════════════════════════════════════════════════════════════
  const safeName = person.name.replace(/[^a-zA-Z0-9]/g, '-');
  pdf.save(`NourishAI-Health-Report-${safeName}-${format(now, 'yyyy-MM-dd')}.pdf`);
}

// ─── Drawing Helpers ────────────────────────────────────────────────────────

function drawCoverPage(pdf: jsPDF, person: Person, W: number, H: number, now: Date) {
  // Background gradient bar
  pdf.setFillColor(...COLORS.primary);
  pdf.rect(0, 0, W, 80, 'F');

  // Title
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('NourishAI', W / 2, 30, { align: 'center' });

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Comprehensive Health Intelligence Report', W / 2, 42, { align: 'center' });

  // Divider line
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.5);
  pdf.line(60, 50, W - 60, 50);

  // Person info
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(person.name, W / 2, 65, { align: 'center' });

  // Blood type badge
  if (person.bloodType) {
    pdf.setFontSize(11);
    pdf.text(`Blood Type ${person.bloodType}`, W / 2, 75, { align: 'center' });
  }

  // Date block
  pdf.setTextColor(...COLORS.dark);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Report Date: ${format(now, 'MMMM dd, yyyy')}`, W / 2, 100, { align: 'center' });

  // Data summary box
  const store = useStore.getState();
  const assessmentStore = useAssessmentStore.getState();
  const labReport = store.getLatestLabReport(person.id);
  const neuroResult = assessmentStore.getAdjustedResult() || assessmentStore.result;

  const dataSources: string[] = [];
  if (labReport) dataSources.push(`${labReport.results?.length || 0} Lab Biomarkers`);
  if (neuroResult) dataSources.push('Neurotransmitter Profile');
  if (person.goals?.length) dataSources.push(`${person.goals.length} Health Goals`);
  if (store.currentPlan) dataSources.push('Active Meal Plan');
  dataSources.push(`${SUPPLEMENT_COUNT} Supplement Protocols`);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...COLORS.secondary);
  pdf.text('Data Sources Included', W / 2, 120, { align: 'center' });

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...COLORS.dark);
  dataSources.forEach((src, i) => {
    pdf.text(`• ${src}`, W / 2, 130 + i * 6, { align: 'center' });
  });

  // Disclaimer
  pdf.setFontSize(7.5);
  pdf.setTextColor(...COLORS.muted);
  const disclaimer = 'This report is for educational and informational purposes only. It is not medical advice. Always consult your healthcare provider before making health decisions based on this report.';
  const disclaimerLines = pdf.splitTextToSize(disclaimer, W - 40);
  pdf.text(disclaimerLines, W / 2, H - 30, { align: 'center' });
}

function drawSectionHeader(pdf: jsPDF, title: string, color: [number, number, number], W: number): number {
  // Color bar
  pdf.setFillColor(...color);
  pdf.rect(0, 0, W, 4, 'F');

  // Title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...color);
  pdf.text(title, 14, 20);

  // Underline
  pdf.setDrawColor(...color);
  pdf.setLineWidth(0.3);
  pdf.line(14, 23, W - 14, 23);

  return 30;
}

function drawSubheading(pdf: jsPDF, text: string, y: number): number {
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...COLORS.dark);
  pdf.text(text, 14, y);
  return y + 6;
}

function getBloodTypeSummary(bloodType: string): string {
  const bt = bloodType.replace(/[+-]/, '').toUpperCase();
  const summaries: Record<string, string> = {
    O: 'Type O ("The Hunter") — Thrives on high-protein diets with lean meats, fish, and vegetables. Benefits from vigorous exercise. Should limit grains, dairy, and legumes. Naturally higher stomach acid supports protein digestion. Key nutrients: B12, iron, iodine.',
    A: 'Type A ("The Agrarian") — Thrives on plant-based diets with soy, grains, organic vegetables, and seafood. Benefits from calming exercise like yoga and tai chi. Should limit red meat and dairy. Naturally lower stomach acid favors vegetable-based proteins.',
    B: 'Type B ("The Nomad") — Most balanced diet of all blood types. Can handle dairy, meat, fish, grains, and vegetables well. Benefits from moderate exercise like swimming, hiking, cycling. Should avoid chicken, corn, wheat, and lentils.',
    AB: 'Type AB ("The Enigma") — Combination of A and B with unique needs. Thrives on seafood, tofu, dairy, green vegetables, and kelp. Benefits from a mix of calming and moderate exercise. Should avoid red meat, kidney beans, seeds, corn, and buckwheat.',
  };
  return summaries[bt] || 'Blood type dietary information not available.';
}
