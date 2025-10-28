'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BlueprintSection } from '@/types/blueprint.types';
import BlueprintCard from './BlueprintCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import SectionEditor from './SectionEditor';
import { FileText, Plus } from 'lucide-react';

interface SortableItemProps {
  section: BlueprintSection;
  onEdit: (section: BlueprintSection) => void;
  onDelete: (id: string) => void;
  onAddBelow: (afterId: string) => void;
}

function SortableItem({ section, onEdit, onDelete, onAddBelow }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <BlueprintCard
        section={section}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddBelow={onAddBelow}
        dragHandleProps={listeners}
      />
    </div>
  );
}

interface BlueprintTreeProps {
  sections: BlueprintSection[];
  onSectionsChange: (sections: BlueprintSection[]) => void;
}

export default function BlueprintTree({ sections, onSectionsChange }: BlueprintTreeProps) {
  const [editingSection, setEditingSection] = useState<BlueprintSection | null>(null);
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('edit');
  const [addAfter, setAddAfter] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      const newSections = arrayMove(sections, oldIndex, newIndex).map((section, index) => ({
        ...section,
        order: index,
      }));

      onSectionsChange(newSections);
    }
  };

  const handleEdit = (section: BlueprintSection) => {
    setEditingSection(section);
    setEditorMode('edit');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this section?')) {
      const newSections = sections
        .filter((s) => s.id !== id)
        .map((section, index) => ({
          ...section,
          order: index,
        }));
      onSectionsChange(newSections);
    }
  };

  const handleAddBelow = (afterId: string) => {
    setAddAfter(afterId);
    setEditingSection(null);
    setEditorMode('add');
  };

  const handleAddNew = () => {
    setAddAfter(null);
    setEditingSection(null);
    setEditorMode('add');
  };

  const handleSave = (section: BlueprintSection) => {
    if (editorMode === 'add') {
      let newSections: BlueprintSection[];

      if (addAfter) {
        const afterIndex = sections.findIndex((s) => s.id === addAfter);
        newSections = [
          ...sections.slice(0, afterIndex + 1),
          section,
          ...sections.slice(afterIndex + 1),
        ].map((s, index) => ({ ...s, order: index }));
      } else {
        newSections = [...sections, section].map((s, index) => ({ ...s, order: index }));
      }

      onSectionsChange(newSections);
    } else {
      const newSections = sections.map((s) => (s.id === section.id ? section : s));
      onSectionsChange(newSections);
    }

    setEditingSection(null);
    setAddAfter(null);
  };

  const handleCancel = () => {
    setEditingSection(null);
    setAddAfter(null);
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Blueprint Structure
              </CardTitle>
              <CardDescription>
                Drag to reorder, click to edit sections
              </CardDescription>
            </div>
            <Button onClick={handleAddNew} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            {sections.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No sections yet</p>
                <p className="text-sm mb-4">
                  Generate a blueprint or add sections manually
                </p>
                <Button onClick={handleAddNew}>Add First Section</Button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {sections.map((section) => (
                      <SortableItem
                        key={section.id}
                        section={section}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAddBelow={handleAddBelow}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {(editingSection !== null || editorMode === 'add') && (
        <SectionEditor
          section={editingSection}
          onSave={handleSave}
          onCancel={handleCancel}
          mode={editorMode}
        />
      )}
    </div>
  );
}
