# Fix Blank Page Issue

If you're seeing a blank page, it's likely due to old data in localStorage that's incompatible with the new blood type format.

## Quick Fix

1. **Open Browser Console** (Press F12 or Right-click → Inspect → Console tab)

2. **Clear localStorage** by running this command in the console:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

3. **Or manually clear:**
   - Open DevTools (F12)
   - Go to Application tab (Chrome) or Storage tab (Firefox)
   - Find "Local Storage" → `http://localhost:5173`
   - Delete the `meal-plan-assistant-storage` key
   - Refresh the page

## What Happened?

The app was updated to use complete blood types (O+, O-, A+, A-, etc.) instead of just base types (O, A, B, AB). If you had old data saved with the old format, it needs to be migrated or cleared.

The app now includes automatic migration, but if there's corrupted data, clearing localStorage will fix it.

## After Clearing

Once you clear localStorage and refresh:
- You'll need to go through onboarding again
- Add your family members with the new blood type selector
- All your data will be fresh and compatible

