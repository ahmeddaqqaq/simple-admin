"use client";

import React, { useState } from "react";
import { goldCoinsService, CustomerBalance } from "@/lib/services/gold-coins.service";
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
} from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { format } from "date-fns";

const GoldCoinsPage = () => {
  const [customerId, setCustomerId] = useState("");
  const [customerBalance, setCustomerBalance] = useState<CustomerBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [adjusting, setAdjusting] = useState(false);

  // Adjustment form state
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState("");
  const [showAdjustForm, setShowAdjustForm] = useState(false);

  const handleSearch = async () => {
    if (!customerId.trim()) {
      alert("Please enter a customer ID");
      return;
    }

    try {
      setLoading(true);
      const data = await goldCoinsService.getCustomerBalance(customerId.trim());
      setCustomerBalance(data);
      setShowAdjustForm(false);
    } catch (error) {
      handleError(error);
      setCustomerBalance(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjust = async () => {
    if (!customerBalance) return;

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
        customerId: customerBalance.customer.id,
        amount: adjustAmount,
        reason: adjustReason,
      });
      showSuccess(`Successfully adjusted balance by ${adjustAmount > 0 ? "+" : ""}${adjustAmount} coins`);

      // Refresh balance
      const data = await goldCoinsService.getCustomerBalance(customerBalance.customer.id);
      setCustomerBalance(data);

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
            <h1 className="page-title">Gold Coins Management</h1>
            <p className="page-description">
              View and adjust customer gold coin balances
            </p>
          </div>
        </div>

        {/* Search Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Search Customer</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Enter customer ID"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="w-4 h-4 mr-2" />
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Customer Balance Display */}
        {customerBalance && (
          <div className="space-y-6">
            {/* Balance Overview */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-semibold text-lg">
                        {customerBalance.customer.firstName}{" "}
                        {customerBalance.customer.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ID: {customerBalance.customer.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Coins className="w-6 h-6 text-yellow-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Current Balance</p>
                      <p className="text-3xl font-bold">{customerBalance.balance} coins</p>
                      <p className="text-sm text-muted-foreground">
                        = {customerBalance.balance} JOD
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setShowAdjustForm(!showAdjustForm)}
                  variant={showAdjustForm ? "outline" : "default"}
                >
                  {showAdjustForm ? "Cancel" : "Adjust Balance"}
                </Button>
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
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
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
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setAdjustAmount(-10)}
                      >
                        -10
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setAdjustAmount(-50)}
                      >
                        -50
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setAdjustAmount(10)}
                      >
                        +10
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setAdjustAmount(50)}
                      >
                        +50
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setAdjustAmount(100)}
                      >
                        +100
                      </Button>
                    </div>
                    {adjustAmount !== 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        New balance will be:{" "}
                        <span className="font-semibold">
                          {customerBalance.balance + adjustAmount} coins
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
                    disabled={adjusting || adjustAmount === 0 || !adjustReason.trim()}
                    className="w-full"
                  >
                    {adjusting ? "Adjusting..." : `Adjust Balance ${adjustAmount > 0 ? "+" : ""}${adjustAmount}`}
                  </Button>
                </div>
              </Card>
            )}

            {/* Recent Transactions */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Recent Transactions</h3>
              {customerBalance.recentTransactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No transactions yet
                </p>
              ) : (
                <div className="space-y-3">
                  {customerBalance.recentTransactions.map((transaction) => (
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
                            From subscription: {transaction.subscription.plan.name}
                          </p>
                        )}
                        {transaction.order && (
                          <p className="text-sm text-muted-foreground">
                            Order: {transaction.order.orderNumber}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(transaction.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xl font-bold ${
                            transaction.amount > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {transaction.amount}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Balance: {transaction.balanceAfter}
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

export default GoldCoinsPage;
