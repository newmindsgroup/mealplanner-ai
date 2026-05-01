import type { LabReport, LabResult, LabAlert, AlertSeverity } from '../types/labs';
import { getLabEducation } from '../data/labEducation';

/**
 * Generate alerts for abnormal lab values in a report
 */
export function generateLabAlerts(report: LabReport): LabAlert[] {
  const alerts: LabAlert[] = [];

  report.results.forEach((result) => {
    if (result.status === 'normal') return;

    const severity = determineSeverity(result);
    const alert: LabAlert = {
      id: crypto.randomUUID(),
      reportId: report.id,
      resultId: result.id,
      memberId: report.memberId,
      memberName: report.memberName,
      testName: result.testName,
      value: result.value,
      unit: result.unit,
      referenceRange: formatReferenceRange(result),
      severity,
      status: result.status,
      message: generateAlertMessage(result),
      recommendation: generateRecommendation(result),
      createdAt: new Date().toISOString(),
      acknowledged: false,
    };

    alerts.push(alert);
  });

  return alerts;
}

/**
 * Determine alert severity based on lab result
 */
function determineSeverity(result: LabResult): AlertSeverity {
  if (result.status === 'critical') {
    return 'critical';
  }

  // High priority markers get higher severity
  if (result.isPriority) {
    return result.status === 'high' || result.status === 'low' ? 'high' : 'moderate';
  }

  // Calculate how far from normal
  if (typeof result.value === 'number' && result.referenceRangeLow && result.referenceRangeHigh) {
    const range = result.referenceRangeHigh - result.referenceRangeLow;
    const deviation = result.status === 'high'
      ? (result.value - result.referenceRangeHigh) / range
      : (result.referenceRangeLow - result.value) / range;

    if (deviation > 0.5) return 'high';
    if (deviation > 0.2) return 'moderate';
    return 'low';
  }

  return result.status === 'high' || result.status === 'low' ? 'moderate' : 'low';
}

/**
 * Format reference range for display
 */
function formatReferenceRange(result: LabResult): string {
  if (result.referenceRangeText) {
    return result.referenceRangeText;
  }

  if (result.referenceRangeLow && result.referenceRangeHigh) {
    return `${result.referenceRangeLow}-${result.referenceRangeHigh} ${result.unit}`;
  }

  if (result.referenceRangeLow) {
    return `>${result.referenceRangeLow} ${result.unit}`;
  }

  if (result.referenceRangeHigh) {
    return `<${result.referenceRangeHigh} ${result.unit}`;
  }

  return 'Reference range not available';
}

/**
 * Generate human-readable alert message
 */
function generateAlertMessage(result: LabResult): string {
  const directionText = result.status === 'high' ? 'elevated' : 'low';
  const severity = result.status === 'critical' ? 'critically ' : '';

  return `${result.testName} is ${severity}${directionText} at ${result.value} ${result.unit}`;
}

/**
 * Generate recommendation based on lab result and educational content
 */
function generateRecommendation(result: LabResult): string {
  const education = getLabEducation(result.testName);

  if (!education) {
    return 'Review this result with your healthcare provider for personalized guidance.';
  }

  const isHigh = result.status === 'high' || result.status === 'critical';
  const relevantInfo = isHigh ? education.highMeans : education.lowMeans;

  // Get top lifestyle factors
  const lifestyleFactors = education.lifestyleFactors.slice(0, 2);

  let recommendation = isHigh 
    ? `${relevantInfo.description}. ` 
    : `${relevantInfo.description}. `;

  if (lifestyleFactors.length > 0) {
    recommendation += `Consider: ${lifestyleFactors.join(', ')}.`;
  }

  return recommendation;
}

/**
 * Check if an alert should be created based on trend
 * (e.g., consistently worsening values)
 */
export function shouldCreateTrendAlert(
  testName: string,
  recentValues: Array<{ value: number; date: string; status: string }>
): boolean {
  if (recentValues.length < 3) return false;

  // Check if consistently moving away from normal
  const abnormalCount = recentValues.filter(v => v.status !== 'normal').length;
  const allAbnormal = abnormalCount === recentValues.length;

  if (!allAbnormal) return false;

  // Check if trend is worsening (values getting more extreme)
  const values = recentValues.map(v => v.value);
  const isIncreasing = values.every((val, idx) => idx === 0 || val >= values[idx - 1]);
  const isDecreasing = values.every((val, idx) => idx === 0 || val <= values[idx - 1]);

  return isIncreasing || isDecreasing;
}

/**
 * Priority score for sorting alerts (higher = more urgent)
 */
export function getAlertPriority(alert: LabAlert): number {
  let priority = 0;

  // Severity
  switch (alert.severity) {
    case 'critical':
      priority += 100;
      break;
    case 'high':
      priority += 50;
      break;
    case 'moderate':
      priority += 25;
      break;
    case 'low':
      priority += 10;
      break;
  }

  // Recency (more recent = higher priority)
  const daysOld = Math.floor(
    (Date.now() - new Date(alert.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  priority -= daysOld;

  // Critical tests get bonus priority
  const criticalTests = [
    'Glucose',
    'Potassium',
    'Creatinine',
    'Hemoglobin',
    'WBC',
    'Platelets',
  ];
  if (criticalTests.includes(alert.testName)) {
    priority += 20;
  }

  return priority;
}

/**
 * Group alerts by member for batch notifications
 */
export function groupAlertsByMember(alerts: LabAlert[]): Map<string, LabAlert[]> {
  const grouped = new Map<string, LabAlert[]>();

  alerts.forEach((alert) => {
    const memberAlerts = grouped.get(alert.memberId) || [];
    memberAlerts.push(alert);
    grouped.set(alert.memberId, memberAlerts);
  });

  // Sort each member's alerts by priority
  grouped.forEach((memberAlerts) => {
    memberAlerts.sort((a, b) => getAlertPriority(b) - getAlertPriority(a));
  });

  return grouped;
}

/**
 * Format alert summary for notifications
 */
export function formatAlertSummary(alerts: LabAlert[]): string {
  if (alerts.length === 0) return 'No active alerts';

  const critical = alerts.filter((a) => a.severity === 'critical').length;
  const high = alerts.filter((a) => a.severity === 'high').length;
  const moderate = alerts.filter((a) => a.severity === 'moderate').length;

  const parts: string[] = [];

  if (critical > 0) {
    parts.push(`${critical} critical`);
  }
  if (high > 0) {
    parts.push(`${high} high`);
  }
  if (moderate > 0) {
    parts.push(`${moderate} moderate`);
  }

  return `${alerts.length} alert${alerts.length > 1 ? 's' : ''}: ${parts.join(', ')}`;
}

