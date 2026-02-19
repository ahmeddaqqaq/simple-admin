"use client";

import React, { useState, useEffect } from "react";
import {
  goldCoinsService,
  CustomerBalance,
  Subscriber,
} from "@/lib/services/gold-coins.service";
import { handleError, showSuccess } from "@/lib/utils/error-handler";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Coins,
  User,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Loader2,
} from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

const SubscribersListPage = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Selected customer for detail/adjust view
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerBalance | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState("");
  const [showAdjustForm, setShowAdjustForm] = useState(false);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const data = await goldCoinsService.getSubscribersList();
      setSubscribers(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const filteredSubscribers = subscribers.filter((sub) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      sub.firstName.toLowerCase().includes(query) ||
      sub.lastName.toLowerCase().includes(query) ||
      sub.mobileNumber.includes(query)
    );
  });

  const handleViewCustomer = async (customerId: string) => {
    try {
      setDetailLoading(true);
      const data = await goldCoinsService.getCustomerBalance(customerId);
      setSelectedCustomer(data);
      setShowAdjustForm(false);
    } catch (error) {
      handleError(error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAdjust = async () => {
    if (!selectedCustomer) return;

    if (adjustAmount === 0) {
      alert("Adjustment amount cannot be zero");
      return;
    }

    if (!adjustReason.trim()) {
      alert("Please provide a reason for the adjustment");
      return;
    }

    try {
      setAdjusting(true);
      await goldCoinsService.adjustBalance({
        customerId: selectedCustomer.customer.id,
        amount: adjustAmount,
        reason: adjustReason,
      });
      showSuccess(
        `Successfully adjusted balance by ${adjustAmount > 0 ? "+" : ""}${adjustAmount} coins`
      );

      // Refresh balance and subscribers list
      const [data] = await Promise.all([
        goldCoinsService.getCustomerBalance(selectedCustomer.customer.id),
        fetchSubscribers(),
      ]);
      setSelectedCustomer(data);

      // Reset form
      setAdjustAmount(0);
      setAdjustReason("");
      setShowAdjustForm(false);
    } catch (error) {
      handleError(error);
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Users className="w-8 h-8" />
              Subscribers List
            </h1>
            <p className="page-description">
              View all subscribers and their remaining gold coins
            </p>
          </div>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or mobile number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </Card>

        {/* Subscribers Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead className="text-center">Subscriptions</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead className="text-right">Total Paid</TableHead>
                  <TableHead className="text-right">Gold Coins</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {searchQuery
                        ? "No subscribers match your search"
                        : "No subscribers found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscribers.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">
                        {sub.firstName} {sub.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sub.mobileNumber}
                      </TableCell>
                      <TableCell className="text-center">
                        {sub.totalSubscriptions}
                      </TableCell>
                      <TableCell className="text-center">
                        {sub.activeSubscriptions > 0 ? (
                          <Badge variant="default" className="bg-green-600">
                            {sub.activeSubscriptions}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">0</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        JOD {sub.totalPaid.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Coins className="w-4 h-4 text-yellow-500" />
                          <span className="font-bold">
                            {sub.goldCoins.toFixed(2)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewCustomer(sub.id)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Customer Detail Modal */}
        {detailLoading && (
          <Card className="p-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          </Card>
        )}

        {selectedCustomer && !detailLoading && (
          <div className="space-y-6">
            {/* Balance Overview */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-semibold text-lg">
                        {selectedCustomer.customer.firstName}{" "}
                        {selectedCustomer.customer.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ID: {selectedCustomer.customer.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Coins className="w-6 h-6 text-yellow-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Current Balance
                      </p>
                      <p className="text-3xl font-bold">
                        {selectedCustomer.balance.toFixed(2)} coins
                      </p>
                      <p className="text-sm text-muted-foreground">
                        = {selectedCustomer.balance.toFixed(2)} JOD
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => setShowAdjustForm(!showAdjustForm)}
                    variant={showAdjustForm ? "outline" : "default"}
                  >
                    {showAdjustForm ? "Cancel" : "Adjust Balance"}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Adjustment Form */}
            {showAdjustForm && (
              <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="font-semibold mb-4">Adjust Balance</h3>
                <div className="space-y-4">
                  <FormField label="Adjustment Amount" required>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAdjustAmount(adjustAmount - 10)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        step="0.01"
                        value={adjustAmount}
                        onChange={(e) =>
                          setAdjustAmount(parseFloat(e.target.value) || 0)
                        }
                        className="flex-1 text-center text-lg font-semibold"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAdjustAmount(adjustAmount + 10)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {[-10, -50, 10, 50, 100].map((val) => (
                        <Button
                          key={val}
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => setAdjustAmount(val)}
                        >
                          {val > 0 ? "+" : ""}
                          {val}
                        </Button>
                      ))}
                    </div>
                    {adjustAmount !== 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        New balance will be:{" "}
                        <span className="font-semibold">
                          {(selectedCustomer.balance + adjustAmount).toFixed(2)}{" "}
                          coins
                        </span>
                      </p>
                    )}
                  </FormField>

                  <FormField label="Reason" required>
                    <Textarea
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                      placeholder="Enter reason for adjustment (e.g., Compensation for service issue)"
                      rows={3}
                    />
                  </FormField>

                  <Button
                    onClick={handleAdjust}
                    disabled={
                      adjusting || adjustAmount === 0 || !adjustReason.trim()
                    }
                    className="w-full"
                  >
                    {adjusting
                      ? "Adjusting..."
                      : `Adjust Balance ${adjustAmount > 0 ? "+" : ""}${adjustAmount}`}
                  </Button>
                </div>
              </Card>
            )}

            {/* Recent Transactions */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Recent Transactions</h3>
              {selectedCustomer.recentTransactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No transactions yet
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedCustomer.recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-start justify-between p-4 bg-muted rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {transaction.amount > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <Badge
                            variant={
                              transaction.type === "EARNED"
                                ? "default"
                                : transaction.type === "SPENT"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {transaction.type}
                          </Badge>
                        </div>
                        <p className="font-medium">{transaction.description}</p>
                        {transaction.subscription && (
                          <p className="text-sm text-muted-foreground">
                            From subscription:{" "}
                            {transaction.subscription.plan.name}
                          </p>
                        )}
                        {transaction.order && (
                          <p className="text-sm text-muted-foreground">
                            Order: {transaction.order.orderNumber}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          {format(
                            new Date(transaction.createdAt),
                            "MMM d, yyyy 'at' h:mm a"
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xl font-bold ${
                            transaction.amount > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Balance: {transaction.balanceAfter.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default SubscribersListPage;
