"use client";

import React, { useState } from "react";
import { CreatePromoCodeDto, UpdatePromoCodeDto, PromoCode } from "@/lib/services/promo-codes.service";
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

interface PromoCodeFormProps {
  promoCode?: PromoCode | null;
  onSave: (promoCode: CreatePromoCodeDto | UpdatePromoCodeDto) => Promise<void>;
  onCancel: () => void;
}

const PromoCodeForm = ({ promoCode, onSave, onCancel }: PromoCodeFormProps) => {
  const [code, setCode] = useState(promoCode?.code || "");
  const [description, setDescription] = useState(promoCode?.description || "");
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_DELIVERY' | 'DELIVERY_DISCOUNT'>(
    promoCode?.discountType || "PERCENTAGE"
  );
  const [discountValue, setDiscountValue] = useState(promoCode?.discountValue || 0);
  const [maxTotalUsage, setMaxTotalUsage] = useState<number | undefined>(
    promoCode?.maxTotalUsage || undefined
  );
  const [expiresAt, setExpiresAt] = useState(
    promoCode?.expiresAt ? new Date(promoCode.expiresAt).toISOString().split('T')[0] : ""
  );
  const [oneTimePerCustomer, setOneTimePerCustomer] = useState(
    promoCode?.oneTimePerCustomer ?? true
  );
  const [isActive, setIsActive] = useState(promoCode?.isActive ?? true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate discount value based on type
    if (discountType === "PERCENTAGE" && (discountValue < 0 || discountValue > 100)) {
      alert("Percentage discount must be between 0 and 100");
      return;
    }

    if (discountType === "DELIVERY_DISCOUNT" && (discountValue < 0 || discountValue > 100)) {
      alert("Delivery discount percentage must be between 0 and 100");
      return;
    }

    if (discountType === "FIXED_AMOUNT" && discountValue < 0) {
      alert("Fixed amount discount must be greater than 0");
      return;
    }

    // For FREE_DELIVERY, discount value is irrelevant
    if (discountType === "FREE_DELIVERY") {
      setDiscountValue(0);
    }

    setLoading(true);
    try {
      const data: CreatePromoCodeDto | UpdatePromoCodeDto = {
        code: code.toUpperCase(),
        description: description || undefined,
        discountType: discountType as any, // Cast to satisfy enum type
        discountValue,
        maxTotalUsage: maxTotalUsage || undefined,
        expiresAt: expiresAt || undefined,
        oneTimePerCustomer,
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
      title={promoCode ? "Edit Promo Code" : "Create Promo Code"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Code" required>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
            placeholder="SUMMER2024"
            pattern="[A-Z0-9]+"
            title="Only uppercase letters and numbers allowed"
          />
        </FormField>

        <FormField label="Description">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter promo code description (optional)"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Discount Type" required>
            <Select
              value={discountType}
              onValueChange={(val) => setDiscountType(val as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_DELIVERY' | 'DELIVERY_DISCOUNT')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">Percentage (on items)</SelectItem>
                <SelectItem value="FIXED_AMOUNT">Fixed Amount (JOD)</SelectItem>
                <SelectItem value="FREE_DELIVERY">Free Delivery</SelectItem>
                <SelectItem value="DELIVERY_DISCOUNT">Delivery Fee Discount (%)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          {discountType !== "FREE_DELIVERY" && (
            <FormField label="Discount Value" required>
              <Input
                type="number"
                step="0.01"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                required
                placeholder={discountType === "PERCENTAGE" || discountType === "DELIVERY_DISCOUNT" ? "10" : "5.00"}
                min="0"
                max={discountType === "PERCENTAGE" || discountType === "DELIVERY_DISCOUNT" ? "100" : undefined}
              />
              <p className="text-xs text-gray-500 mt-1">
                {discountType === "PERCENTAGE"
                  ? "Enter a value between 0-100% (applies to items)"
                  : discountType === "DELIVERY_DISCOUNT"
                  ? "Enter a value between 0-100% (applies to delivery fee)"
                  : "Enter amount in JOD"}
              </p>
            </FormField>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Max Total Usage">
            <Input
              type="number"
              value={maxTotalUsage || ""}
              onChange={(e) => setMaxTotalUsage(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Unlimited"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for unlimited usage
            </p>
          </FormField>

          <FormField label="Expiration Date">
            <Input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for no expiration
            </p>
          </FormField>
        </div>

        <FormField label="One-Time Per Customer">
          <div className="flex items-center space-x-2">
            <Switch
              checked={oneTimePerCustomer}
              onCheckedChange={setOneTimePerCustomer}
            />
            <span className="text-sm">
              {oneTimePerCustomer
                ? "Each customer can use this code only once"
                : "Customers can use this code multiple times"}
            </span>
          </div>
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

export default PromoCodeForm;
