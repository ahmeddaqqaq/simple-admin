"use client";

import React, { useEffect, useState } from "react";
import {
  openingScheduleService,
  OpeningScheduleDay,
} from "@/lib/services/opening-schedule.service";
import { handleError, showSuccess } from "@/lib/utils/error-handler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/page-transition";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Clock } from "lucide-react";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface DayState {
  dayOfWeek: number;
  dayName: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

const OpeningHoursPage = () => {
  const [schedule, setSchedule] = useState<DayState[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const buildDefaultSchedule = (): DayState[] =>
    DAY_NAMES.map((name, index) => ({
      dayOfWeek: index,
      dayName: name,
      openTime: "08:00",
      closeTime: "22:00",
      isOpen: index !== 5, // Friday closed by default
    }));

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const data = await openingScheduleService.getSchedule();

      // Merge fetched data with all 7 days (fill in any missing days)
      const merged: DayState[] = DAY_NAMES.map((name, index) => {
        const existing = data.find((d) => d.dayOfWeek === index);
        if (existing) {
          return {
            dayOfWeek: existing.dayOfWeek,
            dayName: existing.dayName || name,
            openTime: existing.openTime,
            closeTime: existing.closeTime,
            isOpen: existing.isOpen,
          };
        }
        return {
          dayOfWeek: index,
          dayName: name,
          openTime: "08:00",
          closeTime: "22:00",
          isOpen: true,
        };
      });

      setSchedule(merged);
    } catch (error) {
      handleError(error);
      setSchedule(buildDefaultSchedule());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const updateDay = (dayOfWeek: number, field: keyof DayState, value: string | boolean) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day
      )
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await openingScheduleService.updateSchedule({
        days: schedule.map((d) => ({
          dayOfWeek: d.dayOfWeek,
          openTime: d.openTime,
          closeTime: d.closeTime,
          isOpen: d.isOpen,
        })),
      });
      showSuccess("Opening schedule saved successfully");
      fetchSchedule();
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
            <h1 className="page-title">Opening Hours</h1>
            <p className="page-description">
              Configure the weekly opening schedule
            </p>
          </div>
          <Button onClick={handleSaveAll} disabled={saving || loading}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save All"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
            <CardDescription>
              Set opening and closing times for each day of the week. Toggle the
              switch to mark a day as closed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(7)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {schedule.map((day) => (
                  <div
                    key={day.dayOfWeek}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      day.isOpen
                        ? "bg-card border-border"
                        : "bg-muted/40 border-border/50"
                    }`}
                  >
                    {/* Day name */}
                    <div className="w-28 flex-shrink-0">
                      <span
                        className={`font-semibold ${
                          day.isOpen ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {day.dayName}
                      </span>
                    </div>

                    {/* Open/Closed toggle */}
                    <div className="flex items-center gap-2 w-28 flex-shrink-0">
                      <Switch
                        checked={day.isOpen}
                        onCheckedChange={(val) =>
                          updateDay(day.dayOfWeek, "isOpen", val)
                        }
                      />
                      <Badge
                        variant={day.isOpen ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {day.isOpen ? "Open" : "Closed"}
                      </Badge>
                    </div>

                    {/* Time inputs */}
                    {day.isOpen ? (
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">Opens at</span>
                          <Input
                            type="time"
                            value={day.openTime}
                            onChange={(e) =>
                              updateDay(day.dayOfWeek, "openTime", e.target.value)
                            }
                            className="w-36"
                          />
                        </div>
                        <span className="text-muted-foreground">—</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Closes at</span>
                          <Input
                            type="time"
                            value={day.closeTime}
                            onChange={(e) =>
                              updateDay(day.dayOfWeek, "closeTime", e.target.value)
                            }
                            className="w-36"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <span className="text-sm text-muted-foreground italic">
                          Closed all day
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {!loading && schedule.length > 0 && (
          <div className="flex justify-end">
            <Button onClick={handleSaveAll} disabled={saving} size="lg">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default OpeningHoursPage;
