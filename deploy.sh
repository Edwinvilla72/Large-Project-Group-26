#!/bin/bash
echo "🚨 Hello from test deploy!" >> /tmp/deploy-test.log
cd /opt/bitnami/projects/cards/backend || exit

echo "🚀 Pulling latest code..."
git pull origin main

echo "📦 Installing backend dependencies..."
npm install

echo "🔄 Restarting backend..."
pm2 restart backend

echo "🎨 Installing frontend dependencies..."
cd /opt/bitnami/projects/cards/frontend
npm install

echo "⚡ Restarting frontend..."
pm2 restart frontend

