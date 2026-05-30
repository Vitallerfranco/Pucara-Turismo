#!/bin/bash
# Quick Start Script - Pucará Turismo Development

echo "🏔️ Pucará Turismo - Quick Start Guide"
echo "======================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo "✓ npm version: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check .env.local
echo ""
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found"
    echo "Creating from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your Supabase credentials"
    echo ""
fi

# Run development server
echo ""
echo "🚀 Starting development server..."
echo "Server will be available at: http://localhost:3000"
echo ""
echo "Available commands:"
echo "  npm run dev        - Start development server"
echo "  npm run build      - Build for production"
echo "  npm run preview    - Preview production build"
echo "  npm run lint       - Run linter"
echo "  npm run format     - Format code"
echo ""

npm run dev
