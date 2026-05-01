import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { LabReport, LabResult, LabExport } from '../types/labs';
import { format } from 'date-fns';

/**
 * Export a single lab report to PDF
 */
export async function exportLabReportToPDF(report: LabReport): Promise<void> {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Header
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Lab Report', pageWidth / 2, 20, { align: 'center' });
  
  // Member and date info
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Patient: ${report.memberName}`, 14, 35);
  pdf.text(`Test Date: ${format(new Date(report.testDate), 'MMM dd, yyyy')}`, 14, 42);
  
  if (report.labName) {
    pdf.text(`Lab: ${report.labName}`, 14, 49);
  }
  
  // Organize results by category
  const resultsByCategory = organizeResultsByCategory(report.results);
  
  let yPosition = 60;
  
  // Add each category
  Object.entries(resultsByCategory).forEach(([category, results]) => {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }
    
    // Category header
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(formatCategoryName(category), 14, yPosition);
    yPosition += 8;
    
    // Results table
    const tableData = results.map(result => [
      result.testName,
      `${result.value} ${result.unit}`,
      formatReferenceRange(result),
      getStatusSymbol(result.status),
    ]);
    
    autoTable(pdf, {
      startY: yPosition,
      head: [['Test', 'Result', 'Reference Range', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 40 },
        2: { cellWidth: 50 },
        3: { cellWidth: 30, halign: 'center' },
      },
      didParseCell: (data) => {
        // Color code status column
        if (data.column.index === 3 && data.section === 'body') {
          const result = results[data.row.index];
          if (result.status === 'high' || result.status === 'low') {
            data.cell.styles.textColor = [255, 140, 0]; // Orange
          } else if (result.status === 'critical') {
            data.cell.styles.textColor = [220, 53, 69]; // Red
          } else {
            data.cell.styles.textColor = [40, 167, 69]; // Green
          }
        }
      },
    });
    
    yPosition = (pdf as any).lastAutoTable.finalY + 15;
  });
  
  // AI Insights section
  if (report.aiInsights) {
    if (yPosition > 220) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AI Insights', 14, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const insights = pdf.splitTextToSize(report.aiInsights, pageWidth - 28);
    pdf.text(insights, 14, yPosition);
  }
  
  // Footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pdf.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    pdf.text(
      `Generated: ${format(new Date(), 'MMM dd, yyyy')}`,
      pageWidth - 14,
      pdf.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }
  
  // Save
  pdf.save(`lab-report-${report.memberName}-${report.testDate}.pdf`);
}

/**
 * Export multiple reports to CSV
 */
export function exportLabReportsToCSV(
  reports: LabReport[],
  memberId?: string,
  dateRange?: { start: string; end: string }
): void {
  // Filter reports if needed
  let filteredReports = reports;
  
  if (memberId) {
    filteredReports = filteredReports.filter(r => r.memberId === memberId);
  }
  
  if (dateRange) {
    filteredReports = filteredReports.filter(r => {
      const testDate = new Date(r.testDate);
      return testDate >= new Date(dateRange.start) && testDate <= new Date(dateRange.end);
    });
  }
  
  // Create CSV header
  const headers = [
    'Date',
    'Member',
    'Test Name',
    'Value',
    'Unit',
    'Reference Low',
    'Reference High',
    'Status',
    'Category',
  ];
  
  const rows: string[][] = [headers];
  
  // Add data rows
  filteredReports.forEach(report => {
    report.results.forEach(result => {
      rows.push([
        report.testDate,
        report.memberName,
        result.testName,
        String(result.value),
        result.unit,
        result.referenceRangeLow ? String(result.referenceRangeLow) : '',
        result.referenceRangeHigh ? String(result.referenceRangeHigh) : '',
        result.status,
        result.category,
      ]);
    });
  });
  
  // Convert to CSV string
  const csvContent = rows.map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');
  
  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `lab-reports-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export lab trend data to CSV for a specific test
 */
export function exportLabTrendToCSV(
  testName: string,
  memberName: string,
  trendData: Array<{ date: string; value: number; status: string }>
): void {
  const headers = ['Date', 'Value', 'Status'];
  const rows: string[][] = [headers];
  
  trendData.forEach(point => {
    rows.push([
      format(new Date(point.date), 'yyyy-MM-dd'),
      String(point.value),
      point.status,
    ]);
  });
  
  const csvContent = rows.map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${testName}-${memberName}-trend-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export chart as image (canvas to PNG)
 */
export async function exportChartAsImage(
  chartElement: HTMLElement,
  fileName: string
): Promise<void> {
  try {
    const { default: html2canvas } = await import('html2canvas');
    
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
    });
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.click();
      
      URL.revokeObjectURL(url);
    });
  } catch (error) {
    console.error('Error exporting chart:', error);
    throw new Error('Failed to export chart as image');
  }
}

/**
 * Create a comprehensive PDF report with multiple reports and charts
 */
export async function exportComprehensiveReport(
  reports: LabReport[],
  memberName: string,
  options: {
    includeCharts?: boolean;
    includeEducation?: boolean;
    includeInsights?: boolean;
  } = {}
): Promise<void> {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Cover page
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Comprehensive Lab Report', pageWidth / 2, 40, { align: 'center' });
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text(memberName, pageWidth / 2, 55, { align: 'center' });
  
  pdf.setFontSize(12);
  const dateRange = `${format(new Date(reports[reports.length - 1].testDate), 'MMM yyyy')} - ${format(new Date(reports[0].testDate), 'MMM yyyy')}`;
  pdf.text(dateRange, pageWidth / 2, 65, { align: 'center' });
  
  pdf.text(`Total Reports: ${reports.length}`, pageWidth / 2, 75, { align: 'center' });
  pdf.text(`Generated: ${format(new Date(), 'MMM dd, yyyy')}`, pageWidth / 2, 85, { align: 'center' });
  
  // Add each report
  for (let i = 0; i < reports.length; i++) {
    pdf.addPage();
    
    const report = reports[i];
    let yPos = 20;
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Report ${i + 1}: ${format(new Date(report.testDate), 'MMM dd, yyyy')}`, 14, yPos);
    yPos += 10;
    
    if (report.labName) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Lab: ${report.labName}`, 14, yPos);
      yPos += 10;
    }
    
    // Add results table
    const tableData = report.results.map(result => [
      result.testName,
      `${result.value} ${result.unit}`,
      formatReferenceRange(result),
      getStatusSymbol(result.status),
    ]);
    
    autoTable(pdf, {
      startY: yPos,
      head: [['Test', 'Result', 'Reference Range', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 9 },
    });
  }
  
  pdf.save(`comprehensive-lab-report-${memberName}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// Helper functions

function organizeResultsByCategory(results: LabResult[]): Record<string, LabResult[]> {
  const organized: Record<string, LabResult[]> = {};
  
  results.forEach(result => {
    if (!organized[result.category]) {
      organized[result.category] = [];
    }
    organized[result.category].push(result);
  });
  
  return organized;
}

function formatCategoryName(category: string): string {
  const names: Record<string, string> = {
    cbc: 'Complete Blood Count (CBC)',
    cmp: 'Comprehensive Metabolic Panel (CMP)',
    lipid: 'Lipid Panel',
    thyroid: 'Thyroid Function',
    diabetes: 'Diabetes Markers',
    liver: 'Liver Function',
    kidney: 'Kidney Function',
    vitamins: 'Vitamin Levels',
    iron: 'Iron Studies',
    hormones: 'Hormones',
    inflammation: 'Inflammation Markers',
    other: 'Other Tests',
  };
  
  return names[category] || category;
}

function formatReferenceRange(result: LabResult): string {
  if (result.referenceRangeText) {
    return result.referenceRangeText;
  }
  
  if (result.referenceRangeLow && result.referenceRangeHigh) {
    return `${result.referenceRangeLow}-${result.referenceRangeHigh}`;
  }
  
  if (result.referenceRangeLow) {
    return `>${result.referenceRangeLow}`;
  }
  
  if (result.referenceRangeHigh) {
    return `<${result.referenceRangeHigh}`;
  }
  
  return 'N/A';
}

function getStatusSymbol(status: string): string {
  switch (status) {
    case 'normal':
      return '✓';
    case 'high':
      return '↑';
    case 'low':
      return '↓';
    case 'critical':
      return '⚠';
    default:
      return '-';
  }
}

