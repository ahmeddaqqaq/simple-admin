# Printer Already Paired in macOS? Here's What to Do

## The Issue

Your printer (MAC: **DC:0D:30:E3:30:FA**) is paired in macOS System Settings, but **Chrome Web Bluetooth works independently** from system Bluetooth pairing.

Even though macOS knows about the printer, Chrome needs to pair it separately through the Web Bluetooth API.

## Solution: Two Options

### Option 1: Unpair from macOS, Let Chrome Pair (RECOMMENDED)

This is the cleanest approach:

1. **Unpair from macOS:**
   - Open: System Settings > Bluetooth
   - Find your printer (MAC ending in E3:30:FA)
   - Click the (i) info icon next to it
   - Click "Forget This Device" or "Disconnect"

2. **Put printer in pairing mode:**
   - Turn printer off and on
   - Or hold the pairing button (check your printer manual)
   - The printer LED should blink indicating pairing mode

3. **Use the web app:**
   - Click "Print Receipt" button
   - The Bluetooth picker should appear
   - Select your printer
   - Click "Pair"

4. **Done!**
   - Chrome will remember the printer
   - Future prints will auto-connect
   - You can re-pair it with macOS later if needed (for other apps)

### Option 2: Pair Through Chrome While System-Paired

Sometimes this works:

1. **Keep macOS pairing** (don't unpair)

2. **Make sure printer is ON and nearby**

3. **Click "Print Receipt"** in the web app

4. **In the Bluetooth picker:**
   - Look for your printer
   - It might appear even though it's system-paired
   - Select it and click "Pair"

5. **If it doesn't appear:**
   - The printer might need to be in pairing mode
   - Or you might need to unpair from macOS (see Option 1)

## Testing

After pairing, open the browser console (Cmd+Option+I) and you should see:

```
Found 1 previously paired Chrome Bluetooth devices
Available devices: [{name: "Your Printer", id: "..."}]
Connected to printer: Your Printer
Expected MAC address: DC:0D:30:E3:30:FA
Device saved - will auto-reconnect on next print
```

## Why This Happens

- **macOS Bluetooth** = System-level pairing for all apps
- **Chrome Web Bluetooth** = Browser-level pairing for web apps only
- They don't share pairing information for security reasons

## Quick Test Command

Open browser console and run:

```javascript
navigator.bluetooth.getDevices().then(devices => {
  console.log('Chrome-paired devices:', devices.length);
  devices.forEach(d => console.log(`- ${d.name || 'Unknown'} (${d.id})`));
});
```

If this shows 0 devices, Chrome hasn't paired the printer yet, even if macOS has.

## Still Not Working?

1. **Restart the printer completely**
2. **Restart Chrome** (not just refresh - fully quit and reopen)
3. **Clear Chrome Bluetooth permissions:**
   - Go to: chrome://settings/content/bluetooth
   - Find localhost:3000 and remove it
   - Try pairing again
4. **Try in Incognito mode** (Cmd+Shift+N) to test with fresh state
