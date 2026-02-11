"use client";

import React, { useState, useEffect } from "react";
import { Briefcase, Trash2, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { FormField } from "@/components/ui/form-field";
import { DataTable } from "@/components/ui/data-table";
import { PageTransition } from "@/components/page-transition";
import {
  operationalCostsService,
  OperationalCost,
} from "@/lib/services/operational-costs.service";
import { handleError, showSuccess } from "@/lib/utils/error-handler";

const OperationalCostsPage = () => {
  const [costs, setCosts] = useState<OperationalCost[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<OperationalCost | null>(null);
  const [name, setName] = useState("");
  const [monthlyCost, setMonthlyCost] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCosts = async () => {
    try {
      setLoading(true);
      const data = await operationalCostsService.findAll();
      setCosts(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCosts();
  }, []);

  const handleOpenCreate = () => {
    setEditingCost(null);
    setName("");
    setMonthlyCost("");
    setModalOpen(true);
  };

  const handleOpenEdit = (cost: OperationalCost) => {
    setEditingCost(cost);
    setName(cost.name);
    setMonthlyCost(cost.monthlyCost.toString());
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedCost = parseFloat(monthlyCost);
    if (isNaN(parsedCost) || parsedCost < 0) return;

    try {
      setSubmitting(true);
      if (editingCost) {
        await operationalCostsService.update(editingCost.id, {
          name: name.trim(),
          monthlyCost: parsedCost,
        });
        showSuccess("Operational cost updated");
      } else {
        await operationalCostsService.create({
          name: name.trim(),
          monthlyCost: parsedCost,
        });
        showSuccess("Operational cost added");
      }
      setModalOpen(false);
      setName("");
      setMonthlyCost("");
      setEditingCost(null);
      fetchCosts();
    } catch (error) {
      handleError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this operational cost?"))
      return;

    try {
      await operationalCostsService.remove(id);
      showSuccess("Operational cost deleted");
      fetchCosts();
    } catch (error) {
      handleError(error);
    }
  };

  const totalMonthly = costs.reduce((sum, c) => sum + c.monthlyCost, 0);
  const totalDaily = totalMonthly / 30;

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (cost: OperationalCost) => (
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{cost.name}</span>
        </div>
      ),
    },
    {
      key: "monthlyCost",
      header: "Monthly Cost (JOD)",
      render: (cost: OperationalCost) => (
        <span className="font-semibold">JOD {cost.monthlyCost.toFixed(2)}</span>
      ),
    },
    {
      key: "dailyCost",
      header: "Daily Cost (JOD)",
      render: (cost: OperationalCost) => (
        <span className="text-muted-foreground">
          JOD {(cost.monthlyCost / 30).toFixed(2)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      render: (cost: OperationalCost) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleOpenEdit(cost)}
          >
            <Pencil className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleDelete(cost.id)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageTransition>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Operational Costs</h1>
            <p className="text-muted-foreground">
              Manage recurring monthly operational costs (salaries, marketing,
              etc.).
              {costs.length > 0 && (
                <span className="ml-2 font-medium text-foreground">
                  Total Monthly: JOD {totalMonthly.toFixed(2)} | Daily: JOD{" "}
                  {totalDaily.toFixed(2)}
                </span>
              )}
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Cost
          </Button>
        </div>

        <DataTable
          title="All Operational Costs"
          data={costs}
          columns={columns}
          loading={loading}
          emptyMessage="No operational costs yet"
          emptyDescription="Click 'Add Cost' to add a recurring operational cost."
          getRowKey={(cost) => cost.id}
        />

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCost ? "Edit Operational Cost" : "Add Operational Cost"}
          size="sm"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Cost Name" required>
              <Input
                type="text"
                placeholder="e.g. Staff Salaries"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Monthly Cost (JOD)" required>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 500.00"
                value={monthlyCost}
                onChange={(e) => setMonthlyCost(e.target.value)}
                required
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? editingCost
                    ? "Updating..."
                    : "Adding..."
                  : editingCost
                    ? "Update"
                    : "Add Cost"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default OperationalCostsPage;
