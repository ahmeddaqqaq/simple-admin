"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ordersService, customerSubscriptionsService } from "@/lib/services";
import { Order } from "@/lib/types/entities/order";
import { CustomerSubscription } from "@/lib/services/customer-subscriptions.service";

// Custom notification sound file - place your audio file in /public folder
const NOTIFICATION_SOUND = "/notification.mp3";

const OrderNotifier = () => {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [pendingActivations, setPendingActivations] = useState<
    CustomerSubscription[]
  >([]);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isActivationsOpen, setIsActivationsOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND);
    audioRef.current.preload = "auto";

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Function to play custom notification sound
  const playNotificationSound = async () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };

  useEffect(() => {
    const fetchPendingData = async () => {
      try {
        // Fetch both pending orders and pending activations in parallel
        const [orders, activations] = await Promise.all([
          ordersService.findAll("PENDING"),
          customerSubscriptionsService.findAll("PENDING_PAYMENT"),
        ]);
        setPendingOrders(orders);
        setPendingActivations(activations);
      } catch (error) {
        // Silently handle errors to avoid spamming console on rate limit
        if ((error as any)?.statusCode !== 429) {
          console.error("Error fetching pending data:", error);
        }
      }
    };

    // Poll every 30 seconds instead of 5 to avoid rate limiting
    const intervalId = setInterval(fetchPendingData, 30000);
    fetchPendingData();

    return () => {
      clearInterval(intervalId);
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    };
  }, []);

  // Separate effect to handle sound playing based on pending orders OR pending payments
  useEffect(() => {
    const hasPending =
      pendingOrders.length > 0 || pendingActivations.length > 0;

    if (hasPending) {
      // Start playing sound every 10 seconds if there are pending items
      const playSound = () => {
        playNotificationSound();
      };

      // Play immediately
      playSound();

      // Then play every 10 seconds
      audioIntervalRef.current = setInterval(playSound, 10000);
    } else {
      // Stop playing sound if no pending items
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }
    }

    return () => {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }
    };
  }, [pendingOrders.length, pendingActivations.length]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-3">
      {/* Pending Orders Button */}
      <div className="relative">
        <Button
          variant="secondary"
          onClick={() => {
            setIsOrdersOpen(!isOrdersOpen);
            setIsActivationsOpen(false);
          }}
          className="flex items-center space-x-2 bg-[#F17CAC] hover:bg-[#E5619B] text-white border-none shadow-medium"
        >
          <span className="font-bold">Pending Orders</span>
          <Badge className="bg-white text-[#F17CAC] hover:bg-white/90 font-bold">
            {pendingOrders.length}
          </Badge>
        </Button>

        {isOrdersOpen && (
          <Card className="absolute left-0 mt-2 w-96 shadow-strong border-[#F17CAC]/20">
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
                    <p className="font-medium text-[#F17CAC]">
                      Order #{order.orderNumber || order.id.slice(0, 8)}
                    </p>
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

      {/* Pending Payments Button */}
      <div className="relative">
        <Button
          variant="secondary"
          onClick={() => {
            setIsActivationsOpen(!isActivationsOpen);
            setIsOrdersOpen(false);
          }}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-medium"
        >
          <span className="font-bold">Pending Payments</span>
          <Badge className="bg-white text-emerald-500 hover:bg-white/90 font-bold">
            {pendingActivations.length}
          </Badge>
        </Button>

        {isActivationsOpen && (
          <Card className="absolute right-0 mt-2 w-96 shadow-strong border-emerald-500/20">
            <CardHeader className="border-b border-emerald-500/10">
              <CardTitle className="text-emerald-600">
                Pending Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-80 overflow-y-auto">
              {pendingActivations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No pending payments.
                </p>
              ) : (
                pendingActivations.map((subscription) => (
                  <Link
                    key={subscription.id}
                    href={`/customer-subscriptions/${subscription.id}`}
                    className="block p-3 rounded-lg border border-transparent hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
                  >
                    <p className="font-medium text-emerald-600">
                      {subscription.plan.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Customer: {subscription.customer.firstName}{" "}
                      {subscription.customer.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {subscription.customer.mobileNumber}
                    </p>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrderNotifier;
