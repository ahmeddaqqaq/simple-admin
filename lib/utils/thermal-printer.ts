import ReceiptPrinterEncoder from '@point-of-sale/receipt-printer-encoder';

export interface PrinterDevice {
  device: BluetoothDevice;
  characteristic?: BluetoothRemoteGATTCharacteristic;
}

let connectedPrinter: PrinterDevice | null = null;

export class ThermalPrinter {
  private static readonly SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb'; // Common thermal printer service
  private static readonly CHARACTERISTIC_UUID = '00002af1-0000-1000-8000-00805f9b34fb'; // Common thermal printer characteristic

  static isBluetoothAvailable(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  static async connect(): Promise<PrinterDevice> {
    try {
      // Check if browser supports Web Bluetooth
      if (!this.isBluetoothAvailable()) {
        throw new Error(
          'Web Bluetooth is not supported. Please use Chrome, Edge, or Opera browser. ' +
          'If using Chrome/Edge, enable the flag: chrome://flags/#enable-web-bluetooth'
        );
      }

      // Request Bluetooth device
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'DP' }, // Tally Dascom DP series
          { namePrefix: 'Printer' },
          { namePrefix: 'POS' },
        ],
        optionalServices: [
          this.SERVICE_UUID,
          '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Another common service UUID
          '000018f0-0000-1000-8000-00805f9b34fb',
          '0000fff0-0000-1000-8000-00805f9b34fb',
        ],
      });

      // Connect to GATT server
      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error('Failed to connect to GATT server');
      }

      // Get the service - try multiple service UUIDs
      let service;
      const serviceUUIDs = [
        this.SERVICE_UUID,
        '49535343-fe7d-4ae5-8fa9-9fafd205e455',
        '000018f0-0000-1000-8000-00805f9b34fb',
        '0000fff0-0000-1000-8000-00805f9b34fb',
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
        throw new Error('Could not find printer service');
      }

      // Get the characteristic - try multiple characteristic UUIDs
      let characteristic;
      const characteristicUUIDs = [
        this.CHARACTERISTIC_UUID,
        '49535343-8841-43f4-a8d4-ecbe34729bb3',
        '00002af1-0000-1000-8000-00805f9b34fb',
        '0000fff1-0000-1000-8000-00805f9b34fb',
      ];

      for (const uuid of characteristicUUIDs) {
        try {
          characteristic = await service.getCharacteristic(uuid);
          if (characteristic) break;
        } catch (e) {
          continue;
        }
      }

      if (!characteristic) {
        throw new Error('Could not find printer characteristic');
      }

      connectedPrinter = { device, characteristic };
      return connectedPrinter;
    } catch (error) {
      console.error('Error connecting to printer:', error);
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

  static async print(data: Uint8Array): Promise<void> {
    if (!connectedPrinter?.characteristic) {
      throw new Error('Printer not connected');
    }

    try {
      // Send data in chunks (some printers have MTU limitations)
      const chunkSize = 512;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await connectedPrinter.characteristic.writeValue(chunk);
        // Small delay between chunks to prevent buffer overflow
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error('Error printing:', error);
      throw error;
    }
  }

  static generateReceipt(data: {
    customerName: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      ingredients?: Array<{ name: string; plusCount?: number }>;
    }>;
    discount?: number;
    total: number;
    orderNumber: string;
  }): Uint8Array {
    const encoder = new ReceiptPrinterEncoder({
      language: 'esc-pos',
      columns: 48, // Increased from 32 to 48 for 80mm paper (bigger receipt)
    });

    // Generate random QR code data for testing
    const randomQRData = `ORDER-${data.orderNumber}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Build receipt with bigger format
    const separator = '================================================';

    const result = encoder
      .initialize()
      .align('center')
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
        item.ingredients.forEach(ing => {
          const plusText = ing.plusCount && ing.plusCount > 0 ? ` (+${ing.plusCount})` : '';
          result.line(`    * ${ing.name}${plusText}`);
        });
        result.newline();
      }
    });

    result.line(separator);

    // Add discount if present
    if (data.discount && data.discount > 0) {
      result
        .newline()
        .align('left')
        .line(`Points Discount: -${data.discount.toFixed(2)} JOD`)
        .newline()
        .line(separator);
    }

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
      // Add QR code for testing (bigger size)
      .line('Scan to verify:')
      .newline()
      .qrcode(randomQRData, 2, 8, 'm') // Increased size from 6 to 8, model 2, medium error correction
      .newline()
      .newline()
      .newline()
      .cut();

    return result.encode();
  }
}
