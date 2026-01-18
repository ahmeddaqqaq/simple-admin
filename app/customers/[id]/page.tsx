"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CustomerDetails,
  customersService,
} from "@/lib/services/customers.service";
import { goldCoinsService } from "@/lib/services/gold-coins.service";
import { handleError, showSuccess } from "@/lib/utils/error-handler";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Coins,
  Star,
  ShoppingCart,
  CreditCard,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { FormField } from "@/components/ui/form-field";

const CustomerDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Gold coins adjustment modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const data = await customersService.findOne(customerId);
      setCustomer(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  const handleToggleActive = async () => {
    if (!customer) return;
    try {
      await customersService.toggleActive(customer.id);
      showSuccess(
        `Customer is now ${customer.isActive ? "inactive" : "active"}`
      );
      fetchCustomer();
    } catch (error) {
      handleError(error);
    }
  };

  const handleAdjustGoldCoins = async () => {
    if (!customer || !adjustAmount || !adjustReason.trim()) return;

    try {
      setAdjustLoading(true);
      await goldCoinsService.adjustBalance({
        customerId: customer.id,
        amount: parseInt(adjustAmount, 10),
        reason: adjustReason.trim(),
      });
      showSuccess("Gold coins adjusted successfully");
      setShowAdjustModal(false);
      setAdjustAmount("");
      setAdjustReason("");
      fetchCustomer();
    } catch (error) {
      handleError(error);
    } finally {
      setAdjustLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return `JOD ${amount.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "secondary";
      case "CONFIRMED":
      case "PREPARING":
        return "default";
      case "READY":
      case "OUT_FOR_DELIVERY":
        return "default";
      case "DELIVERED":
      case "COMPLETED":
      case "ACTIVE":
        return "default";
      case "CANCELLED":
      case "EXPIRED":
      case "INACTIVE":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </PageTransition>
    );
  }

  if (!customer) {
    return (
      <PageTransition>
        <div className="text-center py-12">
          <p className="text-lg font-medium text-muted-foreground">
            Customer not found
          </p>
          <Button className="mt-4" onClick={() => router.push("/customers")}>
            Back to Customers
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">
                  {customer.firstName?.[0] || ""}
                  {customer.lastName?.[0] || ""}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {customer.firstName} {customer.lastName}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {customer.mobileNumber}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Joined {formatDate(customer.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Badge
            variant={customer.isActive ? "default" : "destructive"}
            className="cursor-pointer text-sm px-3 py-1"
            onClick={handleToggleActive}
          >
            {customer.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{customer.stats.totalOrders}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(customer.stats.totalSpent)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Subscriptions</p>
                  <p className="text-2xl font-bold">{customer._count.subscriptions}</p>
                </div>
                <CreditCard className="w-8 h-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Loyalty Points</p>
                  <p className="text-2xl font-bold">{customer.points}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setShowAdjustModal(true)}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gold Coins</p>
                  <p className="text-2xl font-bold">{customer.goldCoins}</p>
                </div>
                <Coins className="w-8 h-8 text-amber-500/50" />
              </div>
              <p className="text-xs text-primary mt-2">Click to adjust</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Recent Orders
              </CardTitle>
              <CardDescription>
                Last {customer.orders.length} orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customer.orders.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No orders yet
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.orders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/orders/${order.id}`)}
                      >
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(order.status) as any}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(order.total)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Subscriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscriptions
              </CardTitle>
              <CardDescription>
                Last {customer.subscriptions.length} subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customer.subscriptions.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No subscriptions yet
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.subscriptions.map((sub) => (
                      <TableRow
                        key={sub.id}
                        className="cursor-pointer"
                        onClick={() =>
                          router.push(`/customer-subscriptions/${sub.id}`)
                        }
                      >
                        <TableCell className="font-medium">
                          {sub.plan.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(sub.status) as any}>
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(sub.plan.price)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(sub.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Points Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Points History
              </CardTitle>
              <CardDescription>
                Last {customer.pointsTransactions.length} transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customer.pointsTransactions.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No points transactions yet
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.pointsTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <Badge
                            variant={
                              tx.type === "EARNED"
                                ? "default"
                                : tx.type === "REDEEMED"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              tx.amount > 0 ? "text-green-600" : "text-red-600"
                            }
                          >
                            {tx.amount > 0 ? (
                              <TrendingUp className="w-4 h-4 inline mr-1" />
                            ) : (
                              <TrendingDown className="w-4 h-4 inline mr-1" />
                            )}
                            {tx.amount > 0 ? "+" : ""}
                            {tx.amount}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                          {tx.description}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(tx.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Gold Coins Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                Gold Coins History
              </CardTitle>
              <CardDescription>
                Last {customer.goldCoinTransactions.length} transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customer.goldCoinTransactions.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No gold coin transactions yet
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.goldCoinTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <Badge
                            variant={
                              tx.type === "EARNED"
                                ? "default"
                                : tx.type === "SPENT"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              tx.amount > 0 ? "text-green-600" : "text-red-600"
                            }
                          >
                            {tx.amount > 0 ? "+" : ""}
                            {tx.amount}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {tx.balanceBefore} → {tx.balanceAfter}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(tx.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Locations */}
        {customer.locations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Saved Locations
              </CardTitle>
              <CardDescription>
                {customer.locations.length} saved delivery locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customer.locations.map((location) => (
                  <div
                    key={location.id}
                    className="p-4 border rounded-lg bg-muted/30"
                  >
                    <p className="font-medium">{location.nickname}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Adjust Gold Coins Modal */}
        {showAdjustModal && (
          <Modal
            open={showAdjustModal}
            onClose={() => {
              setShowAdjustModal(false);
              setAdjustAmount("");
              setAdjustReason("");
            }}
            title="Adjust Gold Coins"
          >
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Current balance: <span className="font-bold">{customer.goldCoins}</span> gold coins
              </p>

              <FormField label="Amount (positive to add, negative to subtract)" required>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setAdjustAmount((prev) => {
                        const val = parseInt(prev || "0", 10);
                        return String(val - 10);
                      })
                    }
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    placeholder="e.g., 50 or -20"
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setAdjustAmount((prev) => {
                        const val = parseInt(prev || "0", 10);
                        return String(val + 10);
                      })
                    }
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </FormField>

              <FormField label="Reason" required>
                <Input
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g., Compensation for late delivery"
                />
              </FormField>

              {adjustAmount && (
                <p className="text-sm">
                  New balance will be:{" "}
                  <span className="font-bold">
                    {customer.goldCoins + parseInt(adjustAmount || "0", 10)}
                  </span>{" "}
                  gold coins
                </p>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowAdjustModal(false);
                    setAdjustAmount("");
                    setAdjustReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAdjustGoldCoins}
                  disabled={!adjustAmount || !adjustReason.trim() || adjustLoading}
                >
                  {adjustLoading ? "Adjusting..." : "Adjust Balance"}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </PageTransition>
  );
};

export default CustomerDetailPage;
