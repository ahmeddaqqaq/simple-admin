# Printer Not Appearing - Troubleshooting Guide

## Quick Checklist

### 1. Printer Power & Bluetooth
- [ ] Is the printer powered ON?
- [ ] Is the printer's Bluetooth enabled?
- [ ] Is the printer in pairing/discoverable mode? (check printer manual)
- [ ] Is the printer close to your computer? (within 10 meters)

### 2. Printer Pairing Status
- [ ] Open your system Bluetooth settings (macOS: System Settings > Bluetooth)
- [ ] Can you see the printer there?
- [ ] Is it already paired to another device? If yes, unpair it first
- [ ] Is it showing as "Connected" to another device? Disconnect it

### 3. Browser & System
- [ ] Are you using Chrome or Edge? (required for Web Bluetooth)
- [ ] Is Web Bluetooth enabled? Go to: chrome://flags/#enable-web-bluetooth
- [ ] Is your computer's Bluetooth turned ON?
- [ ] Did you restart the browser after enabling Web Bluetooth flag?

### 4. Browser Permissions
- [ ] Go to: chrome://settings/content/bluetooth
- [ ] Make sure localhost is not blocked
- [ ] Clear any blocked permissions for the site

## Specific Steps for Your Printer (MAC: DC:0D:30:E3:30:FA)

### Step 1: Verify Printer is Discoverable
On macOS:
1. Open "System Settings" > "Bluetooth"
2. Look for a device with MAC address ending in "E3:30:FA"
3. If you see it there, note its name
4. If it's already paired, click the (i) icon and select "Forget This Device"

### Step 2: Put Printer in Pairing Mode
Different thermal printers have different methods:
- Some require holding a button for 3-5 seconds
- Some have a pairing button
- Some auto-enter pairing mode when powered on
- Check your printer's manual for specific instructions

### Step 3: Test System Bluetooth
1. Make sure other Bluetooth devices appear in your system settings
2. If no devices appear, your Bluetooth might be off or not working

### Step 4: Try the Web App
1. Make sure printer is in pairing mode
2. Click "Print Receipt" button
3. In the picker, look for ALL devices (it will show everything nearby)
4. The printer might appear as:
   - A name like "Printer", "Thermal", "POS", "DP-xxx"
   - Or "Unknown device"
   - Check the console for the MAC address hint

## Alternative: Direct System Pairing First

Sometimes it helps to pair through the system first:

1. Open System Settings > Bluetooth
2. Find your printer (MAC: DC:0D:30:E3:30:FA)
3. Click "Connect" or "Pair"
4. THEN try the web app

## Debugging Commands

Open browser console (F12 or Cmd+Option+I) and run:

```javascript
// Check if Web Bluetooth is available
console.log('Bluetooth available:', 'bluetooth' in navigator);

// Try to get already paired devices
navigator.bluetooth.getDevices().then(devices => {
  console.log('Paired devices:', devices.map(d => ({name: d.name, id: d.id})));
});
```

## Common Issues

### "No devices found" in picker
- Printer is not in pairing mode
- Printer Bluetooth is off
- Printer is too far away
- Printer is already connected to another device

### Picker appears but printer not listed
- Put printer in pairing mode
- Move printer closer
- Unpair from other devices first
- Restart printer

### "User cancelled" error
- You closed the picker - try again
- Make sure to select a device

### Still not working?
- Restart the printer
- Restart your browser completely
- Restart your computer's Bluetooth
- Check printer manual for specific pairing instructions
