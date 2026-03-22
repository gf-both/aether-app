#!/bin/bash
# start-memory.sh — Start the GOLEM memory layer (Graphiti + Neo4j)
# Run this before using Watercooler memory or RelatEngine

set -e

echo "🧠 Starting GOLEM Memory Layer..."

# 1. Start Neo4j if not running
if ! brew services list | grep -q "neo4j.*started"; then
  echo "  Starting Neo4j..."
  brew services start neo4j
  sleep 4
  echo "  ✅ Neo4j started"
else
  echo "  ✅ Neo4j already running"
fi

# 2. Check ANTHROPIC_API_KEY
if [ -z "$ANTHROPIC_API_KEY" ]; then
  # Try loading from golem-app .env
  if [ -f "$(dirname "$0")/../.env" ]; then
    export $(grep -v '^#' "$(dirname "$0")/../.env" | xargs)
    echo "  ✅ Loaded .env"
  else
    echo "  ⚠️  ANTHROPIC_API_KEY not set — set it in ~/golem-app/.env"
  fi
fi

# 3. Start Graphiti memory API
echo "  Starting memory API on :8765..."
cd "$(dirname "$0")/.."
python3.11 src/memory/graphitiMemory.py server
