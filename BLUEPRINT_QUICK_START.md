# Blueprint System - Quick Start Guide

## Getting Started

### 1. Start the Application

```bash
# Start all services (database, backend, frontend)
docker-compose up -d

# View logs
docker-compose logs -f frontend backend
```

### 2. Access the Report Builder

1. Navigate to: http://localhost:3000
2. Login with your credentials
3. Click **"Report Builder"** in the sidebar
4. Or go directly to: http://localhost:3000/report-builder

---

## Using the Report Builder

### Step 1: Choose Report Type

Select one of 5 report types:
- **Competitor Analysis** - Analyze competitors in your market
- **My Business Performance** - Track your business metrics
- **New Partners Research** - Find and evaluate potential partners
- **Market Trends Analysis** - Understand current market trends
- **Product Launch Strategy** - Plan a successful product launch

### Step 2: Select Data Points

1. Expand categories by clicking them
2. Check the data points you want to include
3. Select specific sub-options for detailed analysis
4. At least one data point must be selected to continue

**Pro Tip**: Start with 5-7 main data points for a focused report

### Step 3: Add Context (Optional)

Add any additional notes, requirements, or context:
- Specific time periods (e.g., "Focus on Q4 2024")
- Geographic regions (e.g., "US market only")
- Particular competitors (e.g., "Compare with CompanyX and CompanyY")
- Special requirements (e.g., "Include recommendations for improving conversion rates")

### Step 4: Generate Blueprint

Click **"Build Report Blueprint"** button
- Wait 5-10 seconds for LLM to generate structure
- AI creates a comprehensive report structure based on your selections

---

## Editing the Blueprint

### Reorder Sections

- **Drag** the handle icon (☰) on the left of each card
- **Drop** it in the desired position
- Sections automatically renumber

### Edit a Section

1. Click the **Edit** button (pencil icon)
2. Modify:
   - Section type (title, paragraph, image, etc.)
   - Content description
   - Data source
   - Analysis type
   - Visualization type (for images/tables)
   - Estimated length
3. Click **"Save Changes"**

### Add a New Section

- Click **"+ Add Section"** button in the header, OR
- Click the **+** button on any section to add below it

Fill in the same fields as editing.

### Delete a Section

1. Click the **Trash** icon on a section
2. Confirm deletion in the popup

---

## Generating the Report

### Finalize Blueprint

1. Review all sections in the left panel
2. Check the **Blueprint Summary** in the right panel:
   - Total sections
   - Section types breakdown
   - Estimated length
3. Click **"Generate Report"** button

### What Happens Next

- ✅ Blueprint is converted to a structured prompt
- ✅ Success message appears
- ✅ Prompt can be downloaded as `.txt` file
- 🚧 **Coming Soon**: Actual report generation with AI + data gathering

### Download Prompt

Click **"Download Prompt"** to save the generated prompt as a text file.

This prompt can be:
- Used with any LLM to generate the report
- Modified and customized
- Shared with team members
- Saved for future use

---

## Keyboard Shortcuts

- **Arrow Keys**: Navigate between sections (when dragging)
- **Escape**: Close modal dialogs
- **Enter**: Submit forms

---

## Tips for Best Results

### 1. Choose Relevant Data Points

❌ Don't select every single data point
✅ Pick 5-10 most relevant categories

### 2. Be Specific in Additional Notes

❌ "I want a good report"
✅ "Focus on Q4 2024 data, compare with top 3 competitors in the US market, include actionable recommendations for improving SEO"

### 3. Review Generated Structure

- AI creates a good starting point
- Always review and customize to your needs
- Reorder sections for better flow
- Add or remove sections as needed

### 4. Include Visualizations

- Add image placeholders for charts and graphs
- Specify what type of visualization (bar chart, line graph, etc.)
- Indicate what data should be visualized

### 5. Specify Data Sources

- Helps the LLM know where to get information
- Examples: "Google Analytics", "SEMrush", "Internal CRM"

---

## Example Workflows

### Quick Competitor Analysis

1. Select **"Competitor Analysis"**
2. Choose:
   - Traffic & SEO → Organic Traffic
   - Social Media Presence
   - Market Position
   - Customer Sentiment
3. Notes: "Focus on top 3 competitors: CompanyA, CompanyB, CompanyC"
4. Generate → Edit → Finalize

### Comprehensive Business Review

1. Select **"My Business Performance"**
2. Choose:
   - Website Analytics (all sub-options)
   - Sales Performance (all sub-options)
   - Marketing ROI
   - Customer Behavior
   - Retention Metrics
3. Notes: "Year-over-year comparison (2023 vs 2024), focus on identifying growth opportunities"
4. Generate → Edit → Add executive summary section → Finalize

### Partner Discovery Report

1. Select **"New Partners Research"**
2. Choose:
   - Industry Leaders
   - Complementary Services
   - Company Profile
   - Partnership Potential
3. Notes: "Looking for SaaS companies in North America with 50-200 employees"
4. Generate → Edit → Finalize

---

## Troubleshooting

### Blueprint generation fails

**Problem**: Error message when clicking "Build Report Blueprint"

**Solutions**:
1. Check your internet connection
2. Make sure LLM API key is configured (check with admin)
3. Try with fewer data points
4. Refresh page and try again

### Drag-and-drop not working

**Problem**: Can't reorder sections

**Solutions**:
1. Make sure you're dragging from the handle icon (☰)
2. Try refreshing the page
3. Check browser console for errors

### Page is blank or loading forever

**Problem**: Report Builder page doesn't load

**Solutions**:
1. Make sure you're logged in
2. Clear browser cache
3. Check if backend is running: http://localhost:8000/api/health
4. Check browser console for errors

---

## What's Coming Next

### Phase 2 Features (Coming Soon)

- ✨ **Actual Report Generation**: Full reports with real data
- 💾 **Save Blueprints**: Save and load your blueprints
- 🤝 **Collaboration**: Share blueprints with team members
- 📊 **Templates**: Pre-built blueprint templates
- 📄 **Export**: Export reports as PDF, Word, Markdown
- 🔄 **Version Control**: Track changes and revert to previous versions

---

## Need Help?

- **Documentation**: See `BLUEPRINT_IMPLEMENTATION.md` for technical details
- **API Docs**: http://localhost:8000/docs
- **Issues**: Report bugs or request features via project repository

---

**Version**: 1.0
**Last Updated**: 2025-10-27
