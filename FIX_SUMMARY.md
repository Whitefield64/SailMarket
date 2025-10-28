# Fix Summary - Blueprint Generation Error

## Issue Description

When clicking "Build Report Blueprint" button, the frontend showed error:
```
Failed to generate blueprint
```

Browser console showed:
```
POST http://localhost:3000/api/blueprint/generate 404 (Not Found)
```

## Root Cause

The `FormWizard` component was using a direct `fetch()` call to `/api/blueprint/generate`, which was being sent to the Next.js frontend server (port 3000) instead of the FastAPI backend server (port 8000).

## Solution Applied

### 1. Added Blueprint API Method to API Client

**File**: `frontend/lib/api.ts`

Added new method:
```typescript
generateBlueprint: async (request: {
  reportType: string;
  selectedDataPoints: string[];
  additionalNotes?: string;
}): Promise<{
  blueprint: any;
  success: boolean;
  error?: string;
}> => {
  const response = await apiClient.post('/api/blueprint/generate', request);
  return response.data;
}
```

This ensures the request goes to `http://localhost:8000/api/blueprint/generate` (backend) instead of `http://localhost:3000/api/blueprint/generate` (frontend).

### 2. Updated FormWizard Component

**File**: `frontend/components/ReportBuilder/FormWizard/FormWizard.tsx`

**Changes**:

1. **Added import**:
   ```typescript
   import api from '@/lib/api';
   ```

2. **Replaced fetch() call with API client**:

   **Before**:
   ```typescript
   const response = await fetch('/api/blueprint/generate', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       reportType: formData.reportType,
       selectedDataPoints: selectedLabels,
       additionalNotes: formData.additionalNotes,
     }),
   });

   if (!response.ok) {
     throw new Error('Failed to generate blueprint');
   }

   const data = await response.json();
   onBlueprintGenerated(data.blueprint);
   ```

   **After**:
   ```typescript
   const data = await api.generateBlueprint({
     reportType: formData.reportType,
     selectedDataPoints: selectedLabels,
     additionalNotes: formData.additionalNotes,
   });

   if (!data.success) {
     throw new Error(data.error || 'Failed to generate blueprint');
   }

   onBlueprintGenerated(data.blueprint);
   ```

3. **Improved error handling**:
   ```typescript
   catch (err: any) {
     setError(err.response?.data?.detail || err.message || 'An error occurred while generating the blueprint');
   }
   ```

## Verification

Tested the backend endpoint directly:
```bash
curl -X POST http://localhost:8000/api/blueprint/generate \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "competitor_analysis",
    "selectedDataPoints": ["Traffic & SEO", "Market Position"],
    "additionalNotes": "Test blueprint generation"
  }'
```

**Result**: ✅ Successfully generated a blueprint with 15 sections in ~31 seconds

Sample response structure:
```json
{
  "blueprint": {
    "reportTitle": "Comprehensive Competitor Analysis: Insights into Market Position and SEO Strategies",
    "sections": [
      {
        "id": "1",
        "type": "title",
        "content": "Comprehensive Competitor Analysis...",
        "order": 1,
        "parentId": null,
        "metadata": {...}
      },
      // ... 14 more sections
    ],
    "generatedAt": "2025-10-27T16:54:22.423032",
    "reportType": "competitor_analysis"
  },
  "success": true,
  "error": null
}
```

## Testing Instructions

1. **Navigate to Report Builder**:
   - Go to http://localhost:3000/report-builder
   - Make sure you're logged in

2. **Complete the Wizard**:
   - Step 1: Select any report type
   - Step 2: Select at least one data point
   - Step 3: Optionally add notes
   - Click "Build Report Blueprint"

3. **Expected Behavior**:
   - Loading spinner appears
   - After 10-30 seconds (depending on LLM speed)
   - Blueprint editor panel appears with generated sections
   - Sections can be dragged, edited, deleted
   - "Generate Report" button becomes available

## Why This Works Now

1. **API Client** (`lib/api.ts`):
   - Uses `axios` with `baseURL` set to backend server
   - Configured as: `http://localhost:8000`
   - All API methods use this client

2. **Consistent Pattern**:
   - Other features (content generation, reports) use `api.ts`
   - Blueprint generation now follows the same pattern
   - Ensures all backend calls go to port 8000

3. **Backend Ready**:
   - Endpoint exists: `/api/blueprint/generate`
   - Properly handles requests
   - Returns valid JSON with blueprint structure
   - LLM integration working (tested with curl)

## Additional Benefits

1. **Better Error Handling**:
   - Axios provides better error handling than fetch
   - Can access `err.response.data.detail` for backend error messages

2. **Type Safety**:
   - TypeScript types for request/response
   - Catches errors at compile time

3. **Maintainability**:
   - Centralized API configuration
   - Easy to change backend URL if needed
   - Consistent across all features

## Files Modified

1. ✅ `frontend/lib/api.ts` - Added `generateBlueprint()` method
2. ✅ `frontend/components/ReportBuilder/FormWizard/FormWizard.tsx` - Updated to use API client

## Status

✅ **FIXED** - Ready to test in the browser!

---

**Fixed Date**: 2025-10-27
**Fixed By**: Claude
**Tested**: Yes (via curl)
**Ready for Production**: After user testing confirms it works end-to-end
