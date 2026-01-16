declare namespace google {
  namespace maps {
    class Map {
      constructor(element: HTMLElement, options?: MapOptions);
      setCenter(latlng: LatLng | LatLngLiteral): void;
      getCenter(): LatLng;
      setZoom(zoom: number): void;
      getZoom(): number;
      fitBounds(bounds: LatLngBounds): void;
      addListener(event: string, handler: (e: MapMouseEvent) => void): void;
    }

    class Marker {
      constructor(options?: MarkerOptions);
      setPosition(latlng: LatLng | LatLngLiteral): void;
      getPosition(): LatLng | null;
      setMap(map: Map | null): void;
      addListener(event: string, handler: () => void): void;
    }

    class Circle {
      constructor(options?: CircleOptions);
      setCenter(center: LatLng | LatLngLiteral): void;
      setRadius(radius: number): void;
      setMap(map: Map | null): void;
      addListener(event: string, handler: () => void): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    class LatLngBounds {
      constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
      extend(point: LatLng | LatLngLiteral): LatLngBounds;
    }

    class InfoWindow {
      constructor(options?: InfoWindowOptions);
      open(map: Map): void;
      close(): void;
      setPosition(position: LatLng | LatLngLiteral): void;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      disableDefaultUI?: boolean;
      zoomControl?: boolean;
      mapTypeControl?: boolean;
      scaleControl?: boolean;
      streetViewControl?: boolean;
      rotateControl?: boolean;
      fullscreenControl?: boolean;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      draggable?: boolean;
      title?: string;
    }

    interface CircleOptions {
      map?: Map;
      center?: LatLng | LatLngLiteral;
      radius?: number;
      fillColor?: string;
      fillOpacity?: number;
      strokeColor?: string;
      strokeWeight?: number;
      clickable?: boolean;
    }

    interface InfoWindowOptions {
      content?: string;
      position?: LatLng | LatLngLiteral;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface MapMouseEvent {
      latLng: LatLng | null;
    }
  }
}

interface Window {
  google: typeof google;
}
