// Food Guide Export Service - PDF and CSV
import type { BloodType } from '../types';
import type { FoodItem } from '../data/bloodTypeFoods';
import { getFoodsByBloodType, categoryLabels } from '../data/bloodTypeFoods';

/**
 * Export food guide as CSV
 */
export function exportFoodGuideCSV(
  bloodType: BloodType,
  personName?: string
): void {
  const beneficialFoods = getFoodsByBloodType(bloodType, 'beneficial');
  const neutralFoods = getFoodsByBloodType(bloodType, 'neutral');
  const avoidFoods = getFoodsByBloodType(bloodType, 'avoid');

  // CSV headers
  let csv = 'Food Name,Category,Classification,Calories,Protein (g),Carbs (g),Fats (g),Fiber (g),Serving Size,Benefits,Concerns\n';

  // Helper function to add foods to CSV
  const addFoodsToCSV = (foods: FoodItem[], classification: string) => {
    foods.forEach((food) => {
      const row = [
        food.name,
        categoryLabels[food.category],
        classification,
        food.nutritionalInfo?.calories || '',
        food.nutritionalInfo?.protein || '',
        food.nutritionalInfo?.carbs || '',
        food.nutritionalInfo?.fats || '',
        food.nutritionalInfo?.fiber || '',
        food.servingSize || '',
        (food.benefits || '').replace(/,/g, ';'),
        (food.concerns || '').replace(/,/g, ';'),
      ];
      csv += row.map((cell) => `"${cell}"`).join(',') + '\n';
    });
  };

  // Add all foods
  addFoodsToCSV(beneficialFoods, 'Beneficial');
  addFoodsToCSV(neutralFoods, 'Neutral');
  addFoodsToCSV(avoidFoods, 'Avoid');

  // Create and download file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `blood-type-${bloodType}-food-guide${personName ? `-${personName}` : ''}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export food guide as PDF
 * Note: Requires jspdf and jspdf-autotable to be installed
 */
export async function exportFoodGuidePDF(
  bloodType: BloodType,
  personName?: string
): Promise<void> {
  try {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const beneficialFoods = getFoodsByBloodType(bloodType, 'beneficial');
    const neutralFoods = getFoodsByBloodType(bloodType, 'neutral');
    const avoidFoods = getFoodsByBloodType(bloodType, 'avoid');

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    // Title
    doc.setFontSize(22);
    doc.setTextColor(34, 139, 34); // Green
    doc.text(`Blood Type ${bloodType} Food Guide`, pageWidth / 2, yPosition, { align: 'center' });
    
    if (personName) {
      yPosition += 10;
      doc.setFontSize(14);
      doc.setTextColor(100);
      doc.text(`Prepared for: ${personName}`, pageWidth / 2, yPosition, { align: 'center' });
    }

    yPosition += 15;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });

    // Summary stats
    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Foods: ${beneficialFoods.length + neutralFoods.length + avoidFoods.length}`, 14, yPosition);
    doc.setTextColor(34, 139, 34);
    doc.text(`Beneficial: ${beneficialFoods.length}`, 80, yPosition);
    doc.setTextColor(59, 130, 246);
    doc.text(`Neutral: ${neutralFoods.length}`, 130, yPosition);
    doc.setTextColor(220, 38, 38);
    doc.text(`Avoid: ${avoidFoods.length}`, 170, yPosition);

    yPosition += 15;

    // Helper function to create table for a classification
    const createFoodTable = (foods: FoodItem[], title: string, color: [number, number, number]) => {
      doc.setFontSize(16);
      doc.setTextColor(...color);
      doc.text(title, 14, yPosition);
      yPosition += 7;

      const tableData = foods.map((food) => [
        food.name,
        categoryLabels[food.category],
        food.servingSize || '-',
        food.nutritionalInfo?.calories?.toString() || '-',
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Food', 'Category', 'Serving', 'Calories']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: color,
          textColor: 255,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 50 },
          2: { cellWidth: 40 },
          3: { cellWidth: 30 },
        },
        didDrawPage: (data: any) => {
          yPosition = data.cursor.y + 10;
        },
      });

      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
    };

    // Beneficial Foods Section
    if (beneficialFoods.length > 0) {
      createFoodTable(beneficialFoods, '✓ Beneficial Foods', [34, 139, 34]);
    }

    // Neutral Foods Section
    if (neutralFoods.length > 0) {
      createFoodTable(neutralFoods, '○ Neutral Foods', [59, 130, 246]);
    }

    // Foods to Avoid Section
    if (avoidFoods.length > 0) {
      createFoodTable(avoidFoods, '✗ Foods to Avoid', [220, 38, 38]);
    }

    // Footer on last page
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount} | Meal Plan Assistant`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    doc.save(`blood-type-${bloodType}-food-guide${personName ? `-${personName}` : ''}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please make sure jsPDF is installed.');
  }
}

/**
 * Generate a simple text list for quick reference
 */
export function generateTextList(bloodType: BloodType): string {
  const beneficialFoods = getFoodsByBloodType(bloodType, 'beneficial');
  const neutralFoods = getFoodsByBloodType(bloodType, 'neutral');
  const avoidFoods = getFoodsByBloodType(bloodType, 'avoid');

  let text = `BLOOD TYPE ${bloodType} FOOD GUIDE\n`;
  text += `Generated: ${new Date().toLocaleDateString()}\n\n`;
  text += '='.repeat(50) + '\n\n';

  text += `✓ BENEFICIAL FOODS (${beneficialFoods.length})\n`;
  text += '-'.repeat(50) + '\n';
  beneficialFoods.forEach((food) => {
    text += `• ${food.name} (${categoryLabels[food.category]})`;
    if (food.benefits) text += ` - ${food.benefits}`;
    text += '\n';
  });

  text += '\n' + '='.repeat(50) + '\n\n';

  text += `○ NEUTRAL FOODS (${neutralFoods.length})\n`;
  text += '-'.repeat(50) + '\n';
  neutralFoods.forEach((food) => {
    text += `• ${food.name} (${categoryLabels[food.category]})\n`;
  });

  text += '\n' + '='.repeat(50) + '\n\n';

  text += `✗ FOODS TO AVOID (${avoidFoods.length})\n`;
  text += '-'.repeat(50) + '\n';
  avoidFoods.forEach((food) => {
    text += `• ${food.name} (${categoryLabels[food.category]})`;
    if (food.concerns) text += ` - ${food.concerns}`;
    text += '\n';
  });

  return text;
}

