#!/bin/bash

# Script to run iOS app on physical device
# This ensures Metro is running before building the app

set -e

echo "🚀 Starting Metro bundler with LAN support..."

# Get the Mac's LAN IP address
LAN_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo "📡 Your Mac's LAN IP: $LAN_IP"
echo "📱 Make sure your iPhone is on the same WiFi network"
echo ""

# Check if Metro is already running
if lsof -i :8081 > /dev/null 2>&1; then
  echo "✅ Metro is already running on port 8081"
else
  echo "🔄 Starting Metro bundler..."
  # Start Metro in the background
  REACT_NATIVE_PACKAGER_HOSTNAME=$LAN_IP npx expo start --lan > /tmp/metro.log 2>&1 &
  METRO_PID=$!

  echo "⏳ Waiting for Metro to be ready..."
  # Wait for Metro to be ready (check if port 8081 is open)
  for i in {1..30}; do
    if lsof -i :8081 > /dev/null 2>&1; then
      echo "✅ Metro is ready!"
      sleep 2  # Give it a couple more seconds to fully initialize
      break
    fi
    if [ $i -eq 30 ]; then
      echo "❌ Metro failed to start after 30 seconds"
      exit 1
    fi
    sleep 1
  done
fi

echo ""
echo "⚙️  Configuring Xcode to use LAN IP: $LAN_IP"
# Create .xcode.env.local file with the LAN IP
cat > "$(dirname "$0")/../ios/.xcode.env.local" << EOF
export RCT_METRO_PORT=8081
export RCT_METRO_HOST=$LAN_IP
EOF
echo "✅ Configuration saved to ios/.xcode.env.local"

echo ""
echo "🏗️  Building and installing app on device..."
echo "   (This may take a few minutes on first build)"
echo ""

# Build the app
npx expo run:ios --device

echo ""
echo "✅ Done! Your app should now be running on your device."
echo "📝 Metro logs are available at: /tmp/metro.log"
