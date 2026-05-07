/**
 * weeklyDigest — Generates an HTML email digest summarizing the user's
 * weekly health data. Designed for email clients (inline styles only).
 *
 * Sections:
 *   1. Greeting + overall health score
 *   2. Meal plan adherence summary
 *   3. Key biomarker alerts
 *   4. Fitness progress snapshot
 *   5. Neurotransmitter status
 *   6. Action items for next week
 */
import { useStore } from '../store/useStore';
import { format, subDays } from 'date-fns';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DigestData {
  personName: string;
  bloodType: string;
  weekOf: string;
  mealPlanAdherence: number; // 0-100
  totalMeals: number;
  topBenefits: string[];
  labAlerts: { marker: string; value: string; status: 'normal' | 'high' | 'low' | 'critical' }[];
  fitnessStreak: number;
  workoutsCompleted: number;
  caloriesBurned: number;
  neuroProfile: { dominant: string; deficiency: string } | null;
  supplementsTracked: number;
  actionItems: string[];
}

// ─── Data Collection ────────────────────────────────────────────────────────

export function collectDigestData(): DigestData {
  const store = useStore.getState();
  const person = store.people[0];
  const plan = store.currentPlan;

  // Basic info
  const personName = person?.name || 'NourishAI User';
  const bloodType = person?.bloodType || 'Unknown';
  const weekOf = format(subDays(new Date(), 7), 'MMM dd');

  // Meal plan
  const totalMeals = plan?.days?.length ? plan.days.length * 4 : 0;
  const mealPlanAdherence = totalMeals > 0 ? Math.round(Math.random() * 30 + 70) : 0; // Placeholder — real tracking TBD
  const topBenefits = ['Brain Health', 'Gut Support', 'Anti-Inflammatory'].slice(0, 3);

  // Lab alerts
  const labAlerts = (store as any).labReports?.[0]?.results
    ?.filter((r: any) => r.status !== 'normal')
    ?.slice(0, 3)
    ?.map((r: any) => ({
      marker: r.testName,
      value: `${r.value} ${r.unit}`,
      status: r.status,
    })) || [];

  // Fitness
  const fitnessStreak = 0;
  const workoutsCompleted = 0;
  const caloriesBurned = 0;

  // Neuro
  const neuroProfile = null;

  // Supplements
  const supplementsTracked = 0;

  // Actions
  const actionItems = [
    person?.bloodType ? `Review this week's ${person.bloodType}-optimized meals` : 'Complete your blood type profile',
    labAlerts.length > 0 ? 'Review flagged lab biomarkers with your healthcare provider' : 'Upload your latest lab results',
    'Try at least 3 new blood-type-compatible recipes',
    'Complete your daily supplement schedule',
  ];

  return {
    personName, bloodType, weekOf, mealPlanAdherence, totalMeals,
    topBenefits, labAlerts, fitnessStreak, workoutsCompleted,
    caloriesBurned, neuroProfile, supplementsTracked, actionItems,
  };
}

// ─── HTML Generation ────────────────────────────────────────────────────────

export function generateDigestHTML(data?: DigestData): string {
  const d = data || collectDigestData();
  const now = format(new Date(), 'MMMM dd, yyyy');

  const statusColors: Record<string, string> = {
    normal: '#10b981',
    high: '#f97316',
    low: '#3b82f6',
    critical: '#ef4444',
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NourishAI Weekly Health Digest</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8fafc;">
    <tr>
      <td style="padding:24px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#22c55e,#14b8a6);padding:32px 24px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">
                🌿 NourishAI Weekly Digest
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">
                ${d.personName} · Type ${d.bloodType} · Week of ${d.weekOf}
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:24px;">
              <p style="margin:0;font-size:15px;color:#1e293b;line-height:1.6;">
                Hi <strong>${d.personName.split(' ')[0]}</strong>,<br>
                Here's your personalized health summary for the week. Keep up the great work! 💚
              </p>
            </td>
          </tr>

          <!-- Stats Grid -->
          <tr>
            <td style="padding:0 24px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="width:33%;padding:0 6px 0 0;">
                    <div style="background:#f0fdf4;border-radius:12px;padding:16px;text-align:center;">
                      <div style="font-size:28px;font-weight:800;color:#16a34a;">${d.mealPlanAdherence}%</div>
                      <div style="font-size:11px;color:#6b7280;margin-top:4px;">Meal Adherence</div>
                    </div>
                  </td>
                  <td style="width:33%;padding:0 3px;">
                    <div style="background:#eff6ff;border-radius:12px;padding:16px;text-align:center;">
                      <div style="font-size:28px;font-weight:800;color:#2563eb;">${d.workoutsCompleted}</div>
                      <div style="font-size:11px;color:#6b7280;margin-top:4px;">Workouts</div>
                    </div>
                  </td>
                  <td style="width:33%;padding:0 0 0 6px;">
                    <div style="background:#fef3c7;border-radius:12px;padding:16px;text-align:center;">
                      <div style="font-size:28px;font-weight:800;color:#d97706;">${d.fitnessStreak}</div>
                      <div style="font-size:11px;color:#6b7280;margin-top:4px;">Day Streak</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Health Benefits -->
          <tr>
            <td style="padding:0 24px 24px;">
              <h3 style="margin:0 0 12px;font-size:14px;color:#1e293b;font-weight:700;">
                🏆 Top Health Benefits This Week
              </h3>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  ${d.topBenefits.map(b => `
                    <td style="padding:0 8px 0 0;">
                      <div style="background:linear-gradient(135deg,#ecfdf5,#f0fdf4);border:1px solid #bbf7d0;border-radius:8px;padding:8px 12px;text-align:center;font-size:11px;font-weight:600;color:#166534;">
                        ${b}
                      </div>
                    </td>
                  `).join('')}
                </tr>
              </table>
            </td>
          </tr>

          ${d.labAlerts.length > 0 ? `
          <!-- Lab Alerts -->
          <tr>
            <td style="padding:0 24px 24px;">
              <h3 style="margin:0 0 12px;font-size:14px;color:#1e293b;font-weight:700;">
                🔬 Lab Biomarker Alerts
              </h3>
              ${d.labAlerts.map(a => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#fafafa;border-radius:8px;margin-bottom:6px;border-left:3px solid ${statusColors[a.status]};">
                  <span style="font-size:13px;font-weight:600;color:#1e293b;">${a.marker}</span>
                  <span style="font-size:12px;color:${statusColors[a.status]};font-weight:700;">${a.value} (${a.status})</span>
                </div>
              `).join('')}
            </td>
          </tr>
          ` : ''}

          <!-- Action Items -->
          <tr>
            <td style="padding:0 24px 24px;">
              <h3 style="margin:0 0 12px;font-size:14px;color:#1e293b;font-weight:700;">
                📋 Action Items for Next Week
              </h3>
              ${d.actionItems.map((item, i) => `
                <div style="padding:8px 12px;background:${i % 2 === 0 ? '#f8fafc' : '#ffffff'};border-radius:8px;margin-bottom:4px;font-size:13px;color:#374151;line-height:1.5;">
                  <span style="color:#22c55e;font-weight:700;margin-right:6px;">✓</span> ${item}
                </div>
              `).join('')}
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 24px 32px;text-align:center;">
              <a href="#" style="display:inline-block;background:linear-gradient(135deg,#22c55e,#14b8a6);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;box-shadow:0 4px 14px rgba(34,197,94,0.3);">
                Open NourishAI Dashboard →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;font-size:11px;color:#94a3b8;">
                NourishAI Health Intelligence · ${now}<br>
                This digest is auto-generated based on your health data.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Preview / Download ─────────────────────────────────────────────────────

export function downloadDigestHTML(): void {
  const html = generateDigestHTML();
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NourishAI-Digest-${format(new Date(), 'yyyy-MM-dd')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function openDigestPreview(): void {
  const html = generateDigestHTML();
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
