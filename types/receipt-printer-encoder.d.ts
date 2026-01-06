declare module '@point-of-sale/receipt-printer-encoder' {
  interface ReceiptPrinterEncoderOptions {
    language?: string;
    columns?: number;
  }

  class ReceiptPrinterEncoder {
    constructor(options?: ReceiptPrinterEncoderOptions);
    initialize(): this;
    align(alignment: 'left' | 'center' | 'right'): this;
    bold(enabled: boolean): this;
    line(text: string): this;
    newline(): this;
    qrcode(data: string, model?: number, size?: number, errorlevel?: string): this;
    image(element: HTMLImageElement | HTMLCanvasElement, width: number, height: number, algorithm?: string, threshold?: number): this;
    cut(): this;
    encode(): Uint8Array;
  }

  export default ReceiptPrinterEncoder;
}
