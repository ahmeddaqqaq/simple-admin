import React from "react";
import { Badge } from "@/components/ui/badge";
import type { SubscriptionStatus } from "@/lib/services/customer-subscriptions.service";

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus;
}

const SubscriptionStatusBadge = ({ status }: SubscriptionStatusBadgeProps) => {
  const getStatusConfig = (status: SubscriptionStatus) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return {
          label: "Pending Payment",
          variant: "default" as const,
          className: "bg-amber-500 hover:bg-amber-600",
        };
      case "PENDING_ACTIVATION":
        return {
          label: "Pending Activation",
          variant: "default" as const,
          className: "bg-yellow-500 hover:bg-yellow-600",
        };
      case "ACTIVE":
        return {
          label: "Active",
          variant: "default" as const,
          className: "bg-green-500 hover:bg-green-600",
        };
      case "EXPIRED":
        return {
          label: "Expired",
          variant: "secondary" as const,
          className: "",
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          variant: "destructive" as const,
          className: "",
        };
      default:
        return {
          label: status,
          variant: "outline" as const,
          className: "",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

export default SubscriptionStatusBadge;
