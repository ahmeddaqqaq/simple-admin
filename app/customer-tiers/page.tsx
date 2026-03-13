"use client";

import React, { useEffect, useState } from "react";
import {
  customerTiersService,
  CustomerTier,
} from "@/lib/services/customer-tiers.service";
import { handleError, showSuccess } from "@/lib/utils/error-handler";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { FormField } from "@/components/ui/form-field";
import { PageTransition } from "@/components/page-transition";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Award } from "lucide-react";

const PRESET_COLORS = [
  "#6B7280", // Gray (default / no tier)
  "#CD7F32", // Bronze
  "#C0C0C0", // Silver
  "#FFD700", // Gold
  "#B9F2FF", // Diamond / Platinum
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FFEAA7", // Yellow
];

interface TierFormState {
  name: string;
  color: string;
  minMonthlySpend: number;
  discountPercentage: number;
  description: string;
  displayOrder: number;
}

const defaultForm: TierFormState = {
  name: "",
  color: "#6B7280",
  minMonthlySpend: 0,
  discountPercentage: 0,
  description: "",
  displayOrder: 0,
};

const CustomerTiersPage = () => {
  const [tiers, setTiers] = useState<CustomerTier[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<CustomerTier | null>(null);
  const [form, setForm] = useState<TierFormState>(defaultForm);
  const [saving, setSaving] = useState(false);

  const fetchTiers = async () => {
    try {
      setLoading(true);
      const data = await customerTiersService.findAll();
      setTiers(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const openCreateModal = () => {
    setSelectedTier(null);
    setForm(defaultForm);
    setIsModalOpen(true);
  };

  const openEditModal = (tier: CustomerTier) => {
    setSelectedTier(tier);
    setForm({
      name: tier.name,
      color: tier.color || "#6B7280",
      minMonthlySpend: tier.minMonthlySpend,
      discountPercentage: tier.discountPercentage || 0,
      description: tier.description || "",
      displayOrder: tier.displayOrder || 0,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTier(null);
    setForm(defaultForm);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        color: form.color,
        minMonthlySpend: form.minMonthlySpend,
        discountPercentage: form.discountPercentage,
        description: form.description || undefined,
        displayOrder: form.displayOrder,
      };

      if (selectedTier) {
        await customerTiersService.update(selectedTier.id, payload);
        showSuccess("Customer tier updated successfully");
      } else {
        await customerTiersService.create(payload);
        showSuccess("Customer tier created successfully");
      }
      fetchTiers();
      closeModal();
    } catch (error) {
      handleError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this tier?")) return;
    try {
      await customerTiersService.remove(id);
      showSuccess("Customer tier deleted successfully");
      fetchTiers();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Customer Tiers</h1>
            <p className="page-description">
              Manage loyalty tiers and associated discounts
            </p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            New Tier
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Tiers</CardTitle>
            <CardDescription>
              Tiers are assigned to customers based on their monthly spend
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : tiers.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-lg font-medium text-muted-foreground">
                  No tiers found
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first customer tier to get started
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tier</TableHead>
                    <TableHead>Min Monthly Spend</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tiers.map((tier) => (
                    <TableRow key={tier.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full border-2 border-border flex-shrink-0"
                            style={{ backgroundColor: tier.color || "#6B7280" }}
                          />
                          <span className="font-semibold">{tier.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          JOD {(tier.minMonthlySpend || 0).toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tier.discountPercentage ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {tier.discountPercentage}% off
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {tier.description || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tier.displayOrder ?? 0}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(tier)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(tier.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {isModalOpen && (
          <Modal
            open={isModalOpen}
            onClose={closeModal}
            title={selectedTier ? "Edit Customer Tier" : "Create Customer Tier"}
            size="md"
          >
            <form onSubmit={handleSave} className="space-y-4">
              <FormField label="Tier Name" required>
                <Input
                  placeholder="e.g. Bronze, Silver, Gold"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Color">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full border-2 border-border flex-shrink-0"
                      style={{ backgroundColor: form.color }}
                    />
                    <Input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground font-mono">
                      {form.color}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                          form.color === color
                            ? "border-foreground scale-110"
                            : "border-border"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setForm({ ...form, color })}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </FormField>

              <FormField label="Minimum Monthly Spend (JOD)" required>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.minMonthlySpend}
                  onChange={(e) =>
                    setForm({ ...form, minMonthlySpend: Number(e.target.value) })
                  }
                  required
                />
              </FormField>

              <FormField label="Discount Percentage (%)">
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={form.discountPercentage}
                  onChange={(e) =>
                    setForm({ ...form, discountPercentage: Number(e.target.value) })
                  }
                />
              </FormField>

              <FormField label="Description">
                <Input
                  placeholder="Optional description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </FormField>

              <FormField label="Display Order">
                <Input
                  type="number"
                  placeholder="0"
                  value={form.displayOrder}
                  onChange={(e) =>
                    setForm({ ...form, displayOrder: Number(e.target.value) })
                  }
                />
              </FormField>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" type="button" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </PageTransition>
  );
};

export default CustomerTiersPage;
