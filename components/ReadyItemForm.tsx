"use client";

import React, { useState, useEffect } from "react";
import { ReadyItem } from "@/lib/types/entities/ready-item";
import { Ingredient } from "@/lib/types/entities/ingredient";
import { ingredientsService } from "@/lib/services";
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

interface AddOnConfig {
  ingredientId: string;
  price: number;
}

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
  const [costPrice, setCostPrice] = useState(readyItem?.costPrice || 0);
  const [calories, setCalories] = useState(readyItem?.calories || 0);
  const [protein, setProtein] = useState(readyItem?.protein || 0);
  const [carbs, setCarbs] = useState(readyItem?.carbs || 0);
  const [fat, setFat] = useState(readyItem?.fat || 0);
  const [isActive, setIsActive] = useState(readyItem?.isActive ?? true);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Add-on state
  const [allowAddOns, setAllowAddOns] = useState(readyItem?.allowAddOns ?? false);
  const [addOns, setAddOns] = useState<AddOnConfig[]>([]);
  const [proteinIngredients, setProteinIngredients] = useState<Ingredient[]>([]);
  const [loadingIngredients, setLoadingIngredients] = useState(false);

  // Initialize add-ons from existing data
  useEffect(() => {
    if (readyItem?.availableAddOns) {
      setAddOns(
        readyItem.availableAddOns.map((ao) => ({
          ingredientId: ao.ingredientId,
          price: ao.price,
        }))
      );
    }
  }, [readyItem]);

  // Fetch protein ingredients when allowAddOns is enabled
  useEffect(() => {
    if (allowAddOns && type === "SALAD" && proteinIngredients.length === 0) {
      setLoadingIngredients(true);
      ingredientsService
        .findAll(undefined, false)
        .then((ingredients) => {
          // Filter for protein-category ingredients (those with basePrice > 0)
          const proteins = ingredients.filter(
            (ing) => ing.basePrice > 0 && !ing.isNoneOption
          );
          setProteinIngredients(proteins);
        })
        .catch(console.error)
        .finally(() => setLoadingIngredients(false));
    }
  }, [allowAddOns, type]);

  const toggleIngredientAddOn = (ingredientId: string) => {
    setAddOns((prev) => {
      const existing = prev.find((ao) => ao.ingredientId === ingredientId);
      if (existing) {
        return prev.filter((ao) => ao.ingredientId !== ingredientId);
      }
      return [...prev, { ingredientId, price: 1.5 }];
    });
  };

  const updateAddOnPrice = (ingredientId: string, newPrice: number) => {
    setAddOns((prev) =>
      prev.map((ao) =>
        ao.ingredientId === ingredientId ? { ...ao, price: newPrice } : ao
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("type", type);
      formData.append("price", String(price));
      formData.append("costPrice", String(costPrice));
      formData.append("calories", String(calories));
      formData.append("protein", String(protein));
      formData.append("carbs", String(carbs));
      formData.append("fat", String(fat));
      formData.append("isActive", String(isActive));
      formData.append("allowAddOns", String(allowAddOns));
      if (image) formData.append("image", image);

      if (allowAddOns && addOns.length > 0) {
        formData.append("addOns", JSON.stringify(addOns));
      } else if (!allowAddOns) {
        formData.append("addOns", "[]");
      }

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

        <FormField label="Cost Price (JOD)">
          <Input
            type="number"
            step="0.01"
            placeholder="Cost Price"
            value={costPrice}
            onChange={(e) => setCostPrice(Number(e.target.value))}
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

        {/* Add-ons section - only for SALAD type */}
        {type === "SALAD" && (
          <div className="md:col-span-2 space-y-4 border-t pt-4">
            <FormField label="Allow Protein Add-Ons">
              <div className="flex items-center space-x-2">
                <Switch checked={allowAddOns} onCheckedChange={setAllowAddOns} />
                <span className="text-sm">
                  {allowAddOns ? "Enabled" : "Disabled"}
                </span>
              </div>
            </FormField>

            {allowAddOns && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Select protein ingredients as add-ons and set their price:
                </p>
                {loadingIngredients ? (
                  <p className="text-sm text-muted-foreground">Loading ingredients...</p>
                ) : proteinIngredients.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No protein ingredients found (ingredients with basePrice {">"} 0)
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {proteinIngredients.map((ing) => {
                      const isSelected = addOns.some(
                        (ao) => ao.ingredientId === ing.id
                      );
                      const addOn = addOns.find(
                        (ao) => ao.ingredientId === ing.id
                      );
                      return (
                        <div
                          key={ing.id}
                          className="flex items-center gap-3 p-2 rounded-lg border"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleIngredientAddOn(ing.id)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <span className="text-sm flex-1">{ing.name}</span>
                          {isSelected && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">
                                JOD
                              </span>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={addOn?.price ?? 0}
                                onChange={(e) =>
                                  updateAddOnPrice(
                                    ing.id,
                                    Number(e.target.value)
                                  )
                                }
                                className="w-20 h-8 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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
