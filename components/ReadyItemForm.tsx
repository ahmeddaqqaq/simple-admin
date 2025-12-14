"use client";

import React, { useState } from "react";
import { ReadyItem } from "@/lib/types/entities/ready-item";
import { Modal } from "@/components/ui/modal";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface ReadyItemFormProps {
  readyItem?: ReadyItem | null;
  onSave: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}

const ReadyItemForm = ({
  readyItem,
  onSave,
  onCancel,
}: ReadyItemFormProps) => {
  const [name, setName] = useState(readyItem?.name || "");
  const [description, setDescription] = useState(readyItem?.description || "");
  const [type, setType] = useState(readyItem?.type || "SALAD");
  const [price, setPrice] = useState(readyItem?.price || 0);
  const [calories, setCalories] = useState(readyItem?.calories || 0);
  const [protein, setProtein] = useState(readyItem?.protein || 0);
  const [carbs, setCarbs] = useState(readyItem?.carbs || 0);
  const [fat, setFat] = useState(readyItem?.fat || 0);
  const [isActive, setIsActive] = useState(readyItem?.isActive ?? true);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("type", type);
      formData.append("price", String(price));
      formData.append("calories", String(calories));
      formData.append("protein", String(protein));
      formData.append("carbs", String(carbs));
      formData.append("fat", String(fat));
      formData.append("isActive", String(isActive));
      if (image) formData.append("image", image);

      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={true}
      onClose={onCancel}
      title={readyItem ? "Edit Ready Item" : "Create Ready Item"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="form-grid">
        <FormField label="Name" required>
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </FormField>

        <FormField label="Description">
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormField>

        <FormField label="Type" required>
          <Select
            value={type}
            onValueChange={(val) => setType(val as "SALAD" | "SOUP" | "DETOX")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SALAD">Salad</SelectItem>
              <SelectItem value="SOUP">Soup</SelectItem>
              <SelectItem value="DETOX">Detox</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Price" required>
          <Input
            type="number"
            step="0.01"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
          />
        </FormField>

        <FormField label="Calories">
          <Input
            type="number"
            placeholder="Calories"
            value={calories}
            onChange={(e) => setCalories(Number(e.target.value))}
          />
        </FormField>

        <FormField label="Protein (g)">
          <Input
            type="number"
            placeholder="Protein"
            value={protein}
            onChange={(e) => setProtein(Number(e.target.value))}
          />
        </FormField>

        <FormField label="Carbs (g)">
          <Input
            type="number"
            placeholder="Carbs"
            value={carbs}
            onChange={(e) => setCarbs(Number(e.target.value))}
          />
        </FormField>

        <FormField label="Fats (g)">
          <Input
            type="number"
            placeholder="Fat"
            value={fat}
            onChange={(e) => setFat(Number(e.target.value))}
          />
        </FormField>

        <FormField label="Status">
          <div className="flex items-center space-x-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <span className="text-sm">{isActive ? "Active" : "Inactive"}</span>
          </div>
        </FormField>

        <FormField label="Image">
          <Input
            type="file"
            onChange={(e) =>
              setImage(e.target.files ? e.target.files[0] : null)
            }
            accept="image/*"
          />
        </FormField>

        <div className="md:col-span-2 form-actions">
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

export default ReadyItemForm;
