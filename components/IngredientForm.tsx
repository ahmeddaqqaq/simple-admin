"use client";

import React, { useEffect, useState } from "react";
import { Ingredient } from "@/lib/types/entities/ingredient";
import { Category } from "@/lib/types/entities/category";
import { categoriesService } from "@/lib/services";
import { handleError } from "@/lib/utils/error-handler";
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

interface IngredientFormProps {
  ingredient?: Ingredient | null;
  onSave: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}

const IngredientForm = ({
  ingredient,
  onSave,
  onCancel,
}: IngredientFormProps) => {
  const [name, setName] = useState(ingredient?.name || "");
  const [description, setDescription] = useState(ingredient?.description || "");
  const [categoryId, setCategoryId] = useState(ingredient?.categoryId || "");
  const [calories, setCalories] = useState(ingredient?.calories || 0);
  const [carbs, setCarbs] = useState(ingredient?.carbs || 0);
  const [fat, setFat] = useState(ingredient?.fat || 0);
  const [protein, setProtein] = useState(ingredient?.protein || 0);
  const [baseServing, setBaseServing] = useState(ingredient?.baseServing || 0);
  const [plusAmount, setPlusAmount] = useState(ingredient?.plusAmount || 0);
  const [pricePerPlus, setPricePerPlus] = useState(ingredient?.pricePerPlus || 0);
  const [basePrice, setBasePrice] = useState(ingredient?.basePrice || 0);
  const [isNoneOption, setIsNoneOption] = useState(ingredient?.isNoneOption ?? false);
  const [isActive, setIsActive] = useState(ingredient?.isActive ?? true);
  const [image, setImage] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categoriesService.findAll();
        setCategories(categoriesData);
        if (!ingredient && categoriesData.length > 0) {
          setCategoryId(categoriesData[0].id);
        }
      } catch (error) {
        handleError(error);
      }
    };
    fetchCategories();
  }, [ingredient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("categoryId", categoryId);
      formData.append("calories", String(calories));
      formData.append("carbs", String(carbs));
      formData.append("fat", String(fat));
      formData.append("protein", String(protein));
      formData.append("baseServing", String(baseServing));
      formData.append("plusAmount", String(plusAmount));
      formData.append("pricePerPlus", String(pricePerPlus));
      formData.append("basePrice", String(basePrice));
      formData.append("isNoneOption", String(isNoneOption));
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
      title={ingredient ? "Edit Ingredient" : "Create Ingredient"}
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

        <FormField label="Category" required>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <div className="md:col-span-2">
          <FormField label="Description">
            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </FormField>
        </div>

        <FormField label="Base Price" required>
          <Input
            type="number"
            step="0.01"
            placeholder="Base Price"
            value={basePrice}
            onChange={(e) => setBasePrice(Number(e.target.value))}
            required
          />
        </FormField>

        <FormField label="Price Per Plus" required>
          <Input
            type="number"
            step="0.01"
            placeholder="Price Per Plus"
            value={pricePerPlus}
            onChange={(e) => setPricePerPlus(Number(e.target.value))}
            required
          />
        </FormField>

        <FormField label="Base Serving (g)">
          <Input
            type="number"
            placeholder="Base Serving"
            value={baseServing}
            onChange={(e) => setBaseServing(Number(e.target.value))}
          />
        </FormField>

        <FormField label="Plus Amount (g)">
          <Input
            type="number"
            placeholder="Plus Amount"
            value={plusAmount}
            onChange={(e) => setPlusAmount(Number(e.target.value))}
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
            step="0.1"
            placeholder="Protein"
            value={protein}
            onChange={(e) => setProtein(Number(e.target.value))}
          />
        </FormField>

        <FormField label="Carbs (g)">
          <Input
            type="number"
            step="0.1"
            placeholder="Carbs"
            value={carbs}
            onChange={(e) => setCarbs(Number(e.target.value))}
          />
        </FormField>

        <FormField label="Fat (g)">
          <Input
            type="number"
            step="0.1"
            placeholder="Fat"
            value={fat}
            onChange={(e) => setFat(Number(e.target.value))}
          />
        </FormField>

        <FormField label="Is None Option">
          <div className="flex items-center space-x-2">
            <Switch checked={isNoneOption} onCheckedChange={setIsNoneOption} />
            <span className="text-sm">{isNoneOption ? "Yes" : "No"}</span>
          </div>
        </FormField>

        <FormField label="Status">
          <div className="flex items-center space-x-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <span className="text-sm">{isActive ? "Active" : "Inactive"}</span>
          </div>
        </FormField>

        <div className="md:col-span-2">
          <FormField label="Image">
            <Input
              type="file"
              onChange={(e) =>
                setImage(e.target.files ? e.target.files[0] : null)
              }
              accept="image/*"
            />
          </FormField>
        </div>

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

export default IngredientForm;
