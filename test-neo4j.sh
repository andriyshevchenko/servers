#!/bin/bash
# Neo4j Integration Test Script
# 
# This script demonstrates how to set up and test the Neo4j storage integration
# 
# Prerequisites:
# - Docker installed
# - Docker Compose installed

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
cd src/memory-enhanced

export NEO4J_URI=neo4j://localhost:7687
export NEO4J_USERNAME=neo4j
export NEO4J_PASSWORD=testpassword

npm test -- neo4j-e2e.test.ts

TEST_RESULT=$?

# Step 3: Clean up
echo ""
echo "Step 3: Cleaning up..."
cd ../..
docker-compose down -v

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
