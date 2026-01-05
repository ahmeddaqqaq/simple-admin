# Thermal Printer Setup Guide

## Browser Requirements

The thermal printer feature uses the Web Bluetooth API, which is only supported in certain browsers:

### Supported Browsers
- Google Chrome (version 56+)
- Microsoft Edge (version 79+)
- Opera (version 43+)

### NOT Supported
- Safari (macOS/iOS)
- Firefox (Web Bluetooth disabled by default)

## Enabling Web Bluetooth

### For Chrome/Edge on macOS:

1. **Open Chrome/Edge flags page:**
   - In your browser, navigate to: `chrome://flags` (or `edge://flags`)

2. **Enable Web Bluetooth:**
   - Search for "Web Bluetooth"
   - Find the flag: `#enable-web-bluetooth`
   - Set it to "Enabled"

3. **Restart your browser**

### For Chrome/Edge on Windows:

Web Bluetooth should be enabled by default. If not working:

1. Navigate to: `chrome://flags`
2. Search for "Web Bluetooth"
3. Enable it and restart

## Testing Your Tally Dascom Printer

### Preparation:
1. Turn on your Tally Dascom DP printer
2. Make sure Bluetooth is enabled on the printer
3. Ensure the printer is not connected to any other device
4. The printer should be in pairing mode (refer to your printer manual)

### Using the Print Feature:

1. **Open the app in a supported browser** (Chrome or Edge)
2. **Navigate to an order details page**
3. **Click the "Print Receipt" button**
4. **A Bluetooth pairing dialog will appear**
   - Look for a device name starting with "DP" or "Printer"
   - Select your Tally Dascom printer
5. **Click "Pair"**
6. The receipt will print automatically

### Common Issues:

**"Web Bluetooth API globally disabled" Error:**
- Make sure you're using Chrome or Edge
- Enable Web Bluetooth in chrome://flags (see above)
- Restart your browser after enabling

**Printer not showing in Bluetooth picker:**
- Make sure printer is powered on
- Printer should be in pairing mode
- Check that it's not already connected to another device
- Try turning Bluetooth off and on on your computer

**"Bluetooth permission has been blocked":**
- Clear site data for localhost
- Go to: chrome://settings/content/bluetooth
- Remove localhost from the blocked list
- Refresh the page and try again

**Connection fails after pairing:**
- Some Tally Dascom models use different Bluetooth service UUIDs
- The printer utility tries multiple common UUIDs automatically
- If still failing, you may need to consult your printer documentation for the specific service UUID

## Printer Requirements

The Tally Dascom DP series printers should work with this implementation as they support:
- Bluetooth connectivity
- ESC/POS commands (standard thermal printer protocol)
- 32-column thermal printing (or wider)

## Receipt Format

The printed receipt includes:
- Order number
- Customer name
- Order date/time
- All order items with quantities and prices
- Ingredients for custom meals/smoothies (with plus counts)
- Points discount (if applicable)
- Total amount

## Development Testing

For local development:
- Web Bluetooth works on `localhost` without HTTPS
- For production, you MUST use HTTPS
- The app will need to be accessed via HTTPS in production

## Alternative Options

If Web Bluetooth doesn't work for your setup, alternatives include:
- Using a native print driver (requires desktop app)
- Using a cloud printing service
- Implementing a local print server that the web app can communicate with via HTTP
