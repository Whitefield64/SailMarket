// Form Wizard Type Definitions

export interface WizardStep {
  id: number;
  title: string;
  description: string;
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    title: 'Report Type',
    description: 'What is your report about?',
  },
  {
    id: 2,
    title: 'Data Points',
    description: 'Select the data points to include',
  },
  {
    id: 3,
    title: 'Additional Context',
    description: 'Add any additional notes or requirements',
  },
];

export interface ReportTypeOption {
  value: string;
  label: string;
  description: string;
}

export const REPORT_TYPE_OPTIONS: ReportTypeOption[] = [
  {
    value: 'competitor_analysis',
    label: 'Competitor Analysis',
    description: 'Analyze competitors in your market',
  },
  {
    value: 'business_performance',
    label: 'My Business Performance',
    description: 'Track and analyze your business metrics',
  },
  {
    value: 'new_partners',
    label: 'New Partners Research',
    description: 'Find and evaluate potential business partners',
  },
  {
    value: 'market_trends',
    label: 'Market Trends Analysis',
    description: 'Understand current market trends and opportunities',
  },
  {
    value: 'product_launch',
    label: 'Product Launch Strategy',
    description: 'Plan a successful product launch',
  },
];
