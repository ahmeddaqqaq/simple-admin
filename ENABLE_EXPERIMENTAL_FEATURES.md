# Enable Experimental Web Platform Features

Your printer "P810-30FA" is being detected but Chrome can't connect because it doesn't recognize the Bluetooth services it uses.

## Quick Fix - Enable Experimental Features

1. **Open a new tab** and go to:
   ```
   chrome://flags/#enable-experimental-web-platform-features
   ```

2. **Find "Experimental Web Platform features"**

3. **Set it to "Enabled"**

4. **Click "Relaunch"** to restart Chrome

5. **Try connecting to the printer again**

This enables newer Bluetooth APIs that might help Chrome work with your specific printer model.

## Alternative - Try Without Service Restrictions

I'm also updating the code to be less restrictive about which Bluetooth services it accepts. This should help it work with more printer models including yours.

## Your Printer Info

- Name: **P810-30FA**
- MAC: **DC:0D:30:E3:30:FA**
- Manufacturer: Likely a P810 series thermal printer

The printer is being found correctly, we just need to enable the right browser features to connect to it.
