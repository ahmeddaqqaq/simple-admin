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
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to play notification beep using Web Audio API
  const playNotificationBeep = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
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

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const orders = await ordersService.findAll("PENDING");
        setPendingOrders(orders);
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

    return () => {
      clearInterval(intervalId);
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    };
  }, []);

  // Separate effect to handle sound playing based on pending orders
  useEffect(() => {
    if (pendingOrders.length > 0) {
      // Start playing sound every 10 seconds if there are pending orders
      const playSound = () => {
        playNotificationBeep();
      };

      // Play immediately
      playSound();

      // Then play every 10 seconds
      audioIntervalRef.current = setInterval(playSound, 10000);
    } else {
      // Stop playing sound if no pending orders
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
  }, [pendingOrders.length]);

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
