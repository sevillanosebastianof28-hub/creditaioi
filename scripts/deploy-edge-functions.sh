#!/bin/bash

# Edge Functions Deployment Script
# This script deploys all AI edge functions to Supabase

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 Deploying Edge Functions to Supabase"
echo "========================================"
echo ""

# Check if SUPABASE_ACCESS_TOKEN is set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ Error: SUPABASE_ACCESS_TOKEN is not set${NC}"
    echo ""
    echo "Please set your Supabase access token:"
    echo "  export SUPABASE_ACCESS_TOKEN='your-token-here'"
    echo ""
    echo "Get your token from: https://supabase.com/dashboard/account/tokens"
    exit 1
fi

# Check if project ref is set
PROJECT_REF="${SUPABASE_PROJECT_REF:-ctzckttucdjlysiohlwh}"
echo "📦 Project: $PROJECT_REF"
echo ""

# List of edge functions to deploy
FUNCTIONS=(
    "ai-orchestrator"
    "ai-smart-analyzer"
    "ai-credit-coach"
    "ai-intelligence-hub"
    "ai-goal-roadmap"
)

# Track deployment status
DEPLOYED=0
FAILED=0

# Deploy each function
for FUNCTION in "${FUNCTIONS[@]}"; do
    echo -e "${YELLOW}📤 Deploying: $FUNCTION${NC}"
    
    if npx supabase functions deploy "$FUNCTION" --project-ref "$PROJECT_REF" --no-verify-jwt; then
        echo -e "${GREEN}✅ Successfully deployed: $FUNCTION${NC}"
        ((DEPLOYED++))
    else
        echo -e "${RED}❌ Failed to deploy: $FUNCTION${NC}"
        ((FAILED++))
    fi
    echo ""
done

# Summary
echo "========================================"
echo "📊 Deployment Summary"
echo "========================================"
echo -e "${GREEN}✅ Deployed: $DEPLOYED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All edge functions deployed successfully!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some functions failed to deploy${NC}"
    exit 1
fi
