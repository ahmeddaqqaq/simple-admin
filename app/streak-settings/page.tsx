"use client";

import React, { useEffect, useState } from "react";
import {
  streakService,
  StreakConfig,
} from "@/lib/services/streak.service";
import { handleError, showSuccess } from "@/lib/utils/error-handler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/ui/form-field";
import { PageTransition } from "@/components/page-transition";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Flame, Coins } from "lucide-react";

const StreakSettingsPage = () => {
  const [config, setConfig] = useState<StreakConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable form state
  const [requiredDaysPerWeek, setRequiredDaysPerWeek] = useState(6);
  const [goldCoinReward, setGoldCoinReward] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await streakService.getConfig();
      setConfig(data);
      setRequiredDaysPerWeek(data.requiredDaysPerWeek);
      setGoldCoinReward(data.goldCoinReward);
      setIsActive(data.isActive);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await streakService.updateConfig({
        requiredDaysPerWeek,
        goldCoinReward,
        isActive,
      });
      showSuccess("Streak settings saved successfully");
      fetchConfig();
    } catch (error) {
      handleError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Streak Settings</h1>
            <p className="page-description">
              Configure the weekly order streak reward system
            </p>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="pt-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Current Status Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Current Config
                </CardTitle>
                <CardDescription>Live streak configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={config?.isActive ? "default" : "secondary"}>
                    {config?.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Required Days / Week</span>
                  <Badge variant="outline">{config?.requiredDaysPerWeek ?? "—"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Gold Coin Reward</span>
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold">{config?.goldCoinReward ?? "—"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Form Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Edit Configuration</CardTitle>
                <CardDescription>
                  Customers earn gold coins when they order the required number of
                  days in a single week. Rewards are given once per week.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-6">
                  <FormField label="Required Days Per Week">
                    <Input
                      type="number"
                      min="1"
                      max="7"
                      value={requiredDaysPerWeek}
                      onChange={(e) => setRequiredDaysPerWeek(Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of distinct days a customer must order within a week to earn the reward
                    </p>
                  </FormField>

                  <FormField label="Gold Coin Reward">
                    <Input
                      type="number"
                      min="0"
                      value={goldCoinReward}
                      onChange={(e) => setGoldCoinReward(Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of gold coins awarded when the streak is achieved
                    </p>
                  </FormField>

                  <FormField label="Streak Feature Active">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={isActive}
                        onCheckedChange={setIsActive}
                      />
                      <span className="text-sm font-medium">
                        {isActive ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      When disabled, no streak rewards will be given regardless of order frequency
                    </p>
                  </FormField>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={saving} size="lg">
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default StreakSettingsPage;
