"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ordersService, customerSubscriptionsService } from "@/lib/services";
import { Order } from "@/lib/types/entities/order";
import { CustomerSubscription } from "@/lib/services/customer-subscriptions.service";

const OrderNotifier = () => {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [pendingActivations, setPendingActivations] = useState<CustomerSubscription[]>([]);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isActivationsOpen, setIsActivationsOpen] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to play notification beep using Web Audio API
  const playNotificationBeep = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;

      // Resume audio context if suspended (required after user interaction in modern browsers)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Create a pleasant notification sound (two-tone beep)
      oscillator.frequency.value = 800; // First tone
      gainNode.gain.value = 0.3;

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);

      // Second tone
      const oscillator2 = ctx.createOscillator();
      const gainNode2 = ctx.createGain();
      oscillator2.connect(gainNode2);
      gainNode2.connect(ctx.destination);
      oscillator2.frequency.value = 1000;
      gainNode2.gain.value = 0.3;
      oscillator2.start(ctx.currentTime + 0.15);
      oscillator2.stop(ctx.currentTime + 0.25);
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      // Remove listeners after first interaction
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };

    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, []);

  useEffect(() => {
    const fetchPendingData = async () => {
      try {
        // Fetch both pending orders and pending activations in parallel
        const [orders, activations] = await Promise.all([
          ordersService.findAll("PENDING"),
          customerSubscriptionsService.findAll("PENDING_ACTIVATION"),
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

  // Separate effect to handle sound playing based on pending orders OR pending activations
  useEffect(() => {
    const hasPending = pendingOrders.length > 0 || pendingActivations.length > 0;

    if (hasPending) {
      // Start playing sound every 10 seconds if there are pending items
      const playSound = () => {
        playNotificationBeep();
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
          onClick={async () => {
            // Unlock audio on click
            if (audioContextRef.current?.state === 'suspended') {
              await audioContextRef.current.resume();
            }
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
                    <p className="font-medium text-[#F17CAC]">Order #{order.orderNumber || order.id.slice(0, 8)}</p>
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

      {/* Pending Activations Button */}
      <div className="relative">
        <Button
          variant="secondary"
          onClick={async () => {
            // Unlock audio on click
            if (audioContextRef.current?.state === 'suspended') {
              await audioContextRef.current.resume();
            }
            setIsActivationsOpen(!isActivationsOpen);
            setIsOrdersOpen(false);
          }}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-medium"
        >
          <span className="font-bold">Pending Activations</span>
          <Badge className="bg-white text-emerald-500 hover:bg-white/90 font-bold">
            {pendingActivations.length}
          </Badge>
        </Button>

        {isActivationsOpen && (
          <Card className="absolute right-0 mt-2 w-96 shadow-strong border-emerald-500/20">
            <CardHeader className="border-b border-emerald-500/10">
              <CardTitle className="text-emerald-600">Pending Activations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-80 overflow-y-auto">
              {pendingActivations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No pending activations.
                </p>
              ) : (
                pendingActivations.map((subscription) => (
                  <Link
                    key={subscription.id}
                    href={`/customer-subscriptions/${subscription.id}`}
                    className="block p-3 rounded-lg border border-transparent hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
                  >
                    <p className="font-medium text-emerald-600">{subscription.plan.name}</p>
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
