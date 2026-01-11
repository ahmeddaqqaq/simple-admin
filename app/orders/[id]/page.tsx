"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Order, OrderStatus } from "@/lib/types/entities/order";
import { ordersService } from "@/lib/services";
import { handleError, showSuccess } from "@/lib/utils/error-handler";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/page-transition";
import { ThermalPrinter } from "@/lib/utils/thermal-printer";
import { Printer } from "lucide-react";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [printerConnected, setPrinterConnected] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await ordersService.findOne(id as string);
      setOrder(data);
      setStatus(data.status);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!id || !status) return;
    try {
      setUpdating(true);
      await ordersService.updateStatus(id as string, status);
      showSuccess("Order status updated successfully");
      fetchOrder();
    } catch (error) {
      handleError(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleConnectPrinter = async (): Promise<boolean> => {
    try {
      const printerDevice = await ThermalPrinter.connect();
      setPrinterConnected(true);
      showSuccess(`Printer connected: ${printerDevice.device.name || 'Unknown'}`);
      return true;
    } catch (error) {
      handleError(error);
      setPrinterConnected(false);
      return false;
    }
  };

  const handlePrintReceipt = async () => {
    if (!order) return;

    try {
      setPrinting(true);

      // Check if Web Bluetooth is available
      if (!ThermalPrinter.isBluetoothAvailable()) {
        throw new Error(
          'Web Bluetooth is not supported in this browser. ' +
          'Please use Chrome, Edge, or Opera. ' +
          'In Chrome/Edge, you may need to enable: chrome://flags/#enable-web-bluetooth'
        );
      }

      // Check if printer is connected
      if (!ThermalPrinter.isConnected()) {
        const connected = await handleConnectPrinter();
        if (!connected) {
          throw new Error('Failed to connect to printer. Please check Bluetooth is enabled and printer is powered on.');
        }
      }

      // Prepare items data
      const items = order.items?.map((item: any) => {
        const itemName = item.customMeal?.name ||
                        item.smoothie?.name ||
                        item.readyItem?.name ||
                        "Meal";

        const ingredients = item.customMeal?.ingredients || item.smoothie?.ingredients;
        const formattedIngredients = ingredients?.map((ing: any) => ({
          name: ing.ingredient?.name || "Unknown",
          plusCount: ing.plusCount || 0,
        }));

        return {
          name: itemName,
          quantity: item.quantity || 0,
          price: item.price || 0,
          ingredients: formattedIngredients,
        };
      }) || [];

      // Get location coordinates if available
      const location = (order as any).location;
      const latitude = location?.latitude;
      const longitude = location?.longitude;

      // Calculate total with delivery fee
      const deliveryFee = 1.00;
      const totalWithDelivery = (order.total || 0) + deliveryFee;

      // Generate receipt
      const receiptData = await ThermalPrinter.generateReceipt({
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        items,
        subtotal: order.subtotal || 0,
        quantityDiscount: (order as any).quantityDiscount || 0,
        itemCount: order.items?.length || 0,
        promoDiscount: (order as any).promoDiscount || 0,
        discount: (order as any).discount || 0,
        deliveryFee: deliveryFee,
        total: totalWithDelivery,
        orderNumber: order.id.slice(0, 8),
        latitude,
        longitude,
      });

      // Print
      await ThermalPrinter.print(receiptData);
      showSuccess("Receipt printed successfully");
    } catch (error) {
      handleError(error);
    } finally {
      setPrinting(false);
    }
  };

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

  const orderStatuses: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "IN_PROGRESS",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ];

  if (loading || !order) {
    return (
      <PageTransition>
        <div className="page-container">
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-24 mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="page-container">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="page-title">Order #{order.id.slice(0, 8)}</h1>
            <p className="page-description">
              View order details and manage status
            </p>
          </div>
          <Button
            onClick={handlePrintReceipt}
            loading={printing}
            disabled={printing}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            {printing ? "Printing..." : "Print Receipt"}
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">
                {order.customer.firstName} {order.customer.lastName}
              </p>
              <p className="text-muted-foreground">
                {order.customer.mobileNumber}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant={getStatusVariant(order.status)}>
                {order.status}
              </Badge>

              <div className="flex items-center gap-3">
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as OrderStatus)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleStatusUpdate}
                  loading={updating}
                  disabled={status === order.status}
                >
                  {updating ? "Updating..." : "Update"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Order Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Item</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item: any) => {
                      // Get item name based on type
                      const itemName = item.customMeal?.name ||
                                     item.smoothie?.name ||
                                     item.readyItem?.name ||
                                     "Unknown Item";

                      // Check if item has ingredients (custom meal or smoothie)
                      const ingredients = item.customMeal?.ingredients || item.smoothie?.ingredients;

                      return (
                        <React.Fragment key={item.id}>
                          <tr className="border-t hover:bg-muted/50 transition-colors duration-150">
                            <td className="px-4 py-3">
                              <div className="font-medium">{itemName}</div>
                              {ingredients && ingredients.length > 0 && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  <div className="font-medium mb-1">Ingredients:</div>
                                  <ul className="list-disc list-inside space-y-0.5">
                                    {ingredients.map((ing: any, idx: number) => (
                                      <li key={idx}>
                                        {ing.ingredient?.name || "Unknown"}
                                        {ing.plusCount > 0 && (
                                          <span className="ml-1 text-primary">
                                            (+{ing.plusCount})
                                          </span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">{item.quantity || 0}</td>
                            <td className="px-4 py-3">JOD {(item.price || 0).toFixed(2)}</td>
                          </tr>
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                        No items in this order
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>JOD {(order.subtotal || 0).toFixed(2)}</span>
            </div>
            {(order as any).quantityDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="text-muted-foreground">Quantity Discount ({order.items?.length || 0} items)</span>
                <span>- JOD {((order as any).quantityDiscount || 0).toFixed(2)}</span>
              </div>
            )}
            {(order as any).promoDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="text-muted-foreground">Promo Code Discount</span>
                <span>- JOD {((order as any).promoDiscount || 0).toFixed(2)}</span>
              </div>
            )}
            {(order as any).discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="text-muted-foreground">Points Discount</span>
                <span>- JOD {((order as any).discount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>JOD 1.00</span>
            </div>
            <div className="border-t border-border pt-2 mt-2"></div>
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>JOD {(order.total || 0).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default OrderDetailsPage;
