import { Blueprint, BlueprintSection } from '@/types/blueprint.types';

/**
 * Converts a Blueprint object into a structured text prompt for report generation.
 * This prompt can be sent to the LLM to generate the actual report content.
 */
export function blueprintToPrompt(blueprint: Blueprint): string {
  const reportTypeLabel = blueprint.reportType.replace(/_/g, ' ').toUpperCase();

  // Build hierarchical section structure
  const sectionsText = buildSectionsHierarchy(blueprint.sections);

  const prompt = `REPORT GENERATION INSTRUCTIONS

Report Title: ${blueprint.reportTitle}
Report Type: ${reportTypeLabel}
Generation Date: ${blueprint.generatedAt}

STRUCTURAL BLUEPRINT:

${sectionsText}

---

GENERATION GUIDELINES:
1. Follow the exact structure outlined above
2. For [PARAGRAPH] sections: Write detailed, data-driven analysis
3. For [IMAGE_PLACEHOLDER] sections: Describe what visualization would be ideal (actual generation happens later via MCP tools)
4. For [TABLE_PLACEHOLDER] sections: Structure data in markdown table format
5. Maintain professional tone throughout
6. Use specific data points and metrics where applicable
7. Each section should flow logically to the next
8. Include relevant citations or data sources where appropriate

QUALITY STANDARDS:
- Analytical depth: High
- Data-driven insights: Required
- Professional formatting: Essential
- Actionable recommendations: Where applicable
- Clear section transitions: Required
- Evidence-based conclusions: Mandatory

OUTPUT FORMAT:
Generate the complete report following the blueprint structure. Use markdown formatting for readability:
- Use # for titles, ## for sections, ### for subsections
- Use **bold** for emphasis
- Use bullet points and numbered lists where appropriate
- For tables, use proper markdown table syntax
- For image placeholders, use the format: [IMAGE: description]

Begin generating the report now:
`;

  return prompt;
}

/**
 * Build a hierarchical text representation of the blueprint sections.
 */
function buildSectionsHierarchy(sections: BlueprintSection[]): string {
  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  // Build section map for quick lookup
  const sectionMap = new Map<string, BlueprintSection>();
  sortedSections.forEach((section) => {
    sectionMap.set(section.id, section);
  });

  // Find root sections (no parent)
  const rootSections = sortedSections.filter((s) => !s.parentId);

  // Build text representation
  let result = '';
  let counter = 1;

  rootSections.forEach((section) => {
    result += buildSectionText(section, sectionMap, sortedSections, counter, 0);
    counter++;
  });

  return result;
}

/**
 * Recursively build text for a section and its children.
 */
function buildSectionText(
  section: BlueprintSection,
  sectionMap: Map<string, BlueprintSection>,
  allSections: BlueprintSection[],
  number: number,
  depth: number
): string {
  const indent = '  '.repeat(depth);
  const typeLabel = section.type.toUpperCase().replace(/_/g, ' ');

  let text = `${indent}${number}. [${typeLabel}] ${section.content}\n`;

  // Add metadata if present
  if (section.metadata.dataSource || section.metadata.analysisType || section.metadata.estimatedLength) {
    text += `${indent}   Metadata:\n`;

    if (section.metadata.dataSource) {
      text += `${indent}   - Data Source: ${section.metadata.dataSource}\n`;
    }

    if (section.metadata.analysisType) {
      text += `${indent}   - Analysis Type: ${section.metadata.analysisType}\n`;
    }

    if (section.metadata.estimatedLength) {
      text += `${indent}   - Estimated Length: ${section.metadata.estimatedLength}\n`;
    }

    if (section.type === 'image_placeholder' && section.metadata.visualizationType) {
      text += `${indent}   - Visualization: ${section.metadata.visualizationType}\n`;
      text += `${indent}   - Description: Generate a detailed ${section.metadata.visualizationType} that visualizes: ${section.content}\n`;
    }

    if (section.type === 'table_placeholder' && section.metadata.visualizationType) {
      text += `${indent}   - Table Type: ${section.metadata.visualizationType}\n`;
      text += `${indent}   - Description: Create a comprehensive table showing: ${section.content}\n`;
    }
  }

  text += '\n';

  // Find and add children
  const children = allSections.filter((s) => s.parentId === section.id);
  children.forEach((child, index) => {
    text += buildSectionText(child, sectionMap, allSections, index + 1, depth + 1);
  });

  return text;
}

/**
 * Get a summary of the blueprint for display purposes.
 */
export function getBlueprintSummary(blueprint: Blueprint): {
  totalSections: number;
  sectionTypes: Record<string, number>;
  estimatedLength: string;
} {
  const sectionTypes: Record<string, number> = {};

  blueprint.sections.forEach((section) => {
    sectionTypes[section.type] = (sectionTypes[section.type] || 0) + 1;
  });

  // Estimate total length (rough calculation)
  let totalWords = 0;
  blueprint.sections.forEach((section) => {
    if (section.metadata.estimatedLength) {
      const match = section.metadata.estimatedLength.match(/(\d+)\s*words?/i);
      if (match) {
        totalWords += parseInt(match[1]);
      }
    }
  });

  const estimatedLength = totalWords > 0 ? `~${totalWords} words` : 'Not specified';

  return {
    totalSections: blueprint.sections.length,
    sectionTypes,
    estimatedLength,
  };
}
