# Blueprint System Implementation Guide

## Overview

This document describes the complete implementation of the Blueprint System for SailMarketing - a guided report builder that helps users create structured market analysis reports without needing to write complex prompts.

---

## Implementation Summary

### What Was Built

1. **Multi-Step Wizard Form** - A 3-step form to capture user requirements
2. **Blueprint Generator** - LLM-powered API endpoint to generate report structures
3. **Interactive Blueprint Editor** - Drag-and-drop panel to edit and organize sections
4. **Prompt Converter** - Function to convert blueprints into structured LLM prompts
5. **Complete Page Integration** - New `/report-builder` page with full workflow

---

## File Structure

```
frontend/
├── app/
│   └── report-builder/
│       └── page.tsx                          # Main Report Builder page
├── components/
│   ├── ReportBuilder/
│   │   ├── FormWizard/
│   │   │   ├── FormWizard.tsx               # Main wizard orchestrator
│   │   │   ├── StepIndicator.tsx            # Progress indicator
│   │   │   ├── ReportTypeStep.tsx           # Step 1: Report type selection
│   │   │   ├── DataPointsStep.tsx           # Step 2: Data points selection
│   │   │   ├── AdditionalNotesStep.tsx      # Step 3: Additional context
│   │   │   └── FormNavigation.tsx           # Navigation buttons
│   │   └── BlueprintPanel/
│   │       ├── BlueprintTree.tsx            # Drag-and-drop tree view
│   │       ├── BlueprintCard.tsx            # Individual section card
│   │       └── SectionEditor.tsx            # Add/edit section modal
│   ├── ui/
│   │   ├── checkbox.tsx                     # Checkbox component (new)
│   │   ├── label.tsx                        # Label component (new)
│   │   ├── badge.tsx                        # Badge component (new)
│   │   └── scroll-area.tsx                  # Scroll area component (new)
│   └── Sidebar.tsx                          # Updated with Report Builder link
├── types/
│   ├── blueprint.types.ts                   # Blueprint type definitions
│   └── form.types.ts                        # Form wizard types
├── data/
│   └── dataPoints.ts                        # Data point configurations
├── utils/
│   └── blueprintToPrompt.ts                 # Blueprint to prompt converter
└── package.json                             # Updated with new dependencies

backend/
├── app/
│   ├── routes.py                            # Added blueprint generation endpoint
│   └── schemas.py                           # Added Blueprint schemas
```

---

## Part 1: Multi-Step Wizard Form

### Implementation Details

#### Step 1: Report Type Selection
- **File**: `frontend/components/ReportBuilder/FormWizard/ReportTypeStep.tsx`
- **Features**:
  - 5 report type options (Competitor Analysis, Business Performance, New Partners, Market Trends, Product Launch)
  - Card-based UI with radio selection
  - Visual indicators for selected option
  - Responsive grid layout

#### Step 2: Data Points Selection
- **File**: `frontend/components/ReportBuilder/FormWizard/DataPointsStep.tsx`
- **Features**:
  - Dynamic data points based on selected report type
  - Hierarchical checkboxes with sub-options
  - Expandable/collapsible sections
  - Auto-selection of parent when any child is selected
  - Comprehensive data point sets:
    - **Competitor Analysis**: 15 categories, 60+ sub-options
    - **Business Performance**: 10 categories, 35+ sub-options
    - **New Partners**: 10 categories, 30+ sub-options
    - **Market Trends**: 10 categories, 30+ sub-options
    - **Product Launch**: 11 categories, 35+ sub-options

#### Step 3: Additional Context
- **File**: `frontend/components/ReportBuilder/FormWizard/AdditionalNotesStep.tsx`
- **Features**:
  - Large textarea for manual notes
  - Character counter (max 2000 chars)
  - Optional field
  - Placeholder with examples

### Form State Management

The `FormWizard` component manages all form state:
```typescript
interface FormData {
  reportType: ReportType | '';
  selectedDataPoints: Record<string, boolean>;
  selectedSubOptions: Record<string, boolean>;
  additionalNotes: string;
}
```

### Validation

- Step 1: Report type must be selected
- Step 2: At least one data point must be selected
- Step 3: No validation (optional)

---

## Part 2: Blueprint Generation

### Backend API Endpoint

**Endpoint**: `POST /api/blueprint/generate`

**Request**:
```json
{
  "reportType": "competitor_analysis",
  "selectedDataPoints": ["Traffic & SEO", "- Organic Traffic", ...],
  "additionalNotes": "Focus on Q4 2024 data"
}
```

**Response**:
```json
{
  "success": true,
  "blueprint": {
    "reportTitle": "Comprehensive Competitor Analysis Report",
    "reportType": "competitor_analysis",
    "generatedAt": "2025-10-27T...",
    "sections": [
      {
        "id": "section_1",
        "type": "title",
        "content": "Comprehensive Competitor Analysis Report",
        "order": 0,
        "parentId": null,
        "metadata": {
          "dataSource": null,
          "analysisType": null,
          "visualizationType": null,
          "estimatedLength": null
        }
      },
      ...
    ]
  }
}
```

### LLM Integration

The backend uses the existing `call_llm()` function from `app/llm.py` to generate the blueprint structure. The prompt is carefully crafted to:

1. Explain the task and provide context
2. Show the exact JSON schema expected
3. Include specific rules for structure creation
4. Request appropriate visualizations
5. Ensure hierarchical organization

### Prompt Structure

The prompt sent to the LLM includes:
- Report type and selected data points
- JSON schema with all required fields
- 9 specific rules for generation
- Quality guidelines
- Instruction to return only valid JSON

### JSON Parsing

The endpoint handles multiple JSON formats:
- Direct JSON response
- JSON wrapped in markdown code blocks (```json)
- Extracts and validates the structure
- Creates proper Pydantic objects

---

## Part 3: Blueprint Editor Panel

### Features

1. **Drag-and-Drop Reordering**
   - Using `@dnd-kit/core` and `@dnd-kit/sortable`
   - Smooth animations
   - Touch-friendly

2. **Section Cards**
   - Type badges with color coding
   - Visual hierarchy indicators
   - Metadata display
   - Action buttons (Edit, Add Below, Delete)

3. **Section Types**
   - Title
   - Subtitle
   - Section
   - Paragraph
   - Image Placeholder
   - Table Placeholder

4. **Section Editor Modal**
   - Add or edit modes
   - Full metadata editing
   - Type selection dropdown
   - Conditional fields based on type

5. **Empty States**
   - Helpful messaging
   - Call-to-action buttons

### Drag-and-Drop Implementation

```typescript
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext items={sections} strategy={verticalListSortingStrategy}>
    {sections.map((section) => (
      <SortableItem key={section.id} section={section} ... />
    ))}
  </SortableContext>
</DndContext>
```

---

## Part 4: Blueprint to Prompt Conversion

### Function: `blueprintToPrompt()`

**File**: `frontend/utils/blueprintToPrompt.ts`

**Features**:
- Converts JSON blueprint to structured text prompt
- Hierarchical numbering
- Metadata inclusion
- Special handling for image/table placeholders
- Generation guidelines
- Quality standards

**Output Format**:
```
REPORT GENERATION INSTRUCTIONS

Report Title: [Title]
Report Type: [Type]
Generation Date: [Date]

STRUCTURAL BLUEPRINT:

1. [TITLE] Main Report Title
   Metadata:
   - Data Source: [Source]
   - Analysis Type: [Type]

   1. [SECTION] Executive Summary

      1. [PARAGRAPH] High-level overview
         Metadata:
         - Data Source: Internal analytics
         - Estimated Length: 200 words
...
```

### Helper Function: `getBlueprintSummary()`

Provides statistics for display:
- Total sections count
- Count by section type
- Estimated total word count

---

## Part 5: Generate Report Button

### Functionality

1. **Converts Blueprint to Prompt**
   - Calls `blueprintToPrompt()`
   - Generates complete structured prompt

2. **Stores Prompt**
   - Currently shows success message
   - Console logs the prompt
   - Can be downloaded as `.txt` file

3. **Future Implementation**
   - Will trigger actual report generation
   - Will use MCP tools for data gathering
   - Will generate visualizations

### User Flow

1. User completes wizard → Blueprint generated
2. User edits blueprint in panel (optional)
3. User clicks "Generate Report" button
4. System converts blueprint to prompt
5. Success message displayed
6. User can download prompt or start over

---

## UI/UX Features

### Design System

- **Colors**: Type-specific badges with semantic colors
- **Icons**: Lucide React icons for all UI elements
- **Spacing**: Consistent padding and margins
- **Typography**: Clear hierarchy with varied font sizes
- **Animations**: Smooth transitions and loading states

### Responsive Design

- **Mobile**: Single column layout, collapsible sections
- **Tablet**: Adjusted grid layouts
- **Desktop**: Full 3-column layout with side panels

### Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- Focus indicators
- Screen reader friendly

---

## Data Points Configuration

### Structure

Each report type has 10-15 main categories with 2-4 sub-options each:

```typescript
{
  id: 'traffic_seo',
  label: 'Traffic & SEO',
  subOptions: [
    { id: 'organic_traffic', label: 'Organic Traffic (Google Search)' },
    { id: 'traffic_trends', label: 'Traffic trends' },
    ...
  ]
}
```

### Report Types Coverage

1. **Competitor Analysis**: Digital presence, advertising, business intelligence, financials
2. **Business Performance**: Analytics, marketing ROI, customer insights, retention
3. **New Partners**: Discovery, evaluation, contact info, compatibility
4. **Market Trends**: Industry growth, consumer behavior, technology, regulations
5. **Product Launch**: Market analysis, pricing, go-to-market, metrics

---

## Technical Implementation Details

### Dependencies Added

```json
{
  "@radix-ui/react-checkbox": "^1.0.4",
  "@radix-ui/react-label": "^2.0.2",
  "@radix-ui/react-scroll-area": "^1.0.5",
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

### Backend Changes

1. **Added Schemas** (`app/schemas.py`):
   - `ReportTypeEnum`
   - `SectionTypeEnum`
   - `SectionMetadata`
   - `BlueprintSection`
   - `Blueprint`
   - `BlueprintGenerationRequest`
   - `BlueprintGenerationResponse`

2. **Added Route** (`app/routes.py`):
   - `POST /api/blueprint/generate`
   - `_build_blueprint_prompt()`
   - `_build_blueprint_system_prompt()`

### Frontend Changes

1. **New Components**: 13 new component files
2. **New Types**: 2 new type definition files
3. **New Utils**: 1 utility file
4. **New Data**: 1 configuration file
5. **New Page**: Report Builder page
6. **Updated Components**: Sidebar with new navigation link

---

## Testing the Implementation

### How to Test

1. **Start the application**:
   ```bash
   # Terminal 1 - Backend
   docker-compose up -d

   # Terminal 2 - Frontend (if not using Docker)
   cd frontend
   npm run dev
   ```

2. **Navigate to Report Builder**:
   - Login at http://localhost:3000/login
   - Click "Report Builder" in sidebar
   - Or navigate to http://localhost:3000/report-builder

3. **Test the Wizard**:
   - Step 1: Select a report type
   - Step 2: Select data points and sub-options
   - Step 3: Add optional notes
   - Click "Build Report Blueprint"

4. **Test the Editor**:
   - Drag sections to reorder
   - Click Edit to modify sections
   - Click "+" to add new sections
   - Click trash icon to delete sections

5. **Test Generation**:
   - Click "Generate Report" button
   - Check console for generated prompt
   - Download prompt as text file

### Expected Behavior

- ✅ Form validation prevents progression without selections
- ✅ Blueprint generates with LLM-created structure
- ✅ Sections can be reordered via drag-and-drop
- ✅ Sections can be edited, added, and deleted
- ✅ Prompt converts blueprint to structured text
- ✅ Success message appears after generation
- ✅ Prompt can be downloaded

---

## Future Enhancements

### Phase 2: Actual Report Generation

1. **Integrate with MCP Tools**:
   - Use the generated prompt to call LLM
   - Gather real data using MCP tools
   - Generate visualizations

2. **Save Blueprints**:
   - Add database table for blueprints
   - Store user's saved blueprints
   - Allow loading previous blueprints

3. **Report Templates**:
   - Pre-built blueprint templates
   - Industry-specific templates
   - Customizable starting points

4. **Collaborative Editing**:
   - Share blueprints with team members
   - Real-time collaboration
   - Comments and feedback

5. **Version Control**:
   - Track blueprint changes
   - Revert to previous versions
   - Compare versions

6. **Export Options**:
   - PDF export
   - Word document export
   - Markdown export
   - HTML export

---

## Known Limitations

1. **No Database Persistence**:
   - Blueprints are not saved to database
   - Refreshing page loses current blueprint
   - No blueprint history

2. **No Actual Report Generation**:
   - Current implementation only generates the prompt
   - Report generation is placeholder functionality
   - MCP tool integration pending

3. **Limited Validation**:
   - No duplicate section ID checks
   - No circular parent-child reference checks
   - No maximum section depth limit

4. **Performance**:
   - Large blueprints (100+ sections) may be slow to render
   - No pagination or virtualization
   - Drag-and-drop performance not optimized for very long lists

5. **Error Handling**:
   - API errors show simple alerts
   - No retry mechanism
   - No offline support

---

## Troubleshooting

### Common Issues

**Issue**: Blueprint generation fails with 500 error
- **Cause**: LLM API key not set or invalid
- **Solution**: Check `.env` file has valid `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`

**Issue**: Drag-and-drop not working
- **Cause**: Dependencies not installed
- **Solution**: Run `cd frontend && npm install` to install @dnd-kit packages

**Issue**: Checkboxes not rendering
- **Cause**: Radix UI dependencies missing
- **Solution**: Ensure `@radix-ui/react-checkbox` and `@radix-ui/react-label` are installed

**Issue**: Page shows "Loading..." indefinitely
- **Cause**: User context not initialized
- **Solution**: Make sure you're logged in, check UserContext provider in layout

**Issue**: LLM returns invalid JSON
- **Cause**: Model doesn't follow instructions perfectly
- **Solution**: Backend has fallback JSON extraction from markdown code blocks

---

## API Documentation

### POST /api/blueprint/generate

Generate a report blueprint structure using LLM.

**Request Body**:
```typescript
{
  reportType: ReportTypeEnum;
  selectedDataPoints: string[];
  additionalNotes?: string;
}
```

**Response**:
```typescript
{
  blueprint: Blueprint;
  success: boolean;
  error?: string;
}
```

**Status Codes**:
- `200 OK`: Blueprint generated successfully
- `429 Too Many Requests`: Rate limit exceeded
- `502 Bad Gateway`: LLM API error
- `500 Internal Server Error`: General error

---

## Best Practices

### For Users

1. **Select Relevant Data Points**: Only choose data points you actually need
2. **Add Context**: Use the additional notes field to provide specific requirements
3. **Review Blueprint**: Always review and edit the generated blueprint before finalizing
4. **Organize Logically**: Reorder sections to ensure logical flow
5. **Add Metadata**: Fill in data sources and analysis types for better results

### For Developers

1. **Type Safety**: Always use TypeScript types from `blueprint.types.ts`
2. **Error Handling**: Wrap API calls in try-catch blocks
3. **Loading States**: Show loading indicators during async operations
4. **Validation**: Validate form data before submission
5. **Code Organization**: Keep related components in the same directory

---

## Conclusion

The Blueprint System is now fully implemented and ready for use. Users can:

1. ✅ Create structured report blueprints through an intuitive wizard
2. ✅ Generate AI-powered report structures
3. ✅ Edit and organize sections with drag-and-drop
4. ✅ Convert blueprints to LLM prompts
5. ✅ Download prompts for external use

The system provides a solid foundation for future report generation features and can be extended with database persistence, actual report generation, and collaborative editing capabilities.

---

**Last Updated**: 2025-10-27
**Version**: 1.0
**Status**: ✅ Complete and Ready for Testing
