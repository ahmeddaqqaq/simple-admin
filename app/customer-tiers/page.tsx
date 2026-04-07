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
import { Pencil, Award } from "lucide-react";

interface TierFormState {
  discountPercentage: number;
  discountLimit: number;
}

const defaultForm: TierFormState = {
  discountPercentage: 0,
  discountLimit: 0,
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

  const openEditModal = (tier: CustomerTier) => {
    setSelectedTier(tier);
    setForm({
      discountPercentage: tier.discountPercentage || 0,
      discountLimit: tier.discountLimit || 0,
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
    if (!selectedTier) return;
    setSaving(true);
    try {
      await customerTiersService.update(selectedTier.level, {
        discountPercentage: form.discountPercentage,
        discountLimit: form.discountLimit,
      });
      showSuccess("Customer tier updated successfully");
      fetchTiers();
      closeModal();
    } catch (error) {
      handleError(error);
    } finally {
      setSaving(false);
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
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Tiers</CardTitle>
            <CardDescription>
              Tiers are assigned based on customers&apos; all-time spend (BASE → BRONZE → SILVER → GOLD → DIAMOND)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : tiers.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-lg font-medium text-muted-foreground">
                  No tiers found
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tier</TableHead>
                    <TableHead>Min Total Spend</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Discount Limit</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tiers.map((tier) => (
                    <TableRow key={tier.id}>
                      <TableCell>
                        <span className="font-semibold">{tier.name}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          JOD {(tier.minTotalSpend || 0).toFixed(2)}
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
                          {tier.discountLimit ? `JOD ${tier.discountLimit}` : "Unlimited"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {tier.description || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(tier)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {isModalOpen && selectedTier && (
          <Modal
            open={isModalOpen}
            onClose={closeModal}
            title={`Edit ${selectedTier.name} Tier`}
            size="md"
          >
            <form onSubmit={handleSave} className="space-y-4">
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

              <FormField label="Discount Limit (JOD, 0 = unlimited)">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  value={form.discountLimit}
                  onChange={(e) =>
                    setForm({ ...form, discountLimit: Number(e.target.value) })
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
