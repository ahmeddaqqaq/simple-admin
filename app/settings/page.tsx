"use client";

import { useEffect, useState } from "react";
import { Settings, Store, Loader2 } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { settingsService, AppSettings } from "@/lib/services/settings.service";
import { handleError, showSuccess } from "@/lib/utils/error-handler";

const SettingsPage = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
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
              <div className="mt-4 p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">
                  Last updated: {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleString() : "Never"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
};

export default SettingsPage;
