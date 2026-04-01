#!/bin/bash
# Google Auth Debugging Script
# This script monitors server logs and helps debug the Google authentication flow

echo "🔍 Google Authentication Debug Monitor"
echo "========================================"
echo ""
echo "✅ Server is running at: http://localhost:3000"
echo ""
echo "📋 INSTRUCTIONS:"
echo "1. Open http://localhost:3000/signin in your browser"
echo "2. Click 'Continue with Google'"
echo "3. Complete the Google sign-in"
echo "4. This script will show you exactly what happens"
echo ""
echo "Press Ctrl+C to stop monitoring"
echo ""
echo "========================================"
echo "Watching logs..."
echo ""

# Monitor the log file in real-time
tail -f /tmp/darksphere-dev.log | grep --line-buffered -E "\[Callback\]|\[Google Auth\]|Error|error|POST /api/auth/google|POST /auth/callback|prisma:query"
