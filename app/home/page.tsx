"use client";

import React, { useState, useEffect } from 'react';
import { Truck, Users, UserCheck, UserX, TrendingUp, Calendar, Loader2, Trophy, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { deliveryExpensesService } from '@/lib/services/delivery-expenses.service';
import { reportsService, DashboardMetrics } from '@/lib/services/reports.service';
import { handleError, showSuccess } from '@/lib/utils/error-handler';

const DashboardPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [cost, setCost] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [costError, setCostError] = useState('');

  // Dashboard metrics state
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Date range - default to last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);

  const fetchMetrics = async () => {
    try {
      setMetricsLoading(true);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      const data = await reportsService.getDashboardMetrics(start, end);
      setMetrics(data);
    } catch (error) {
      handleError(error);
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const setDateRange = (range: "today" | "yesterday" | "week" | "month" | "all") => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (range) {
      case "today":
        start = new Date(now);
        end = new Date(now);
        break;
      case "yesterday":
        start = new Date(now);
        start.setDate(start.getDate() - 1);
        end = new Date(start);
        break;
      case "week":
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        end = new Date(now);
        break;
      case "month":
        start = new Date(now);
        start.setDate(start.getDate() - 30);
        end = new Date(now);
        break;
      case "all":
        start = new Date('2020-01-01');
        end = new Date(now);
        break;
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

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

  const formatCurrency = (amount: number) => `JOD ${amount.toFixed(2)}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the Meal Builder admin dashboard.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Truck className="w-4 h-4 mr-2" />
          Add Delivery Expense
        </Button>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-base">Date Range for Top Spending Customers</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setDateRange("today")}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDateRange("yesterday")}>
                Yesterday
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDateRange("week")}>
                Last 7 Days
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDateRange("month")}>
                Last 30 Days
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDateRange("all")}>
                All Time
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-[160px]"
                />
              </div>
              <span className="text-muted-foreground">to</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <Button onClick={fetchMetrics} disabled={metricsLoading}>
              {metricsLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Apply"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      {metricsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : metrics ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Retention Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {metrics.retentionRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Customers who ordered more than once
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Customers with Orders</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {metrics.customersWithOrders}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      At least 1 order (all time)
                    </p>
                  </div>
                  <UserCheck className="w-8 h-8 text-blue-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Customers with No Orders</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {metrics.customersWithNoOrders}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Registered but never ordered
                    </p>
                  </div>
                  <UserX className="w-8 h-8 text-orange-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Customers</p>
                    <p className="text-2xl font-bold">
                      {metrics.customersWithOrders + metrics.customersWithNoOrders}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      All registered customers
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-muted-foreground/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Spending Customers */}
          {metrics.topSpendingCustomers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Top 3 Spending Customers
                </CardTitle>
                <CardDescription>
                  Based on delivered orders in the selected date range
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {metrics.topSpendingCustomers.map((customer, index) => (
                    <div
                      key={customer.id}
                      className={`p-4 rounded-lg border ${
                        index === 0
                          ? "bg-yellow-50 border-yellow-200"
                          : index === 1
                          ? "bg-gray-50 border-gray-200"
                          : "bg-orange-50 border-orange-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0
                              ? "bg-yellow-500"
                              : index === 1
                              ? "bg-gray-400"
                              : "bg-orange-400"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {customer.mobileNumber}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Spent</p>
                          <p className="font-bold text-green-600">
                            {formatCurrency(customer.totalSpent)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Orders</p>
                          <p className="font-bold">{customer.orderCount}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}

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
