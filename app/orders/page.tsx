"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Order, OrderStatus } from "@/lib/types/entities/order";
import { ordersService } from "@/lib/services";
import { handleError } from "@/lib/utils/error-handler";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Calendar, X } from "lucide-react";
import { PageTransition } from "@/components/page-transition";

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersService.findAll(
        status || undefined,
        selectedDate || undefined
      );
      setOrders(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status, selectedDate]);

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
      key: "orderNumber",
      header: "Order",
      render: (order: Order) => (
        <span className="font-medium">#{order.orderNumber || order.id.slice(0, 8)}</span>
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
      key: "createdAt",
      header: "Date",
      render: (order: Order) => {
        const date = new Date(order.createdAt);
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString()}</div>
            <div className="text-muted-foreground text-xs">
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        );
      },
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
      render: (order: Order) => `JOD ${(order.total || 0).toFixed(2)}`,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      render: (order: Order) => (
        <Link href={`/orders/${order.id}`}>
          <Button variant="ghost" size="icon">
            <Eye className="w-4 h-4" />
          </Button>
        </Link>
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
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Orders</h1>
            <p className="page-description">View and manage customer orders</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10 w-44"
                />
              </div>
              {selectedDate && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedDate("")}
                  className="h-10 w-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Status Filter */}
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
