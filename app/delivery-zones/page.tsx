"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  DeliveryZone,
  CreateDeliveryZoneDto,
  UpdateDeliveryZoneDto,
  deliveryZonesService,
} from "@/lib/services/delivery-zones.service";
import { handleError, showSuccess } from "@/lib/utils/error-handler";
import DeliveryZoneForm from "@/components/DeliveryZoneForm";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, MapPin, Circle, DollarSign } from "lucide-react";
import { PageTransition } from "@/components/page-transition";

// Zone colors for visualization
const ZONE_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
];

const DeliveryZonesPage = () => {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [loading, setLoading] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const circlesRef = useRef<google.maps.Circle[]>([]);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const data = await deliveryZonesService.findAll(true);
      setZones(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initMap = () => {
      // Calculate center based on zones or default to Amman
      const center = zones.length > 0
        ? {
            lat: zones.reduce((sum, z) => sum + z.centerLatitude, 0) / zones.length,
            lng: zones.reduce((sum, z) => sum + z.centerLongitude, 0) / zones.length,
          }
        : { lat: 31.9539, lng: 35.9106 };

      const map = new google.maps.Map(mapContainerRef.current!, {
        center,
        zoom: 11,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
      });

      mapRef.current = map;
      updateCircles();
    };

    // Load Google Maps script if not already loaded
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );

    if (!window.google && !existingScript) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else if (existingScript && !window.google) {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initMap();
        }
      }, 100);

      return () => clearInterval(interval);
    } else if (window.google) {
      initMap();
    }
  }, []);

  // Update circles when zones change
  const updateCircles = () => {
    if (!mapRef.current) return;

    // Clear existing circles
    circlesRef.current.forEach((circle) => circle.setMap(null));
    circlesRef.current = [];

    // Add new circles for active zones
    const activeZones = zones.filter((z) => z.isActive);
    activeZones.forEach((zone, index) => {
      const color = ZONE_COLORS[index % ZONE_COLORS.length];
      const circle = new google.maps.Circle({
        map: mapRef.current!,
        center: { lat: zone.centerLatitude, lng: zone.centerLongitude },
        radius: zone.radiusKm * 1000,
        fillColor: color,
        fillOpacity: 0.2,
        strokeColor: color,
        strokeWeight: 2,
        clickable: true,
      });

      // Add info window on click
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <strong>${zone.name}</strong><br/>
            Radius: ${zone.radiusKm} km<br/>
            Fee: JOD ${zone.fee.toFixed(2)}<br/>
            Priority: ${zone.sortOrder}
          </div>
        `,
      });

      circle.addListener("click", () => {
        infoWindow.setPosition({ lat: zone.centerLatitude, lng: zone.centerLongitude });
        infoWindow.open(mapRef.current!);
      });

      circlesRef.current.push(circle);
    });

    // Fit bounds to show all zones
    if (activeZones.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      activeZones.forEach((zone) => {
        // Add points at the edge of each circle to ensure full coverage
        const center = { lat: zone.centerLatitude, lng: zone.centerLongitude };
        bounds.extend(center);
        // Extend bounds to include the circle radius
        const radiusDegrees = zone.radiusKm / 111; // rough conversion
        bounds.extend({ lat: center.lat + radiusDegrees, lng: center.lng });
        bounds.extend({ lat: center.lat - radiusDegrees, lng: center.lng });
        bounds.extend({ lat: center.lat, lng: center.lng + radiusDegrees });
        bounds.extend({ lat: center.lat, lng: center.lng - radiusDegrees });
      });
      mapRef.current?.fitBounds(bounds);
    }
  };

  // Update circles whenever zones change
  useEffect(() => {
    if (mapRef.current && window.google) {
      updateCircles();
    }
  }, [zones]);

  const handleSave = async (zone: CreateDeliveryZoneDto | UpdateDeliveryZoneDto) => {
    try {
      if (selectedZone) {
        await deliveryZonesService.update(
          selectedZone.id,
          zone as UpdateDeliveryZoneDto
        );
        showSuccess("Delivery zone updated successfully");
      } else {
        await deliveryZonesService.create(zone as CreateDeliveryZoneDto);
        showSuccess("Delivery zone created successfully");
      }

      fetchZones();
      setIsModalOpen(false);
      setSelectedZone(null);
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this delivery zone?"))
      return;

    try {
      await deliveryZonesService.remove(id);
      showSuccess("Delivery zone deleted successfully");
      fetchZones();
    } catch (error) {
      handleError(error);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await deliveryZonesService.toggleActive(id);
      showSuccess("Delivery zone status updated");
      fetchZones();
    } catch (error) {
      handleError(error);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Zone Name",
      render: (zone: DeliveryZone) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="font-medium">{zone.name}</span>
        </div>
      ),
    },
    {
      key: "radius",
      header: "Radius",
      render: (zone: DeliveryZone) => (
        <div className="flex items-center gap-1">
          <Circle className="w-4 h-4 text-gray-500" />
          <span>{zone.radiusKm} km</span>
        </div>
      ),
    },
    {
      key: "fee",
      header: "Delivery Fee",
      render: (zone: DeliveryZone) => (
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="font-medium">JOD {zone.fee.toFixed(2)}</span>
        </div>
      ),
    },
    {
      key: "sortOrder",
      header: "Priority",
      render: (zone: DeliveryZone) => (
        <span className="text-sm text-gray-600">{zone.sortOrder}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (zone: DeliveryZone) => (
        zone.isActive ? (
          <Badge variant="default">Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        )
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      render: (zone: DeliveryZone) => (
        <div className="space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedZone(zone);
              setIsModalOpen(true);
            }}
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToggleActive(zone.id)}
            title={zone.isActive ? "Deactivate" : "Activate"}
          >
            <Badge variant={zone.isActive ? "default" : "secondary"}>
              {zone.isActive ? "Active" : "Inactive"}
            </Badge>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(zone.id)}
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageTransition>
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Delivery Zones</h1>
            <p className="page-description">
              Manage delivery zones and their fees. Zones are checked in order of priority (lower number = checked first).
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedZone(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Delivery Zone
          </Button>
        </div>

        {/* Map visualization */}
        <div className="mb-6 border rounded-lg overflow-hidden h-[400px]">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        <DataTable
          title="All Delivery Zones"
          data={zones}
          columns={columns}
          loading={loading}
          emptyMessage="No delivery zones found"
          emptyDescription="Create your first delivery zone to start charging delivery fees"
          getRowKey={(zone) => zone.id}
        />

        {isModalOpen && (
          <DeliveryZoneForm
            zone={selectedZone}
            onSave={handleSave}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedZone(null);
            }}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default DeliveryZonesPage;
