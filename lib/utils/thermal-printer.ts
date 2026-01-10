import ReceiptPrinterEncoder from '@point-of-sale/receipt-printer-encoder';

export interface PrinterDevice {
  device: BluetoothDevice;
  characteristic?: BluetoothRemoteGATTCharacteristic;
}

let connectedPrinter: PrinterDevice | null = null;

export class ThermalPrinter {
  private static readonly SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb'; // Common thermal printer service
  private static readonly CHARACTERISTIC_UUID = '00002af1-0000-1000-8000-00805f9b34fb'; // Common thermal printer characteristic

  // Your specific printer MAC address
  private static readonly PRINTER_MAC_ADDRESS = 'DC:0D:30:E3:30:FA';
  private static readonly STORED_DEVICE_KEY = 'thermal_printer_device_id';

  static isBluetoothAvailable(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  private static async getServiceAndCharacteristic(server: BluetoothRemoteGATTServer): Promise<{
    service: BluetoothRemoteGATTService;
    characteristic: BluetoothRemoteGATTCharacteristic;
  }> {
    // Get the service - try multiple service UUIDs
    let service;
    const serviceUUIDs = [
      // Try common thermal printer services first
      '0000ffe0-0000-1000-8000-00805f9b34fb', // Very common in Chinese thermal printers
      '0000fff0-0000-1000-8000-00805f9b34fb',
      '49535343-fe7d-4ae5-8fa9-9fafd205e455',
      '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART
      '00001101-0000-1000-8000-00805f9b34fb', // Serial Port Profile
      this.SERVICE_UUID,
      '000018f0-0000-1000-8000-00805f9b34fb',
    ];

    for (const uuid of serviceUUIDs) {
      try {
        service = await server.getPrimaryService(uuid);
        if (service) break;
      } catch (e) {
        continue;
      }
    }

    if (!service) {
      throw new Error('Could not find a compatible printer service');
    }

    // Get the characteristic - try multiple characteristic UUIDs
    let characteristic;
    const characteristicUUIDs = [
      '0000ffe1-0000-1000-8000-00805f9b34fb', // Common in Chinese thermal printers
      '0000fff1-0000-1000-8000-00805f9b34fb',
      '49535343-8841-43f4-a8d4-ecbe34729bb3',
      '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART TX
      this.CHARACTERISTIC_UUID,
      '00002af1-0000-1000-8000-00805f9b34fb',
    ];

    for (const uuid of characteristicUUIDs) {
      try {
        characteristic = await service.getCharacteristic(uuid);
        if (characteristic && (characteristic.properties.write || characteristic.properties.writeWithoutResponse)) {
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // If we didn't find a characteristic by UUID, try to find ANY writable characteristic
    if (!characteristic) {
      try {
        const allChars = await service.getCharacteristics();
        for (const char of allChars) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            characteristic = char;
            break;
          }
        }
      } catch (e) {
        // Continue
      }
    }

    if (!characteristic) {
      throw new Error('Could not find a writable characteristic');
    }

    return { service, characteristic };
  }

  static async connectToStoredDevice(): Promise<PrinterDevice | null> {
    try {
      // Try to get all previously paired devices in Chrome
      // Note: getDevices() may not be available in all browsers yet
      if (!navigator.bluetooth.getDevices) {
        return null;
      }

      const devices = await navigator.bluetooth.getDevices();
      const storedDeviceId = localStorage.getItem(this.STORED_DEVICE_KEY);

      // If we have a stored device, try to use it
      if (storedDeviceId) {
        const savedDevice = devices.find(d => d.id === storedDeviceId);
        if (savedDevice && savedDevice.gatt) {
          const server = await savedDevice.gatt.connect();

          // Get service and characteristic
          const { characteristic } = await this.getServiceAndCharacteristic(server);

          connectedPrinter = { device: savedDevice, characteristic };
          return connectedPrinter;
        }
      }

      // If no stored device but we have paired devices, try the first one
      if (devices.length > 0) {
        const device = devices[0];
        if (device.gatt) {
          const server = await device.gatt.connect();
          const { characteristic } = await this.getServiceAndCharacteristic(server);

          // Store this device for future use
          localStorage.setItem(this.STORED_DEVICE_KEY, device.id);

          connectedPrinter = { device, characteristic };
          return connectedPrinter;
        }
      }
    } catch (error) {
      // Silent fail - will try new pairing
    }
    return null;
  }

  static async connect(useStored: boolean = true): Promise<PrinterDevice> {
    try {
      // Check if browser supports Web Bluetooth
      if (!this.isBluetoothAvailable()) {
        throw new Error(
          'Web Bluetooth is not supported. Please use Chrome, Edge, or Opera browser. ' +
          'If using Chrome/Edge, enable the flag: chrome://flags/#enable-web-bluetooth'
        );
      }

      // Try to reconnect to stored device first
      if (useStored) {
        const storedDevice = await this.connectToStoredDevice();
        if (storedDevice) {
          return storedDevice;
        }
      }

      // For P810 series printers
      // Using filters with namePrefix to target the specific printer
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'P810' }, // Your specific printer series
          { namePrefix: 'P8' },
          { name: 'P810-30FA' }, // Exact name
        ],
        optionalServices: [
          // All possible printer service UUIDs
          '0000ffe0-0000-1000-8000-00805f9b34fb',
          '0000fff0-0000-1000-8000-00805f9b34fb',
          '49535343-fe7d-4ae5-8fa9-9fafd205e455',
          '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
          '00001101-0000-1000-8000-00805f9b34fb',
          this.SERVICE_UUID,
          '000018f0-0000-1000-8000-00805f9b34fb',
        ],
      });

      // Store device ID for future reconnections
      localStorage.setItem(this.STORED_DEVICE_KEY, device.id);

      // Connect to GATT server
      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error('Failed to connect to GATT server');
      }

      // Get service and characteristic
      const { characteristic } = await this.getServiceAndCharacteristic(server);

      connectedPrinter = { device, characteristic };

      return connectedPrinter;
    } catch (error) {
      throw error;
    }
  }

  static disconnect(): void {
    if (connectedPrinter?.device?.gatt?.connected) {
      connectedPrinter.device.gatt.disconnect();
      connectedPrinter = null;
    }
  }

  static isConnected(): boolean {
    return connectedPrinter?.device?.gatt?.connected ?? false;
  }

  static getConnectedDevice(): PrinterDevice | null {
    return connectedPrinter;
  }

  static clearStoredDevice(): void {
    localStorage.removeItem(this.STORED_DEVICE_KEY);
  }

  static getPrinterInfo(): string {
    if (connectedPrinter?.device) {
      return `${connectedPrinter.device.name || 'Unknown'} (Expected MAC: ${this.PRINTER_MAC_ADDRESS})`;
    }
    return 'Not connected';
  }

  static async print(data: Uint8Array): Promise<void> {
    if (!connectedPrinter?.characteristic) {
      throw new Error('Printer not connected');
    }

    // Send data in 512 byte chunks (Bluetooth GATT max)
    // Use minimal delay to prevent horizontal cutting
    const chunkSize = 512;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await connectedPrinter.characteristic.writeValue(chunk);
      // Ultra-minimal delay - just 1ms to let the write complete
      // This prevents horizontal cuts while avoiding buffer overflow
      await new Promise(resolve => setTimeout(resolve, 1));
    }
  }

  private static async loadLogo(): Promise<HTMLCanvasElement | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          console.log('Logo loaded successfully:', img.width, 'x', img.height);

          // Create canvas to convert image to monochrome
          const canvas = document.createElement('canvas');

          // Both width AND height must be multiples of 8 for thermal printers
          const desiredWidth = 192; // Smaller size for better compatibility
          const calculatedHeight = Math.floor((img.height / img.width) * desiredWidth);

          // Round width to nearest multiple of 8
          const targetWidth = Math.ceil(desiredWidth / 8) * 8;
          // Round height to nearest multiple of 8
          const targetHeight = Math.ceil(calculatedHeight / 8) * 8;

          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            console.log('Failed to get canvas context');
            resolve(null);
            return;
          }

          // Fill with white background first
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, targetWidth, targetHeight);

          // Calculate scaling to fit image while maintaining aspect ratio
          const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;

          // Center the image on the canvas
          const x = (targetWidth - scaledWidth) / 2;
          const y = (targetHeight - scaledHeight) / 2;

          // Draw image scaled and centered on canvas
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

          console.log('Canvas created:', canvas.width, 'x', canvas.height);
          resolve(canvas);
        } catch (error) {
          console.log('Error creating canvas:', error);
          resolve(null);
        }
      };
      img.onerror = (e) => {
        console.log('Failed to load logo:', e);
        resolve(null);
      };
      img.src = '/simple.png';
      console.log('Attempting to load logo from:', img.src);
    });
  }

  static async generateReceipt(data: {
    customerName: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      ingredients?: Array<{ name: string; plusCount?: number }>;
    }>;
    subtotal?: number;
    promoDiscount?: number;
    discount?: number;
    deliveryFee?: number;
    total: number;
    orderNumber: string;
    latitude?: number;
    longitude?: number;
  }): Promise<Uint8Array> {
    const encoder = new ReceiptPrinterEncoder({
      language: 'esc-pos',
      columns: 48, // Increased from 32 to 48 for 80mm paper (bigger receipt)
    });

    // Generate QR code with Google Maps location if coordinates are available
    const qrCodeData = data.latitude && data.longitude
      ? `https://www.google.com/maps?q=${data.latitude},${data.longitude}`
      : `ORDER-${data.orderNumber}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    console.log('QR Code data:', qrCodeData);
    console.log('Coordinates:', { lat: data.latitude, lng: data.longitude });

    // Build receipt with bigger format
    const separator = '================================================';

    // Load and add logo
    console.log('Starting logo load...');
    const logo = await this.loadLogo();
    console.log('Logo loaded:', logo ? 'YES' : 'NO');

    const result = encoder
      .initialize()
      .align('center');

    // Add logo if loaded successfully
    if (logo) {
      try {
        console.log('Adding logo to receipt...');
        result
          .newline()
          // Use threshold algorithm for clean black & white logo (no dithering)
          // Higher threshold (180) for cleaner black & white conversion
          .image(logo, logo.width, logo.height, 'threshold', 180)
          .newline()
          .newline();
        console.log('Logo added successfully');
      } catch (error) {
        console.log('Error adding logo to receipt:', error);
        // If image fails, continue without logo
        result.newline();
      }
    } else {
      console.log('No logo to add, continuing without it');
      result.newline();
    }

    result
      .bold(true)
      .line('RECEIPT')
      .bold(false)
      .line(separator)
      .align('left')
      .newline()
      .line(`Order: #${data.orderNumber}`)
      .line(`Customer: ${data.customerName}`)
      .line(`Date: ${new Date().toLocaleString()}`)
      .newline()
      .line(separator)
      .newline();

    // Add items with better spacing
    data.items.forEach(item => {
      result
        .bold(true)
        .line(`${item.name}`)
        .bold(false)
        .line(`  Quantity: ${item.quantity}`)
        .line(`  Price: ${item.price.toFixed(2)} JOD`)
        .newline();

      // Add ingredients if present
      if (item.ingredients && item.ingredients.length > 0) {
        result.line('  Ingredients:');

        // Sort ingredients by category: carbs, veggies, protein, dressing
        const sortedIngredients = [...item.ingredients].sort((a, b) => {
          const getCategoryOrder = (name: string) => {
            const lowerName = name.toLowerCase();
            // Carbs first
            if (lowerName.includes('rice') || lowerName.includes('quinoa') ||
                lowerName.includes('pasta') || lowerName.includes('noodle') ||
                lowerName.includes('bread') || lowerName.includes('potato')) {
              return 1;
            }
            // Veggies second
            if (lowerName.includes('broccoli') || lowerName.includes('carrot') ||
                lowerName.includes('spinach') || lowerName.includes('lettuce') ||
                lowerName.includes('tomato') || lowerName.includes('pepper') ||
                lowerName.includes('onion') || lowerName.includes('mushroom') ||
                lowerName.includes('zucchini') || lowerName.includes('veggie') ||
                lowerName.includes('vegetable') || lowerName.includes('corn') ||
                lowerName.includes('peas') || lowerName.includes('bean') ||
                lowerName.includes('cucumber') || lowerName.includes('kale')) {
              return 2;
            }
            // Protein third
            if (lowerName.includes('chicken') || lowerName.includes('beef') ||
                lowerName.includes('salmon') || lowerName.includes('shrimp') ||
                lowerName.includes('tofu') || lowerName.includes('fish') ||
                lowerName.includes('turkey') || lowerName.includes('pork') ||
                lowerName.includes('lamb') || lowerName.includes('protein') ||
                lowerName.includes('egg') || lowerName.includes('tuna')) {
              return 3;
            }
            // Dressing last
            if (lowerName.includes('dressing') || lowerName.includes('sauce') ||
                lowerName.includes('vinaigrette') || lowerName.includes('mayo')) {
              return 4;
            }
            // Unknown items at the end
            return 5;
          };

          return getCategoryOrder(a.name) - getCategoryOrder(b.name);
        });

        sortedIngredients.forEach(ing => {
          const plusText = ing.plusCount && ing.plusCount > 0 ? ` (+${ing.plusCount})` : '';
          result.line(`    * ${ing.name}${plusText}`);
        });
        result.newline();
      }
    });

    result.line(separator);

    // Add pricing breakdown
    result
      .newline()
      .align('left');

    // Subtotal
    if (data.subtotal !== undefined) {
      result.line(`Subtotal: ${data.subtotal.toFixed(2)} JOD`);
    }

    // Promo code discount if present
    if (data.promoDiscount && data.promoDiscount > 0) {
      result.line(`Promo Discount: -${data.promoDiscount.toFixed(2)} JOD`);
    }

    // Points discount if present
    if (data.discount && data.discount > 0) {
      result.line(`Points Discount: -${data.discount.toFixed(2)} JOD`);
    }

    // Delivery fee
    const deliveryFee = data.deliveryFee !== undefined ? data.deliveryFee : 1.00;
    result.line(`Delivery Fee: ${deliveryFee.toFixed(2)} JOD`);

    result
      .newline()
      .line(separator);

    // Add total with bigger spacing
    result
      .newline()
      .bold(true)
      .align('center')
      .line(`TOTAL: ${data.total.toFixed(2)} JOD`)
      .bold(false)
      .newline()
      .line(separator)
      .newline()
      .newline()
      .line('Thank you for your order!')
      .newline()
      .newline()
      .newline()
      // Add QR code (Google Maps location or order info)
      .line('Scan to verify:')
      .newline()
      .qrcode(qrCodeData, 2, 8, 'm') // Increased size from 6 to 8, model 2, medium error correction
      .newline()
      .newline()
      .newline()
      .cut();

    return result.encode();
  }
}
