#!/bin/bash

cd /opt/bitnami/projects/cards || exit

echo "🚀 Pulling latest code..."
git pull origin main

echo "📦 Installing backend dependencies..."
npm install

echo "🔄 Restarting backend..."
pm2 restart backend

echo "🎨 Installing frontend dependencies..."
cd frontend
npm install

echo "⚡ Restarting frontend..."
pm2 restart frontend

