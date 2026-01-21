#!/bin/bash
# Neo4j Integration Test Script
# 
# This script demonstrates how to set up and test the Neo4j storage integration
# 
# Prerequisites:
# - Docker installed
# - Docker Compose installed
# 
# Usage: bash test-neo4j.sh
# Or make executable: chmod +x test-neo4j.sh && ./test-neo4j.sh

set -e  # Exit on error

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Trap to ensure cleanup runs even if script fails or is interrupted
cleanup() {
    echo ""
    echo "Step 3: Cleaning up..."
    docker-compose down -v
}
trap cleanup EXIT INT TERM

echo "=== Neo4j Storage Integration Test ==="
echo ""

# Step 1: Start Neo4j using Docker Compose
echo "Step 1: Starting Neo4j with Docker Compose..."
docker-compose up -d neo4j

# Wait for Neo4j to be ready
echo "Waiting for Neo4j to be ready (30 seconds)..."
sleep 30

# Check if Neo4j is running
if ! docker-compose ps | grep -q "neo4j.*Up"; then
    echo "Error: Neo4j failed to start"
    exit 1
fi

echo "✓ Neo4j is running"
echo ""

# Step 2: Run the E2E tests with Neo4j
echo "Step 2: Running E2E tests with Neo4j..."
cd "$SCRIPT_DIR/src/memory-enhanced"

export NEO4J_URI=neo4j://localhost:7687
export NEO4J_USERNAME=neo4j
export NEO4J_PASSWORD=testpassword

npm test -- neo4j-e2e.test.ts

TEST_RESULT=$?

# Return to script directory
cd "$SCRIPT_DIR"

if [ $TEST_RESULT -eq 0 ]; then
    echo ""
    echo "✓ All tests passed!"
    echo ""
    echo "To access Neo4j Browser: http://localhost:7474"
    echo "Username: neo4j"
    echo "Password: testpassword"
    exit 0
else
    echo ""
    echo "✗ Tests failed"
    exit 1
fi
