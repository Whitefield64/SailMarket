'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BlueprintSection, SectionType } from '@/types/blueprint.types';
import { X } from 'lucide-react';

interface SectionEditorProps {
  section: BlueprintSection | null;
  onSave: (section: BlueprintSection) => void;
  onCancel: () => void;
  mode: 'add' | 'edit';
}

export default function SectionEditor({ section, onSave, onCancel, mode }: SectionEditorProps) {
  const [formData, setFormData] = useState<BlueprintSection>({
    id: section?.id || `section_${Date.now()}`,
    type: section?.type || 'paragraph',
    content: section?.content || '',
    order: section?.order || 0,
    parentId: section?.parentId || null,
    metadata: {
      dataSource: section?.metadata.dataSource || '',
      analysisType: section?.metadata.analysisType || '',
      visualizationType: section?.metadata.visualizationType || '',
      estimatedLength: section?.metadata.estimatedLength || '',
    },
  });

  useEffect(() => {
    if (section) {
      setFormData(section);
    }
  }, [section]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {mode === 'add' ? 'Add New Section' : 'Edit Section'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="type">Section Type *</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as SectionType })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="title">Title</option>
              <option value="subtitle">Subtitle</option>
              <option value="section">Section</option>
              <option value="paragraph">Paragraph</option>
              <option value="image_placeholder">Image Placeholder</option>
              <option value="table_placeholder">Table Placeholder</option>
            </select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content Description *</Label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Describe what this section should contain..."
              rows={4}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              required
            />
          </div>

          {/* Metadata Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataSource">Data Source</Label>
              <input
                id="dataSource"
                type="text"
                value={formData.metadata.dataSource || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metadata: { ...formData.metadata, dataSource: e.target.value },
                  })
                }
                placeholder="e.g., Google Analytics, SEMrush"
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="analysisType">Analysis Type</Label>
              <input
                id="analysisType"
                type="text"
                value={formData.metadata.analysisType || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metadata: { ...formData.metadata, analysisType: e.target.value },
                  })
                }
                placeholder="e.g., Trend analysis, Comparison"
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {(formData.type === 'image_placeholder' || formData.type === 'table_placeholder') && (
              <div className="space-y-2">
                <Label htmlFor="visualizationType">Visualization Type</Label>
                <input
                  id="visualizationType"
                  type="text"
                  value={formData.metadata.visualizationType || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, visualizationType: e.target.value },
                    })
                  }
                  placeholder="e.g., Bar chart, Line graph"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="estimatedLength">Estimated Length</Label>
              <input
                id="estimatedLength"
                type="text"
                value={formData.metadata.estimatedLength || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metadata: { ...formData.metadata, estimatedLength: e.target.value },
                  })
                }
                placeholder="e.g., 200 words, 1 page"
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'add' ? 'Add Section' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
