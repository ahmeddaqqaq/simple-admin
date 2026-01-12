"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CustomerSubscription,
  customerSubscriptionsService,
} from "@/lib/services/customer-subscriptions.service";
import { handleError, showSuccess } from "@/lib/utils/error-handler";
import SubscriptionStatusBadge from "@/components/SubscriptionStatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Coins,
  Calendar,
  CreditCard,
  Key,
  Clock,
  Send,
  RefreshCcw,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { format } from "date-fns";

const SubscriptionDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const subscriptionId = params.id as string;

  const [subscription, setSubscription] = useState<CustomerSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const data = await customerSubscriptionsService.findOne(subscriptionId);
      setSubscription(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subscriptionId) {
      fetchSubscription();
    }
  }, [subscriptionId]);

  const handleConfirmAndSendCode = async () => {
    if (!window.confirm("Confirm payment and send activation code to customer?"))
      return;

    try {
      await customerSubscriptionsService.confirmPaymentAndSendCode(subscriptionId);
      showSuccess("Payment confirmed and activation code sent!");
      fetchSubscription();
    } catch (error) {
      handleError(error);
    }
  };

  const handleResendCode = async () => {
    if (!window.confirm("Resend activation code to customer?"))
      return;

    try {
      await customerSubscriptionsService.resendCode(subscriptionId);
      showSuccess("Activation code resent successfully!");
      fetchSubscription();
    } catch (error) {
      handleError(error);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this subscription?"))
      return;

    try {
      await customerSubscriptionsService.cancel(subscriptionId);
      showSuccess("Subscription cancelled");
      fetchSubscription();
    } catch (error) {
      handleError(error);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-96">
          <p>Loading...</p>
        </div>
      </PageTransition>
    );
  }

  if (!subscription) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-96">
          <p>Subscription not found</p>
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
            <h1 className="text-2xl font-bold">Subscription Details</h1>
            <p className="text-muted-foreground">
              View and manage subscription
            </p>
          </div>
          <SubscriptionStatusBadge status={subscription.status} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {subscription.status === "PENDING_PAYMENT" && (
            <Button onClick={handleConfirmAndSendCode}>
              <Send className="w-4 h-4 mr-2" />
              Confirm Payment & Send Code
            </Button>
          )}

          {subscription.status === "PENDING_ACTIVATION" && (
            <Button variant="outline" onClick={handleResendCode}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Resend Activation Code
            </Button>
          )}

          {(subscription.status === "PENDING_PAYMENT" ||
            subscription.status === "PENDING_ACTIVATION") && (
            <Button variant="destructive" onClick={handleCancel}>
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Subscription
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">
                  {subscription.customer.firstName} {subscription.customer.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Mobile Number
                </p>
                <p className="font-medium">{subscription.customer.mobileNumber}</p>
              </div>
            </div>
          </Card>

          {/* Plan Information */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Coins className="w-5 h-5" />
              Plan Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Plan Name</p>
                <p className="font-medium">{subscription.plan.name}</p>
                {subscription.plan.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {subscription.plan.description}
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Gold Coins</p>
                  <p className="font-medium">{subscription.plan.coinCost} coins</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Validity</p>
                  <p className="font-medium">{subscription.plan.validityDays} days</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Information */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-medium">{subscription.paymentMethod.replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="font-medium text-lg">{subscription.pricePaid.toFixed(2)} JOD</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Coins to be Awarded</p>
                <p className="font-medium">{subscription.coinsAwarded} coins</p>
              </div>
              {subscription.paymentConfirmedAt && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Payment Confirmed
                  </p>
                  <p className="font-medium">
                    {format(new Date(subscription.paymentConfirmedAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                  {subscription.paymentConfirmedBy && (
                    <p className="text-sm text-muted-foreground">By admin</p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Timeline
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Purchased</p>
                <p className="font-medium">
                  {format(new Date(subscription.purchasedAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              {subscription.paymentConfirmedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Payment Confirmed</p>
                  <p className="font-medium">
                    {format(new Date(subscription.paymentConfirmedAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              )}
              {subscription.activatedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Activated</p>
                  <p className="font-medium">
                    {format(new Date(subscription.activatedAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              )}
              {subscription.expiresAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <p className="font-medium">
                    {format(new Date(subscription.expiresAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Activation Code Section */}
        {subscription.status === "PENDING_ACTIVATION" && subscription.activationCode && (
          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Key className="w-5 h-5" />
                Activation Code
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Code (sent via SMS)</p>
                  <p className="text-3xl font-mono font-bold tracking-wider">
                    {subscription.activationCode}
                  </p>
                </div>
                {subscription.activationCodeSentAt && (
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Sent
                    </p>
                    <p className="text-sm font-medium">
                      {format(new Date(subscription.activationCodeSentAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                )}
                {subscription.activationCodeExpiry && (
                  <div>
                    <p className="text-sm text-muted-foreground">Expires</p>
                    <p className="text-sm font-medium">
                      {format(new Date(subscription.activationCodeExpiry), "h:mm a")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Gold Coin Transactions */}
        {subscription.goldCoinTransactions && subscription.goldCoinTransactions.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Gold Coin Transactions</h2>
            <div className="space-y-2">
              {subscription.goldCoinTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-muted rounded"
                >
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                      {transaction.amount > 0 ? "+" : ""}{transaction.amount} coins
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Balance: {transaction.balanceAfter}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </PageTransition>
  );
};

export default SubscriptionDetailPage;
