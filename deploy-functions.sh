#!/bin/bash

# Edge Functions Deployment Script
# 
# This script deploys all AI edge functions to your Supabase project.
# 
# Prerequisites:
# 1. Supabase CLI installed (npx supabase@latest)
# 2. A valid Supabase access token with deployment permissions
#
# Get your access token from: https://supabase.com/dashboard/account/tokens
#
# Usage:
#   ./deploy-functions.sh YOUR_ACCESS_TOKEN
#   
# Or set as environment variable:
#   export SUPABASE_ACCESS_TOKEN="your_token_here"
#   ./deploy-functions.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check for access token
if [ -n "$1" ]; then
    export SUPABASE_ACCESS_TOKEN="$1"
elif [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ Error: Supabase access token required${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo "  ./deploy-functions.sh YOUR_ACCESS_TOKEN"
    echo ""
    echo "Or set as environment variable:"
    echo "  export SUPABASE_ACCESS_TOKEN=\"your_token_here\""
    echo "  ./deploy-functions.sh"
    echo ""
    echo -e "${BLUE}Get your access token from:${NC}"
    echo "  https://supabase.com/dashboard/account/tokens"
    echo ""
    echo -e "${YELLOW}Required token scopes:${NC}"
    echo "  - Edge Functions (all)"
    echo "  - Project Settings (read)"
    exit 1
fi

# Get project ref from .env
PROJECT_REF=$(grep VITE_SUPABASE_PROJECT_ID .env | cut -d '=' -f2 | tr -d '"')

if [ -z "$PROJECT_REF" ]; then
    echo -e "${RED}❌ Error: Could not find VITE_SUPABASE_PROJECT_ID in .env${NC}"
    exit 1
fi

echo -e "${BLUE}🚀 Deploying Edge Functions to Supabase Project: ${PROJECT_REF}${NC}"
echo ""

# List of functions to deploy
FUNCTIONS=(
    "ai-orchestrator"
    "ai-smart-analyzer"
    "ai-credit-coach"
    "ai-intelligence-hub"
    "ai-goal-roadmap"
)

# Deploy each function
SUCCESS_COUNT=0
FAILED_COUNT=0
FAILED_FUNCTIONS=()

for func in "${FUNCTIONS[@]}"; do
    echo -e "${YELLOW}📦 Deploying: ${func}${NC}"
    
    if npx supabase@latest functions deploy "$func" --project-ref "$PROJECT_REF" --no-verify-jwt; then
        echo -e "${GREEN}✅ Successfully deployed: ${func}${NC}"
        ((SUCCESS_COUNT++))
    else
        echo -e "${RED}❌ Failed to deploy: ${func}${NC}"
        ((FAILED_COUNT++))
        FAILED_FUNCTIONS+=("$func")
    fi
    echo ""
done

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deployed: ${SUCCESS_COUNT}${NC}"
echo -e "${RED}❌ Failed: ${FAILED_COUNT}${NC}"

if [ $FAILED_COUNT -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}Failed functions:${NC}"
    for func in "${FAILED_FUNCTIONS[@]}"; do
        echo "  - $func"
    done
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "  1. Verify your access token has the correct scopes"
    echo "  2. Check https://supabase.com/dashboard/account/tokens"
    echo "  3. Ensure you have deployment permissions for this project"
    echo "  4. Try: npx supabase@latest functions deploy FUNCTION_NAME --project-ref $PROJECT_REF"
    exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}🎉 All edge functions deployed successfully!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Test the deployment: node scripts/test-ai-realtime.js"
echo "  2. Check function logs: npx supabase@latest functions logs FUNCTION_NAME"
echo "  3. Monitor at: https://supabase.com/dashboard/project/$PROJECT_REF/functions"
echo ""
