"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ordersService, customerSubscriptionsService } from "@/lib/services";
import { Order } from "@/lib/types/entities/order";
import { CustomerSubscription } from "@/lib/services/customer-subscriptions.service";
import { Volume2, VolumeX } from "lucide-react";

const NOTIFICATION_SOUND = "/notification.mp3";

const OrderNotifier = () => {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [pendingActivations, setPendingActivations] = useState<CustomerSubscription[]>([]);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isActivationsOpen, setIsActivationsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [glowColor, setGlowColor] = useState<"red" | "green">("red");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const glowIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if sound was previously enabled
  useEffect(() => {
    const wasEnabled = localStorage.getItem("soundEnabled") === "true";
    if (wasEnabled) {
      enableSound();
    }
  }, []);

  // Enable sound with user interaction (required for iOS/iPad)
  const enableSound = useCallback(async () => {
    try {
      // Create AudioContext (needed for iOS)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Resume AudioContext if suspended
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      // Create and load audio element
      if (!audioRef.current) {
        audioRef.current = new Audio(NOTIFICATION_SOUND);
        audioRef.current.preload = "auto";
        audioRef.current.load();
      }

      // Play a silent sound to unlock audio on iOS
      audioRef.current.volume = 0.01;
      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1;

      setSoundEnabled(true);
      localStorage.setItem("soundEnabled", "true");
    } catch (error) {
      console.error("Error enabling sound:", error);
    }
  }, []);

  const disableSound = useCallback(() => {
    setSoundEnabled(false);
    localStorage.setItem("soundEnabled", "false");

    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(async () => {
    if (!soundEnabled || !audioRef.current) return;

    try {
      // Resume AudioContext if suspended (can happen on iOS when tab is backgrounded)
      if (audioContextRef.current?.state === "suspended") {
        await audioContextRef.current.resume();
      }

      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1;

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Error playing sound:", error);
        });
      }
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  }, [soundEnabled]);

  // Fetch pending data
  useEffect(() => {
    const fetchPendingData = async () => {
      try {
        const [orders, activations] = await Promise.all([
          ordersService.findAll("PENDING"),
          customerSubscriptionsService.findAll("PENDING_PAYMENT"),
        ]);
        setPendingOrders(orders);
        setPendingActivations(activations);
      } catch (error) {
        if ((error as any)?.statusCode !== 429) {
          console.error("Error fetching pending data:", error);
        }
      }
    };

    // Initial fetch
    fetchPendingData();

    // Poll every 15 seconds
    const intervalId = setInterval(fetchPendingData, 15000);

    // Also refetch when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchPendingData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Handle sound and glow when pending items exist
  useEffect(() => {
    const hasPending = pendingOrders.length > 0 || pendingActivations.length > 0;

    if (hasPending && soundEnabled) {
      // Play sound immediately
      playNotificationSound();

      // Play sound every 8 seconds
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = setInterval(playNotificationSound, 8000);
    } else {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }
    }

    // Handle glow animation
    if (hasPending) {
      // Alternate glow color
      if (glowIntervalRef.current) clearInterval(glowIntervalRef.current);
      glowIntervalRef.current = setInterval(() => {
        setGlowColor((prev) => (prev === "red" ? "green" : "red"));
      }, 500);
    } else {
      if (glowIntervalRef.current) {
        clearInterval(glowIntervalRef.current);
        glowIntervalRef.current = null;
      }
    }

    return () => {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }
      if (glowIntervalRef.current) {
        clearInterval(glowIntervalRef.current);
        glowIntervalRef.current = null;
      }
    };
  }, [pendingOrders.length, pendingActivations.length, soundEnabled, playNotificationSound]);

  const hasPending = pendingOrders.length > 0 || pendingActivations.length > 0;

  return (
    <>
      {/* Full page glow overlay */}
      {hasPending && (
        <div
          className="fixed inset-0 pointer-events-none z-40 transition-all duration-300"
          style={{
            boxShadow: glowColor === "red"
              ? "inset 0 0 100px 20px rgba(239, 68, 68, 0.4), inset 0 0 200px 40px rgba(239, 68, 68, 0.2)"
              : "inset 0 0 100px 20px rgba(34, 197, 94, 0.4), inset 0 0 200px 40px rgba(34, 197, 94, 0.2)",
          }}
        />
      )}

      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-3">
        {/* Sound Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={soundEnabled ? disableSound : enableSound}
          className={`${
            soundEnabled
              ? "bg-green-500 hover:bg-green-600 text-white border-green-500"
              : "bg-gray-200 hover:bg-gray-300 text-gray-600"
          }`}
          title={soundEnabled ? "Sound enabled - Click to disable" : "Click to enable sound"}
        >
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>

        {/* Pending Orders Button */}
        <div className="relative">
          <Button
            variant="secondary"
            onClick={() => {
              setIsOrdersOpen(!isOrdersOpen);
              setIsActivationsOpen(false);
            }}
            className={`flex items-center space-x-2 bg-[#F17CAC] hover:bg-[#E5619B] text-white border-none shadow-medium ${
              pendingOrders.length > 0 ? "animate-pulse" : ""
            }`}
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
                  <p className="text-sm text-muted-foreground">No pending orders.</p>
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
                        Customer: {order.customer.firstName} {order.customer.lastName}
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
            className={`flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-medium ${
              pendingActivations.length > 0 ? "animate-pulse" : ""
            }`}
          >
            <span className="font-bold">Pending Payments</span>
            <Badge className="bg-white text-emerald-500 hover:bg-white/90 font-bold">
              {pendingActivations.length}
            </Badge>
          </Button>

          {isActivationsOpen && (
            <Card className="absolute right-0 mt-2 w-96 shadow-strong border-emerald-500/20">
              <CardHeader className="border-b border-emerald-500/10">
                <CardTitle className="text-emerald-600">Pending Payments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                {pendingActivations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending payments.</p>
                ) : (
                  pendingActivations.map((subscription) => (
                    <Link
                      key={subscription.id}
                      href={`/customer-subscriptions/${subscription.id}`}
                      className="block p-3 rounded-lg border border-transparent hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
                    >
                      <p className="font-medium text-emerald-600">{subscription.plan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Customer: {subscription.customer.firstName} {subscription.customer.lastName}
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
    </>
  );
};

export default OrderNotifier;
