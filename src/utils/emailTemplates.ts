import type { WeeklyPlan, Meal, Person } from '../types';
import { format } from 'date-fns';

/**
 * Email template utilities
 * Creates responsive HTML email templates
 */

// Base template with responsive styles
const baseTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 28px;
      font-weight: bold;
    }
    .header p {
      margin: 8px 0 0 0;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
    }
    .content {
      padding: 32px 24px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 16px;
    }
    .text {
      font-size: 16px;
      line-height: 1.6;
      color: #4b5563;
      margin-bottom: 16px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 16px 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
    }
    .footer a {
      color: #22c55e;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 24px 16px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ Meal Plan Assistant</h1>
      <p>Your AI-Powered Nutrition Companion</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Meal Plan Assistant. All rights reserved.</p>
      <p>
        <a href="#">Unsubscribe</a> | 
        <a href="#">Manage Preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

/**
 * 1. Weekly Meal Plan Ready Template
 */
export function weeklyPlanReadyTemplate(plan: WeeklyPlan): { html: string; text: string; subject: string } {
  const weekStart = format(new Date(plan.weekStart), 'MMMM d, yyyy');
  const peopleNames = plan.people.map(p => p.name).join(', ');
  
  const content = `
    <div class="greeting">🎉 Your Weekly Meal Plan is Ready!</div>
    <p class="text">
      Great news! Your personalized meal plan for the week of <strong>${weekStart}</strong> 
      has been generated for ${peopleNames}.
    </p>
    <p class="text">
      This week's plan includes ${plan.days.length} days of delicious, blood type-compatible meals 
      tailored to your family's preferences and nutritional needs.
    </p>
    <a href="#" class="button">View Your Meal Plan</a>
    <div style="margin-top: 24px; padding: 16px; background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 8px;">
      <p style="margin: 0; color: #166534; font-size: 14px;">
        <strong>💡 Pro Tip:</strong> Check out your grocery list to prepare for the week ahead!
      </p>
    </div>
  `;

  const text = `
🎉 Your Weekly Meal Plan is Ready!

Great news! Your personalized meal plan for the week of ${weekStart} has been generated for ${peopleNames}.

This week's plan includes ${plan.days.length} days of delicious, blood type-compatible meals tailored to your family's preferences and nutritional needs.

View your meal plan in the app to get started!

💡 Pro Tip: Check out your grocery list to prepare for the week ahead!
  `;

  return {
    html: baseTemplate(content, 'Your Weekly Meal Plan is Ready'),
    text,
    subject: `🍽️ Your Meal Plan for ${weekStart} is Ready!`,
  };
}

/**
 * 2. Daily Meal Summary Template
 */
export function dailyMealSummaryTemplate(date: Date, meals: { breakfast: Meal; lunch: Meal; dinner: Meal; snack: Meal }): { html: string; text: string; subject: string } {
  const dateStr = format(date, 'EEEE, MMMM d');
  
  const mealCard = (meal: Meal, type: string, emoji: string) => `
    <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
      <div style="font-size: 14px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
        ${emoji} ${type}
      </div>
      <div style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 8px;">
        ${meal.name}
      </div>
      <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
        ⏱️ ${meal.prepTime} min prep | 🍳 ${meal.cookTime} min cook
      </div>
      ${meal.description ? `<p style="font-size: 14px; color: #4b5563; margin: 0;">${meal.description}</p>` : ''}
    </div>
  `;

  const content = `
    <div class="greeting">☀️ Good Morning! Here's Your Menu for ${dateStr}</div>
    <p class="text">
      Start your day prepared! Here's what's on the menu today:
    </p>
    ${mealCard(meals.breakfast, 'Breakfast', '🌅')}
    ${mealCard(meals.lunch, 'Lunch', '☀️')}
    ${mealCard(meals.dinner, 'Dinner', '🌙')}
    ${mealCard(meals.snack, 'Snack', '🍎')}
    <a href="#" class="button">View Full Recipes</a>
  `;

  const text = `
☀️ Good Morning! Here's Your Menu for ${dateStr}

🌅 BREAKFAST: ${meals.breakfast.name}
⏱️ ${meals.breakfast.prepTime} min prep | 🍳 ${meals.breakfast.cookTime} min cook

☀️ LUNCH: ${meals.lunch.name}
⏱️ ${meals.lunch.prepTime} min prep | 🍳 ${meals.lunch.cookTime} min cook

🌙 DINNER: ${meals.dinner.name}
⏱️ ${meals.dinner.prepTime} min prep | 🍳 ${meals.dinner.cookTime} min cook

🍎 SNACK: ${meals.snack.name}
⏱️ ${meals.snack.prepTime} min prep

View full recipes in the app!
  `;

  return {
    html: baseTemplate(content, `Today's Meals - ${dateStr}`),
    text,
    subject: `☀️ Your Meal Plan for ${dateStr}`,
  };
}

/**
 * 3. Grocery List Generated Template
 */
export function groceryListGeneratedTemplate(itemCount: number, categories: string[]): { html: string; text: string; subject: string } {
  const content = `
    <div class="greeting">🛒 Your Grocery List is Ready!</div>
    <p class="text">
      Your shopping list for the week has been generated with <strong>${itemCount} items</strong> 
      organized into ${categories.length} categories.
    </p>
    <div style="margin: 24px 0;">
      <div style="text-align: center; font-size: 48px; color: #22c55e; margin-bottom: 16px;">
        🛒
      </div>
      <div style="text-align: center; font-size: 32px; font-weight: bold; color: #111827;">
        ${itemCount} Items
      </div>
      <div style="text-align: center; font-size: 16px; color: #6b7280; margin-top: 8px;">
        Organized into ${categories.join(', ')}
      </div>
    </div>
    <a href="#" class="button">View Grocery List</a>
    <div style="margin-top: 24px; padding: 16px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px;">
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        <strong>💡 Shopping Tip:</strong> Shop on ${categories.length > 5 ? 'weekend' : 'weekday'} 
        mornings to avoid crowds and get the freshest produce!
      </p>
    </div>
  `;

  const text = `
🛒 Your Grocery List is Ready!

Your shopping list for the week has been generated with ${itemCount} items organized into ${categories.length} categories.

Categories: ${categories.join(', ')}

View your complete grocery list in the app!

💡 Shopping Tip: Shop on ${categories.length > 5 ? 'weekend' : 'weekday'} mornings to avoid crowds and get the freshest produce!
  `;

  return {
    html: baseTemplate(content, 'Your Grocery List is Ready'),
    text,
    subject: `🛒 Grocery List Ready - ${itemCount} Items`,
  };
}

/**
 * 4. Level Up Achievement Template
 */
export function levelUpTemplate(level: number, xp: number, newBadges: string[]): { html: string; text: string; subject: string } {
  const content = `
    <div class="greeting">🎉 Congratulations! You've Leveled Up!</div>
    <div style="text-align: center; margin: 32px 0;">
      <div style="font-size: 72px; margin-bottom: 16px;">🏆</div>
      <div style="font-size: 48px; font-weight: bold; color: #22c55e; margin-bottom: 8px;">
        Level ${level}
      </div>
      <div style="font-size: 18px; color: #6b7280;">
        ${xp} XP earned
      </div>
    </div>
    <p class="text">
      Amazing progress! You've reached <strong>Level ${level}</strong> by consistently following your meal plans 
      and maintaining healthy eating habits.
    </p>
    ${newBadges.length > 0 ? `
      <div style="margin: 24px 0; padding: 16px; background-color: #fef3c7; border-radius: 12px;">
        <div style="font-weight: 600; color: #92400e; margin-bottom: 12px;">New Badges Unlocked:</div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          ${newBadges.map(badge => `
            <div style="padding: 8px 16px; background-color: #ffffff; border-radius: 20px; font-size: 14px; font-weight: 600; color: #78350f;">
              🏅 ${badge}
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
    <a href="#" class="button">View Your Progress</a>
  `;

  const text = `
🎉 Congratulations! You've Leveled Up!

🏆 LEVEL ${level}
${xp} XP earned

Amazing progress! You've reached Level ${level} by consistently following your meal plans and maintaining healthy eating habits.

${newBadges.length > 0 ? `New Badges Unlocked:\n${newBadges.map(b => `🏅 ${b}`).join('\n')}` : ''}

View your complete progress in the app!
  `;

  return {
    html: baseTemplate(content, `Level ${level} Achieved!`),
    text,
    subject: `🏆 Level Up! You've Reached Level ${level}`,
  };
}

/**
 * 5. Weekly Progress Report Template
 */
export function weeklyProgressTemplate(
  mealsCompleted: number,
  xpEarned: number,
  streak: number,
  highlights: string[]
): { html: string; text: string; subject: string } {
  const content = `
    <div class="greeting">📊 Your Weekly Progress Report</div>
    <p class="text">
      Here's a summary of your amazing progress this week!
    </p>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0;">
      <div style="text-align: center; padding: 16px; background-color: #f0fdf4; border-radius: 12px;">
        <div style="font-size: 32px; font-weight: bold; color: #22c55e;">${mealsCompleted}</div>
        <div style="font-size: 14px; color: #166534; margin-top: 4px;">Meals Completed</div>
      </div>
      <div style="text-align: center; padding: 16px; background-color: #fef3c7; border-radius: 12px;">
        <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">${xpEarned}</div>
        <div style="font-size: 14px; color: #92400e; margin-top: 4px;">XP Earned</div>
      </div>
      <div style="text-align: center; padding: 16px; background-color: #fce7f3; border-radius: 12px;">
        <div style="font-size: 32px; font-weight: bold; color: #ec4899;">${streak}</div>
        <div style="font-size: 14px; color: #9f1239; margin-top: 4px;">Day Streak</div>
      </div>
    </div>
    ${highlights.length > 0 ? `
      <div style="margin: 24px 0;">
        <div style="font-weight: 600; color: #111827; margin-bottom: 12px;">⭐ Weekly Highlights:</div>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
          ${highlights.map(h => `<li style="margin: 8px 0;">${h}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
    <a href="#" class="button">View Detailed Stats</a>
    <div style="margin-top: 24px; padding: 16px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px;">
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        <strong>Keep it up!</strong> You're on track to reach your health goals. 
        ${streak >= 7 ? 'Amazing streak! 🔥' : 'Keep your streak going! 💪'}
      </p>
    </div>
  `;

  const text = `
📊 Your Weekly Progress Report

Here's a summary of your amazing progress this week!

📈 STATS:
• ${mealsCompleted} Meals Completed
• ${xpEarned} XP Earned
• ${streak} Day Streak ${streak >= 7 ? '🔥' : '💪'}

${highlights.length > 0 ? `⭐ WEEKLY HIGHLIGHTS:\n${highlights.map(h => `• ${h}`).join('\n')}` : ''}

View detailed stats in the app!

Keep it up! You're on track to reach your health goals.
  `;

  return {
    html: baseTemplate(content, 'Your Weekly Progress Report'),
    text,
    subject: `📊 Weekly Report - ${mealsCompleted} Meals Completed!`,
  };
}

/**
 * Plain text version generator
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

