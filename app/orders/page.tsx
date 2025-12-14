"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Order, OrderStatus } from "@/lib/types/entities/order";
import { ordersService } from "@/lib/services";
import { handleError } from "@/lib/utils/error-handler";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye } from "lucide-react";
import { PageTransition } from "@/components/page-transition";

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersService.findAll(status || undefined);
      setOrders(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status]);

  const getStatusVariant = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "secondary" as const;
      case "CONFIRMED":
        return "default" as const;
      case "PREPARING":
        return "default" as const;
      case "IN_PROGRESS":
        return "default" as const;
      case "OUT_FOR_DELIVERY":
        return "default" as const;
      case "DELIVERED":
        return "outline" as const;
      case "CANCELLED":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };

  const columns = [
    {
      key: "id",
      header: "Order",
      render: (order: Order) => (
        <span className="font-medium">#{order.id.slice(0, 8)}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (order: Order) => (
        <span>
          {order.customer.firstName} {order.customer.lastName}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (order: Order) => (
        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (order: Order) => `$${order.total.toFixed(2)}`,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      render: (order: Order) => (
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/orders/${order.id}`}>
            <Eye className="w-4 h-4" />
          </Link>
        </Button>
      ),
    },
  ];

  const orderStatuses: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "IN_PROGRESS",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ];

  return (
    <PageTransition>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Orders</h1>
            <p className="page-description">View and manage customer orders</p>
          </div>

          <Select
            value={status || undefined}
            onValueChange={(value) => {
              if (value === "ALL") {
                setStatus("");
              } else {
                setStatus(value as OrderStatus);
              }
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {orderStatuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DataTable
          title="All Orders"
          data={orders}
          columns={columns}
          loading={loading}
          emptyMessage="No orders found"
          emptyDescription="Orders will appear here as customers place them"
          getRowKey={(order) => order.id}
        />
      </div>
    </PageTransition>
  );
};

export default OrdersPage;
