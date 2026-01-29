"use client";

import React, { useState } from 'react';
import { Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';
import { deliveryExpensesService } from '@/lib/services/delivery-expenses.service';
import { handleError, showSuccess } from '@/lib/utils/error-handler';

const DashboardPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [cost, setCost] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [costError, setCostError] = useState('');

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
      setLoading(true);
      await deliveryExpensesService.create({
        cost: parsedCost,
        deliveryLocation: deliveryLocation.trim(),
      });
      showSuccess('Delivery expense added');
      setModalOpen(false);
      setCost('');
      setDeliveryLocation('');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mb-6">Welcome to the Meal Builder admin dashboard.</p>

      <Button onClick={() => setModalOpen(true)}>
        <Truck className="w-4 h-4 mr-2" />
        Add Delivery Expense
      </Button>

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
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;
