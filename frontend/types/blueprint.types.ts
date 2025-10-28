// Blueprint System Type Definitions

export type ReportType =
  | 'competitor_analysis'
  | 'business_performance'
  | 'new_partners'
  | 'market_trends'
  | 'product_launch';

export type SectionType =
  | 'title'
  | 'subtitle'
  | 'section'
  | 'paragraph'
  | 'image_placeholder'
  | 'table_placeholder';

export interface SectionMetadata {
  dataSource?: string;
  analysisType?: string;
  visualizationType?: string;
  estimatedLength?: string;
}

export interface BlueprintSection {
  id: string;
  type: SectionType;
  content: string;
  order: number;
  parentId: string | null;
  metadata: SectionMetadata;
}

export interface Blueprint {
  reportTitle: string;
  sections: BlueprintSection[];
  generatedAt: string;
  reportType: ReportType;
}

export interface DataPoint {
  id: string;
  label: string;
  subOptions?: SubOption[];
}

export interface SubOption {
  id: string;
  label: string;
}

export interface FormData {
  reportType: ReportType | '';
  selectedDataPoints: Record<string, boolean>;
  selectedSubOptions: Record<string, boolean>;
  additionalNotes: string;
}

export interface BlueprintGenerationRequest {
  reportType: ReportType;
  selectedDataPoints: string[];
  additionalNotes: string;
}

export interface BlueprintGenerationResponse {
  blueprint: Blueprint;
  success: boolean;
  error?: string;
}
