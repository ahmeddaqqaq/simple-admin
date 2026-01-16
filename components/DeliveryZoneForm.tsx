"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CreateDeliveryZoneDto,
  UpdateDeliveryZoneDto,
  DeliveryZone,
} from "@/lib/services/delivery-zones.service";
import { Modal } from "@/components/ui/modal";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Circle } from "lucide-react";

interface DeliveryZoneFormProps {
  zone?: DeliveryZone | null;
  onSave: (zone: CreateDeliveryZoneDto | UpdateDeliveryZoneDto) => Promise<void>;
  onCancel: () => void;
}

const DeliveryZoneForm = ({ zone, onSave, onCancel }: DeliveryZoneFormProps) => {
  const [name, setName] = useState(zone?.name || "");
  const [centerLatitude, setCenterLatitude] = useState(
    zone?.centerLatitude || 31.9539
  );
  const [centerLongitude, setCenterLongitude] = useState(
    zone?.centerLongitude || 35.9106
  );
  const [radiusKm, setRadiusKm] = useState(zone?.radiusKm || 5);
  const [fee, setFee] = useState(zone?.fee || 0);
  const [sortOrder, setSortOrder] = useState(zone?.sortOrder || 0);
  const [isActive, setIsActive] = useState(zone?.isActive ?? true);
  const [loading, setLoading] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initMap = () => {
      const map = new google.maps.Map(mapContainerRef.current!, {
        center: { lat: centerLatitude, lng: centerLongitude },
        zoom: 12,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
      });

      mapRef.current = map;

      const marker = new google.maps.Marker({
        position: { lat: centerLatitude, lng: centerLongitude },
        map,
        draggable: true,
        title: "Zone Center",
      });

      markerRef.current = marker;

      // Create circle to show zone radius
      const circle = new google.maps.Circle({
        map,
        center: { lat: centerLatitude, lng: centerLongitude },
        radius: radiusKm * 1000, // Convert km to meters
        fillColor: "#3b82f6",
        fillOpacity: 0.2,
        strokeColor: "#3b82f6",
        strokeWeight: 2,
      });

      circleRef.current = circle;

      // Marker drag
      marker.addListener("dragend", () => {
        const pos = marker.getPosition();
        if (pos) {
          setCenterLatitude(pos.lat());
          setCenterLongitude(pos.lng());
          circle.setCenter(pos);
        }
      });

      // Map click
      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        marker.setPosition(e.latLng);
        circle.setCenter(e.latLng);
        setCenterLatitude(e.latLng.lat());
        setCenterLongitude(e.latLng.lng());
      });
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

  // Update circle radius when radiusKm changes
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radiusKm * 1000);
    }
  }, [radiusKm]);

  // Sync marker and circle when coordinates change from input
  useEffect(() => {
    if (markerRef.current && mapRef.current && circleRef.current) {
      const position = { lat: centerLatitude, lng: centerLongitude };
      markerRef.current.setPosition(position);
      circleRef.current.setCenter(position);
    }
  }, [centerLatitude, centerLongitude]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (radiusKm <= 0) {
      alert("Radius must be greater than 0");
      return;
    }

    if (fee < 0) {
      alert("Fee cannot be negative");
      return;
    }

    setLoading(true);
    try {
      const data: CreateDeliveryZoneDto | UpdateDeliveryZoneDto = {
        name,
        centerLatitude,
        centerLongitude,
        radiusKm,
        fee,
        sortOrder,
        isActive,
      };

      await onSave(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={true}
      onClose={onCancel}
      title={zone ? "Edit Delivery Zone" : "Create Delivery Zone"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Zone Name" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g., Downtown Amman, Inner City"
          />
        </FormField>

        {/* Map for selecting center point */}
        <FormField label="Zone Center & Radius (Click on map to set center)" required>
          <div className="border rounded-lg overflow-hidden h-[300px] relative">
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Click or drag the marker to set the zone center. The blue circle shows the delivery zone area.
          </p>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Center Latitude" required>
            <Input
              type="number"
              step="0.000001"
              value={centerLatitude}
              onChange={(e) => setCenterLatitude(Number(e.target.value))}
              required
            />
          </FormField>

          <FormField label="Center Longitude" required>
            <Input
              type="number"
              step="0.000001"
              value={centerLongitude}
              onChange={(e) => setCenterLongitude(Number(e.target.value))}
              required
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Radius (km)" required>
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-blue-500" />
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                required
                placeholder="5"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Radius of the delivery zone in kilometers
            </p>
          </FormField>

          <FormField label="Delivery Fee (JOD)" required>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={fee}
              onChange={(e) => setFee(Number(e.target.value))}
              required
              placeholder="1.50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Fee charged for deliveries in this zone
            </p>
          </FormField>
        </div>

        <FormField label="Sort Order">
          <Input
            type="number"
            min="0"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-1">
            Lower values are checked first. Use this for nested zones (e.g.,
            inner city = 0, suburbs = 1)
          </p>
        </FormField>

        <FormField label="Status">
          <div className="flex items-center space-x-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <span className="text-sm">{isActive ? "Active" : "Inactive"}</span>
          </div>
        </FormField>

        <div className="form-actions">
          <Button variant="secondary" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DeliveryZoneForm;
