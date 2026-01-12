"use client";

import React, { useState } from "react";
import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto, SubscriptionPlan } from "@/lib/services/subscription-plans.service";
import { Modal } from "@/components/ui/modal";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";

interface SubscriptionPlanFormProps {
  plan?: SubscriptionPlan | null;
  onSave: (plan: CreateSubscriptionPlanDto | UpdateSubscriptionPlanDto) => Promise<void>;
  onCancel: () => void;
}

const SubscriptionPlanForm = ({ plan, onSave, onCancel }: SubscriptionPlanFormProps) => {
  const [name, setName] = useState(plan?.name || "");
  const [description, setDescription] = useState(plan?.description || "");
  const [coinCost, setCoinCost] = useState(plan?.coinCost || 0);
  const [price, setPrice] = useState(plan?.price || 0);
  const [validityDays, setValidityDays] = useState(plan?.validityDays || 30);
  const [features, setFeatures] = useState<string[]>(plan?.features || []);
  const [sortOrder, setSortOrder] = useState(plan?.sortOrder || 0);
  const [isActive, setIsActive] = useState(plan?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [newFeature, setNewFeature] = useState("");

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (coinCost < 1) {
      alert("Coin cost must be at least 1");
      return;
    }

    if (price < 0.01) {
      alert("Price must be at least 0.01 JOD");
      return;
    }

    if (validityDays < 1) {
      alert("Validity days must be at least 1");
      return;
    }

    setLoading(true);
    try {
      const data: CreateSubscriptionPlanDto | UpdateSubscriptionPlanDto = {
        name,
        description: description || undefined,
        coinCost,
        price,
        validityDays,
        features: features.length > 0 ? features : undefined,
        sortOrder,
        isActive,
      };

      await onSave(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={true}
      onClose={onCancel}
      title={plan ? "Edit Subscription Plan" : "Create Subscription Plan"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Plan Name" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Gold Plan"
          />
        </FormField>

        <FormField label="Description">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the plan (optional)"
            rows={3}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Gold Coins (Received)" required>
            <Input
              type="number"
              min="1"
              value={coinCost}
              onChange={(e) => setCoinCost(parseInt(e.target.value) || 0)}
              required
              placeholder="100"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Number of coins customer receives (1 coin = 1 JOD value)
            </p>
          </FormField>

          <FormField label="Actual Price (JOD)" required>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              required
              placeholder="80"
            />
            <p className="text-xs text-muted-foreground mt-1">
              What customer pays (e.g., 80 JOD for 100 coins)
            </p>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Validity (Days)" required>
            <Input
              type="number"
              min="1"
              value={validityDays}
              onChange={(e) => setValidityDays(parseInt(e.target.value) || 0)}
              required
              placeholder="30"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Subscription duration in days
            </p>
          </FormField>

          <FormField label="Sort Order">
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Lower numbers appear first
            </p>
          </FormField>
        </div>

        <FormField label="Features">
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                <span className="flex-1 text-sm">{feature}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveFeature(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add a feature (e.g., Free delivery)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddFeature}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </FormField>

        <FormField label="Active">
          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <span className="text-sm text-muted-foreground">
              {isActive ? "Plan is active and visible to customers" : "Plan is inactive"}
            </span>
          </div>
        </FormField>

        <div className="flex gap-2 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : plan ? "Update Plan" : "Create Plan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SubscriptionPlanForm;
