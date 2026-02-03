"use client";

import { useEffect, useState } from "react";
import { Settings, Store, Loader2, Package, Save } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { settingsService, AppSettings } from "@/lib/services/settings.service";
import { handleError, showSuccess } from "@/lib/utils/error-handler";

const SettingsPage = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [savingCosts, setSavingCosts] = useState(false);

  // Cost inputs
  const [mealBoxCost, setMealBoxCost] = useState("");
  const [saladBoxCost, setSaladBoxCost] = useState("");
  const [detoxBottleCost, setDetoxBottleCost] = useState("");
  const [woodCutleryCost, setWoodCutleryCost] = useState("");
  const [plasticCutleryCost, setPlasticCutleryCost] = useState("");

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
      // Initialize cost inputs
      setMealBoxCost(data.mealBoxCost?.toString() || "0");
      setSaladBoxCost(data.saladBoxCost?.toString() || "0");
      setDetoxBottleCost(data.detoxBottleCost?.toString() || "0");
      setWoodCutleryCost(data.woodCutleryCost?.toString() || "0");
      setPlasticCutleryCost(data.plasticCutleryCost?.toString() || "0");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggleOpen = async () => {
    if (!settings) return;

    try {
      setUpdating(true);
      const newIsOpen = !settings.isOpen;
      const updated = await settingsService.updateSettings({ isOpen: newIsOpen });
      setSettings(updated);
      showSuccess(newIsOpen ? "Store is now OPEN" : "Store is now CLOSED");
    } catch (error) {
      handleError(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveCosts = async () => {
    try {
      setSavingCosts(true);
      const updated = await settingsService.updateSettings({
        mealBoxCost: parseFloat(mealBoxCost) || 0,
        saladBoxCost: parseFloat(saladBoxCost) || 0,
        detoxBottleCost: parseFloat(detoxBottleCost) || 0,
        woodCutleryCost: parseFloat(woodCutleryCost) || 0,
        plasticCutleryCost: parseFloat(plasticCutleryCost) || 0,
      });
      setSettings(updated);
      showSuccess("Packaging costs saved successfully");
    } catch (error) {
      handleError(error);
    } finally {
      setSavingCosts(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Settings className="w-8 h-8" />
              Settings
            </h1>
            <p className="page-description">
              Manage your application settings
            </p>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Store Status
                </CardTitle>
                <CardDescription>
                  Control whether the store is open for orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <label htmlFor="store-open" className="text-base font-medium">
                      Store is {settings?.isOpen ? "Open" : "Closed"}
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {settings?.isOpen
                        ? "Customers can browse and place orders"
                        : "Customers will see a 'We are closed' page"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                    <Switch
                      id="store-open"
                      checked={settings?.isOpen ?? true}
                      onCheckedChange={handleToggleOpen}
                      disabled={updating}
                      className={settings?.isOpen ? "data-[state=checked]:bg-green-500" : ""}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Packaging Costs
                </CardTitle>
                <CardDescription>
                  Set the cost for packaging items (used in cost reports)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Meal Box Cost (JOD)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={mealBoxCost}
                      onChange={(e) => setMealBoxCost(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Cost per build-your-meal box</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Salad Box Cost (JOD)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={saladBoxCost}
                      onChange={(e) => setSaladBoxCost(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Cost per salad box</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Detox Bottle Cost (JOD)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={detoxBottleCost}
                      onChange={(e) => setDetoxBottleCost(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Cost per detox bottle</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Wood Cutlery Cost (JOD)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={woodCutleryCost}
                      onChange={(e) => setWoodCutleryCost(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Cost per wooden cutlery set</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Plastic Cutlery Cost (JOD)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={plasticCutleryCost}
                      onChange={(e) => setPlasticCutleryCost(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Cost per plastic cutlery set</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button onClick={handleSaveCosts} disabled={savingCosts}>
                    {savingCosts ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Costs
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">
                Last updated: {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleString() : "Never"}
              </p>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default SettingsPage;
