"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ordersService } from "@/lib/services";
import { Order } from "@/lib/types/entities/order";

const OrderNotifier = () => {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const previousOrderCount = useRef(0);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(
        "https://freesound.org/data/previews/403/403251_5121236-lq.mp3"
      );
    }

    const fetchPendingOrders = async () => {
      try {
        const orders = await ordersService.findAll("PENDING");
        setPendingOrders(orders);

        if (orders.length > previousOrderCount.current) {
          audioRef.current
            ?.play()
            .catch((err) => console.error("Audio play failed:", err));
        }
        previousOrderCount.current = orders.length;
      } catch (error) {
        // Silently handle errors to avoid spamming console on rate limit
        if ((error as any)?.statusCode !== 429) {
          console.error("Error fetching pending orders:", error);
        }
      }
    };

    // Poll every 30 seconds instead of 5 to avoid rate limiting
    const intervalId = setInterval(fetchPendingOrders, 30000);
    fetchPendingOrders();

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-[#F17CAC] hover:bg-[#E5619B] text-white border-none shadow-medium"
      >
        <span className="font-bold">Pending Orders</span>
        <Badge className="bg-white text-[#F17CAC] hover:bg-white/90 font-bold">
          {pendingOrders.length}
        </Badge>
      </Button>

      {isOpen && (
        <Card className="absolute left-1/2 -translate-x-1/2 mt-2 w-96 shadow-strong border-[#F17CAC]/20">
          <CardHeader className="border-b border-[#F17CAC]/10">
            <CardTitle className="text-[#F17CAC]">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-80 overflow-y-auto">
            {pendingOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pending orders.
              </p>
            ) : (
              pendingOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block p-3 rounded-lg border border-transparent hover:border-[#F17CAC]/30 hover:bg-[#F17CAC]/5 transition-all"
                >
                  <p className="font-medium text-[#F17CAC]">Order #{order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    Customer: {order.customer.firstName}{" "}
                    {order.customer.lastName}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderNotifier;
