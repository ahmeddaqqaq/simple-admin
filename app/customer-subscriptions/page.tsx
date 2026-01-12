"use client";

import React, { useEffect, useState } from "react";
import {
  CustomerSubscription,
  SubscriptionStatus,
  customerSubscriptionsService,
} from "@/lib/services/customer-subscriptions.service";
import { handleError, showSuccess } from "@/lib/utils/error-handler";
import SubscriptionStatusBadge from "@/components/SubscriptionStatusBadge";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Send,
  RefreshCcw,
  XCircle,
  User,
  Calendar,
  Coins,
  CreditCard,
} from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { format } from "date-fns";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CustomerSubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<CustomerSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "ALL">("ALL");

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await customerSubscriptionsService.findAll();
      setSubscriptions(data);
      applyFilter(data, statusFilter);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const applyFilter = (data: CustomerSubscription[], status: SubscriptionStatus | "ALL") => {
    if (status === "ALL") {
      setFilteredSubscriptions(data);
    } else {
      setFilteredSubscriptions(data.filter((sub) => sub.status === status));
    }
  };

  useEffect(() => {
    applyFilter(subscriptions, statusFilter);
  }, [statusFilter, subscriptions]);

  const handleConfirmAndSendCode = async (id: string) => {
    if (!window.confirm("Confirm payment and send activation code to customer?"))
      return;

    try {
      await customerSubscriptionsService.confirmPaymentAndSendCode(id);
      showSuccess("Payment confirmed and activation code sent!");
      fetchSubscriptions();
    } catch (error) {
      handleError(error);
    }
  };

  const handleResendCode = async (id: string) => {
    if (!window.confirm("Resend activation code to customer?"))
      return;

    try {
      await customerSubscriptionsService.resendCode(id);
      showSuccess("Activation code resent successfully!");
      fetchSubscriptions();
    } catch (error) {
      handleError(error);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this subscription?"))
      return;

    try {
      await customerSubscriptionsService.cancel(id);
      showSuccess("Subscription cancelled");
      fetchSubscriptions();
    } catch (error) {
      handleError(error);
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "CASH_ON_DELIVERY":
        return <Badge variant="outline">Cash</Badge>;
      case "VISA_ON_DELIVERY":
        return <Badge variant="outline">Visa</Badge>;
      case "CLIQ":
        return <Badge variant="outline">Cliq</Badge>;
      case "GOLD_COINS":
        return <Badge variant="default">Gold Coins</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  const columns = [
    {
      key: "customer",
      header: "Customer",
      render: (sub: CustomerSubscription) => (
        <div className="flex items-start gap-2">
          <User className="w-4 h-4 text-gray-500 mt-0.5" />
          <div>
            <p className="font-medium">
              {sub.customer.firstName} {sub.customer.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{sub.customer.mobileNumber}</p>
          </div>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      render: (sub: CustomerSubscription) => (
        <div>
          <p className="font-medium">{sub.plan.name}</p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Coins className="w-3 h-3" />
            <span>{sub.plan.coinCost} coins</span>
            <span>•</span>
            <span>{sub.plan.validityDays} days</span>
          </div>
        </div>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      render: (sub: CustomerSubscription) => (
        <div className="space-y-1">
          {getPaymentMethodBadge(sub.paymentMethod)}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <CreditCard className="w-3 h-3" />
            <span>{sub.pricePaid.toFixed(2)} JOD</span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (sub: CustomerSubscription) => (
        <SubscriptionStatusBadge status={sub.status} />
      ),
    },
    {
      key: "dates",
      header: "Dates",
      render: (sub: CustomerSubscription) => (
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Purchased: {format(new Date(sub.purchasedAt), "MMM d, yyyy")}</span>
          </div>
          {sub.activatedAt && (
            <div className="text-green-600">
              Activated: {format(new Date(sub.activatedAt), "MMM d, yyyy")}
            </div>
          )}
          {sub.expiresAt && (
            <div className="text-orange-600">
              Expires: {format(new Date(sub.expiresAt), "MMM d, yyyy")}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      render: (sub: CustomerSubscription) => (
        <div className="flex items-center gap-2 justify-end">
          <Link href={`/customer-subscriptions/${sub.id}`}>
            <Button variant="ghost" size="icon" title="View Details">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>

          {sub.status === "PENDING_PAYMENT" && (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleConfirmAndSendCode(sub.id)}
              title="Confirm Payment & Send Code"
            >
              <Send className="w-4 h-4 mr-1" />
              Activate
            </Button>
          )}

          {sub.status === "PENDING_ACTIVATION" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResendCode(sub.id)}
              title="Resend Code"
            >
              <RefreshCcw className="w-4 h-4 mr-1" />
              Resend
            </Button>
          )}

          {(sub.status === "PENDING_PAYMENT" || sub.status === "PENDING_ACTIVATION") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCancel(sub.id)}
              title="Cancel"
            >
              <XCircle className="w-4 h-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Count subscriptions by status
  const statusCounts = {
    all: subscriptions.length,
    pendingPayment: subscriptions.filter((s) => s.status === "PENDING_PAYMENT").length,
    pendingActivation: subscriptions.filter((s) => s.status === "PENDING_ACTIVATION").length,
    active: subscriptions.filter((s) => s.status === "ACTIVE").length,
    expired: subscriptions.filter((s) => s.status === "EXPIRED").length,
    cancelled: subscriptions.filter((s) => s.status === "CANCELLED").length,
  };

  return (
    <PageTransition>
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Customer Subscriptions</h1>
            <p className="page-description">
              Manage customer subscriptions and activation codes
            </p>
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex items-center gap-4">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as SubscriptionStatus | "ALL")}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All ({statusCounts.all})</SelectItem>
              <SelectItem value="PENDING_PAYMENT">
                Pending Payment ({statusCounts.pendingPayment})
              </SelectItem>
              <SelectItem value="PENDING_ACTIVATION">
                Pending Activation ({statusCounts.pendingActivation})
              </SelectItem>
              <SelectItem value="ACTIVE">Active ({statusCounts.active})</SelectItem>
              <SelectItem value="EXPIRED">Expired ({statusCounts.expired})</SelectItem>
              <SelectItem value="CANCELLED">Cancelled ({statusCounts.cancelled})</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Summary Cards */}
          <div className="flex gap-2 text-sm">
            {statusCounts.pendingPayment > 0 && (
              <Badge variant="default" className="bg-amber-500">
                {statusCounts.pendingPayment} Pending Payment
              </Badge>
            )}
            {statusCounts.pendingActivation > 0 && (
              <Badge variant="default" className="bg-yellow-500">
                {statusCounts.pendingActivation} Pending Activation
              </Badge>
            )}
          </div>
        </div>

        <DataTable
          title={`Subscriptions (${filteredSubscriptions.length})`}
          data={filteredSubscriptions}
          columns={columns}
          loading={loading}
          emptyMessage="No subscriptions found"
          emptyDescription="Customer subscriptions will appear here"
          getRowKey={(sub) => sub.id}
          getRowClassName={(sub) =>
            sub.status === "PENDING_PAYMENT"
              ? "bg-amber-50 hover:bg-amber-100"
              : sub.status === "PENDING_ACTIVATION"
              ? "bg-yellow-50 hover:bg-yellow-100"
              : ""
          }
        />
      </div>
    </PageTransition>
  );
};

export default CustomerSubscriptionsPage;
