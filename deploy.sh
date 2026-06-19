cat > deploy.sh << 'EOF'
#!/bin/bash

# ✅ REPLACE WITH YOUR ACTUAL FIREBASE CONFIG VALUES

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDi-i5DefCST0I46D2q8NugWrXDQM0oQuA
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chatverse-a419c.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chatverse-a419c
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=chatverse-a419c.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=894123408372
NEXT_PUBLIC_FIREBASE_APP_ID=1:894123408372:web:649b61462bddbadc3497a1

echo "🚀 Deploying WhatsApp Clone to Vercel..."

# Build
echo "📦 Building..."
npm run build

# Deploy
echo "📤 Deploying to Vercel..."
vercel --prod \
  --env NEXT_PUBLIC_FIREBASE_API_KEY="$API_KEY" \
  --env NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="$AUTH_DOMAIN" \
  --env NEXT_PUBLIC_FIREBASE_PROJECT_ID="$PROJECT_ID" \
  --env NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="$STORAGE_BUCKET" \
  --env NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="$SENDER_ID" \
  --env NEXT_PUBLIC_FIREBASE_APP_ID="$APP_ID"

echo "✅ Deployment complete!"
echo "🌐 Visit: https://whatsapp-clone.vercel.app"
EOF

chmod +x deploy.sh
