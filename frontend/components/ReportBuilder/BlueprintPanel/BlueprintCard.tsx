'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BlueprintSection } from '@/types/blueprint.types';
import {
  FileText,
  Heading1,
  Heading2,
  AlignLeft,
  Image,
  Table,
  Edit,
  Trash2,
  Plus,
  GripVertical,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BlueprintCardProps {
  section: BlueprintSection;
  onEdit: (section: BlueprintSection) => void;
  onDelete: (id: string) => void;
  onAddBelow: (afterId: string) => void;
  depth?: number;
  dragHandleProps?: any;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  title: <Heading1 className="w-4 h-4" />,
  subtitle: <Heading2 className="w-4 h-4" />,
  section: <FileText className="w-4 h-4" />,
  paragraph: <AlignLeft className="w-4 h-4" />,
  image_placeholder: <Image className="w-4 h-4" />,
  table_placeholder: <Table className="w-4 h-4" />,
};

const TYPE_COLORS: Record<string, string> = {
  title: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  subtitle: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  section: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  paragraph: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  image_placeholder: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  table_placeholder: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
};

export default function BlueprintCard({
  section,
  onEdit,
  onDelete,
  onAddBelow,
  depth = 0,
  dragHandleProps,
}: BlueprintCardProps) {
  const indentClass = `ml-${Math.min(depth * 4, 16)}`;

  return (
    <Card className={`mb-2 hover:shadow-md transition-shadow ${indentClass}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div {...dragHandleProps} className="cursor-move mt-1">
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={TYPE_COLORS[section.type] || 'bg-gray-100'}>
                <div className="flex items-center gap-1">
                  {TYPE_ICONS[section.type]}
                  <span className="text-xs font-medium">
                    {section.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </Badge>
              {section.metadata.visualizationType && (
                <Badge variant="outline" className="text-xs">
                  {section.metadata.visualizationType}
                </Badge>
              )}
            </div>

            <p className="text-sm font-medium mb-1 line-clamp-2">{section.content}</p>

            {(section.metadata.dataSource || section.metadata.analysisType) && (
              <div className="text-xs text-muted-foreground space-y-0.5 mt-2">
                {section.metadata.dataSource && (
                  <div>
                    <span className="font-semibold">Data Source:</span> {section.metadata.dataSource}
                  </div>
                )}
                {section.metadata.analysisType && (
                  <div>
                    <span className="font-semibold">Analysis:</span> {section.metadata.analysisType}
                  </div>
                )}
                {section.metadata.estimatedLength && (
                  <div>
                    <span className="font-semibold">Length:</span> {section.metadata.estimatedLength}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(section)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddBelow(section.id)}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(section.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
