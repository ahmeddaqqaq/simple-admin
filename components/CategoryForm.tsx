"use client";

import React, { useState } from "react";
import { CreateCategoryDto, UpdateCategoryDto } from "@/lib/api";
import { Category } from "@/lib/types/entities/category";
import { Modal } from "@/components/ui/modal";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface CategoryFormProps {
  category?: Category | null;
  onSave: (category: CreateCategoryDto | UpdateCategoryDto) => Promise<void>;
  onCancel: () => void;
}

const CategoryForm = ({ category, onSave, onCancel }: CategoryFormProps) => {
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [type, setType] = useState(category?.type || "BUILD_YOUR_MEAL");
  const [sortOrder, setSortOrder] = useState(category?.sortOrder || 0);
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await onSave({
        name,
        description,
        type: type as any,
        sortOrder,
        isActive,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={true}
      onClose={onCancel}
      title={category ? "Edit Category" : "Create Category"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Name" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter category name"
          />
        </FormField>

        <FormField label="Description">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter category description (optional)"
          />
        </FormField>

        <FormField label="Type" required>
          <Select
            value={type}
            onValueChange={(val) =>
              setType(val as "BUILD_YOUR_MEAL" | "SMOOTHIE" | "READY_ITEM")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BUILD_YOUR_MEAL">Build Your Meal</SelectItem>
              <SelectItem value="SMOOTHIE">Smoothie</SelectItem>
              <SelectItem value="READY_ITEM">Ready Item</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Sort Order">
          <Input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            placeholder="0"
          />
        </FormField>

        <FormField label="Status">
          <div className="flex items-center space-x-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <span className="text-sm">{isActive ? "Active" : "Inactive"}</span>
          </div>
        </FormField>

        <div className="form-actions">
          <Button variant="secondary" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryForm;
