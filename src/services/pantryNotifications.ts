import type { PantryItem, LowStockAlert, ExpirationAlert, PantrySettings } from '../types';
import { checkLowStockItems, checkExpiringItems, checkExpiredItems } from './pantryInventory';
import { sendEmail } from './emailService';

/**
 * Check pantry and generate all necessary alerts
 */
export async function checkPantryAlerts(
  pantryItems: PantryItem[],
  settings: PantrySettings
): Promise<{
  lowStockAlerts: LowStockAlert[];
  expirationAlerts: ExpirationAlert[];
  expiredAlerts: ExpirationAlert[];
}> {
  const lowStockAlerts = settings.enableLowStockAlerts 
    ? checkLowStockItems(pantryItems)
    : [];

  const expirationAlerts = settings.enableExpirationAlerts
    ? checkExpiringItems(pantryItems, settings.expirationAlertDays)
    : [];

  const expiredAlerts = settings.enableExpirationAlerts
    ? checkExpiredItems(pantryItems)
    : [];

  return {
    lowStockAlerts,
    expirationAlerts,
    expiredAlerts,
  };
}

/**
 * Send low stock email notification
 */
export async function sendLowStockEmail(
  alerts: LowStockAlert[],
  userEmail: string,
  smtpSettings: any
): Promise<boolean> {
  if (alerts.length === 0) return false;

  const itemsList = alerts
    .slice(0, 10) // Limit to 10 items
    .map(alert => {
      const urgencyIcon = alert.priority === 'urgent' ? '🔴' :
                          alert.priority === 'high' ? '🟠' :
                          alert.priority === 'medium' ? '🟡' : '⚪';
      return `${urgencyIcon} <strong>${alert.itemName}</strong> - ${alert.currentQuantity} remaining (threshold: ${alert.threshold})`;
    })
    .join('<br>');

  const moreItems = alerts.length > 10 ? `<p><em>...and ${alerts.length - 10} more items</em></p>` : '';

  const subject = `🛒 Pantry Alert: ${alerts.length} Item${alerts.length !== 1 ? 's' : ''} Running Low`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">📦 Pantry Alert</h1>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1f2937; margin-top: 0;">Low Stock Items</h2>
        <p style="color: #6b7280; font-size: 16px;">
          ${alerts.length} item${alerts.length !== 1 ? 's need' : ' needs'} restocking:
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          ${itemsList}
          ${moreItems}
        </div>
        
        <div style="margin-top: 30px;">
          <a href="#" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            View My Pantry
          </a>
          <a href="#" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-left: 10px;">
            Add to Grocery List
          </a>
        </div>
        
        <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
          <em>Tip: Keep your pantry stocked to avoid last-minute shopping trips!</em>
        </p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: userEmail,
      subject,
      htmlContent,
      smtpSettings,
    });
    return true;
  } catch (error) {
    console.error('Failed to send low stock email:', error);
    return false;
  }
}

/**
 * Send expiration warning email
 */
export async function sendExpirationEmail(
  alerts: ExpirationAlert[],
  userEmail: string,
  smtpSettings: any
): Promise<boolean> {
  if (alerts.length === 0) return false;

  const urgentItems = alerts.filter(a => a.daysUntilExpiration <= 1);
  const soonItems = alerts.filter(a => a.daysUntilExpiration > 1 && a.daysUntilExpiration <= 3);
  const laterItems = alerts.filter(a => a.daysUntilExpiration > 3);

  const formatItemsList = (items: ExpirationAlert[]) => {
    return items
      .map(alert => {
        const daysText = alert.daysUntilExpiration === 0 ? 'Today!' :
                        alert.daysUntilExpiration === 1 ? 'Tomorrow' :
                        `${alert.daysUntilExpiration} days`;
        return `<li><strong>${alert.itemName}</strong> - Expires ${daysText}</li>`;
      })
      .join('');
  };

  const subject = urgentItems.length > 0
    ? `⚠️ Urgent: ${urgentItems.length} Item${urgentItems.length !== 1 ? 's' : ''} Expiring Soon!`
    : `📅 Pantry Reminder: ${alerts.length} Item${alerts.length !== 1 ? 's' : ''} Expiring This Week`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Expiration Alert</h1>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1f2937; margin-top: 0;">Items Expiring Soon</h2>
        
        ${urgentItems.length > 0 ? `
          <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ef4444;">
            <h3 style="color: #991b1b; margin-top: 0; font-size: 16px;">🚨 Urgent (Expiring Today/Tomorrow)</h3>
            <ul style="color: #7f1d1d; margin: 10px 0;">
              ${formatItemsList(urgentItems)}
            </ul>
          </div>
        ` : ''}
        
        ${soonItems.length > 0 ? `
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0; font-size: 16px;">⚠️ Soon (1-3 Days)</h3>
            <ul style="color: #78350f; margin: 10px 0;">
              ${formatItemsList(soonItems)}
            </ul>
          </div>
        ` : ''}
        
        ${laterItems.length > 0 ? `
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e40af; margin-top: 0; font-size: 16px;">ℹ️ This Week (4-7 Days)</h3>
            <ul style="color: #1e3a8a; margin: 10px 0;">
              ${formatItemsList(laterItems)}
            </ul>
          </div>
        ` : ''}
        
        <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px;">
          <h3 style="color: #1f2937; margin-top: 0;">💡 What You Can Do:</h3>
          <ul style="color: #4b5563; line-height: 1.8;">
            <li>Use these items in today's meals</li>
            <li>Freeze items to extend shelf life</li>
            <li>Share with friends or neighbors</li>
            <li>Compost items past their prime</li>
          </ul>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="#" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Get Recipe Suggestions
          </a>
        </div>
        
        <p style="color: #9ca3af; font-size: 14px; margin-top: 30px; text-align: center;">
          <em>Reduce food waste, save money, and eat healthier! 🌱</em>
        </p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: userEmail,
      subject,
      htmlContent,
      smtpSettings,
    });
    return true;
  } catch (error) {
    console.error('Failed to send expiration email:', error);
    return false;
  }
}

/**
 * Send weekly pantry summary email
 */
export async function sendWeeklySummaryEmail(
  pantryItems: PantryItem[],
  alerts: {
    lowStockAlerts: LowStockAlert[];
    expirationAlerts: ExpirationAlert[];
  },
  userEmail: string,
  smtpSettings: any
): Promise<boolean> {
  const totalItems = pantryItems.length;
  const categories = [...new Set(pantryItems.map(i => i.category))];
  const recentlyAdded = pantryItems
    .filter(item => {
      const addedDate = new Date(item.addedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return addedDate > weekAgo;
    })
    .length;

  const subject = '📊 Your Weekly Pantry Summary';
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">📦 Weekly Pantry Summary</h1>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1f2937;">Your Pantry at a Glance</h2>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0;">
          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #667eea;">${totalItems}</div>
            <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">Total Items</div>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">${alerts.lowStockAlerts.length}</div>
            <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">Low Stock</div>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #ef4444;">${alerts.expirationAlerts.length}</div>
            <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">Expiring Soon</div>
          </div>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">📈 This Week's Activity</h3>
          <ul style="color: #4b5563; line-height: 1.8;">
            <li><strong>${recentlyAdded}</strong> new items added</li>
            <li><strong>${categories.length}</strong> food categories</li>
            <li><strong>${pantryItems.filter(i => i.usageHistory && i.usageHistory.length > 0).length}</strong> items used</li>
          </ul>
        </div>
        
        ${alerts.lowStockAlerts.length > 0 || alerts.expirationAlerts.length > 0 ? `
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0;">⚠️ Action Required</h3>
            <p style="color: #78350f; margin: 10px 0;">
              You have ${alerts.lowStockAlerts.length + alerts.expirationAlerts.length} items that need attention.
            </p>
            <a href="#" style="display: inline-block; background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
              Review Alerts
            </a>
          </div>
        ` : ''}
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="#" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Open My Pantry
          </a>
        </div>
        
        <p style="color: #9ca3af; font-size: 14px; margin-top: 30px; text-align: center;">
          <em>Keep your pantry organized and reduce food waste! 🌟</em>
        </p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: userEmail,
      subject,
      htmlContent,
      smtpSettings,
    });
    return true;
  } catch (error) {
    console.error('Failed to send weekly summary email:', error);
    return false;
  }
}

/**
 * Create in-app toast notification
 */
export function createToastNotification(
  type: 'low-stock' | 'expiring' | 'expired',
  count: number
): {
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
} {
  switch (type) {
    case 'low-stock':
      return {
        message: `⚠️ ${count} item${count !== 1 ? 's are' : ' is'} running low. Time to restock!`,
        type: 'info',
        duration: 5000,
      };
    case 'expiring':
      return {
        message: `⏰ ${count} item${count !== 1 ? 's are' : ' is'} expiring soon. Use them first!`,
        type: 'info',
        duration: 5000,
      };
    case 'expired':
      return {
        message: `🚫 ${count} item${count !== 1 ? 's have' : ' has'} expired. Please remove from pantry.`,
        type: 'error',
        duration: 7000,
      };
  }
}

