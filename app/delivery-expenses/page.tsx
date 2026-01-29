"use client";

import React, { useState, useEffect } from 'react';
import { Truck, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';
import { DataTable } from '@/components/ui/data-table';
import { PageTransition } from '@/components/page-transition';
import {
  deliveryExpensesService,
  DeliveryExpense,
} from '@/lib/services/delivery-expenses.service';
import { handleError, showSuccess } from '@/lib/utils/error-handler';

const DeliveryExpensesPage = () => {
  const [expenses, setExpenses] = useState<DeliveryExpense[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [cost, setCost] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [costError, setCostError] = useState('');

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await deliveryExpensesService.findAll();
      setExpenses(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCostError('');

    const parsedCost = parseFloat(cost);
    if (isNaN(parsedCost) || parsedCost <= 0) {
      setCostError('Please enter a valid cost');
      return;
    }

    if (!deliveryLocation.trim()) return;

    try {
      setSubmitting(true);
      await deliveryExpensesService.create({
        cost: parsedCost,
        deliveryLocation: deliveryLocation.trim(),
      });
      showSuccess('Delivery expense added');
      setModalOpen(false);
      setCost('');
      setDeliveryLocation('');
      fetchExpenses();
    } catch (error) {
      handleError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await deliveryExpensesService.remove(id);
      showSuccess('Delivery expense deleted');
      fetchExpenses();
    } catch (error) {
      handleError(error);
    }
  };

  // Calculate total cost
  const totalCost = expenses.reduce((sum, exp) => sum + exp.cost, 0);

  const columns = [
    {
      key: 'cost',
      header: 'Cost (JOD)',
      render: (expense: DeliveryExpense) => (
        <span className="font-semibold">{expense.cost.toFixed(2)}</span>
      ),
    },
    {
      key: 'deliveryLocation',
      header: 'Delivery Location',
      render: (expense: DeliveryExpense) => (
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-muted-foreground" />
          <span>{expense.deliveryLocation}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date & Time',
      render: (expense: DeliveryExpense) => (
        <span className="text-muted-foreground">
          {new Date(expense.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (expense: DeliveryExpense) => (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => handleDelete(expense.id)}
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <PageTransition>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Delivery Expenses</h1>
            <p className="text-muted-foreground">
              History of all delivery expenses.
              {expenses.length > 0 && (
                <span className="ml-2 font-medium text-foreground">
                  Total: JOD {totalCost.toFixed(2)}
                </span>
              )}
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>

        <DataTable
          title="All Delivery Expenses"
          data={expenses}
          columns={columns}
          loading={loading}
          emptyMessage="No delivery expenses yet"
          emptyDescription="Click 'Add Expense' to record a delivery expense."
          getRowKey={(expense) => expense.id}
        />

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Add Delivery Expense"
          size="sm"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Delivery Cost (JOD)" required error={costError}>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="e.g. 2.50"
                value={cost}
                onChange={(e) => {
                  setCost(e.target.value);
                  setCostError('');
                }}
                required
              />
            </FormField>

            <FormField label="Delivery Location" required>
              <Input
                type="text"
                placeholder="e.g. Abdoun, Amman"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
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
                {submitting ? 'Adding...' : 'Add Expense'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default DeliveryExpensesPage;
