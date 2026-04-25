#!/bin/bash
# GOLEM Deploy Script — run this from the GOLEM directory
# Usage: bash deploy.sh

set -e

echo "🔧 Cleaning up git state..."
rm -f .git/index.lock .git/index2 .git/index2.lock .git/HEAD.lock .git/objects/maintenance.lock

echo "⏪ Undoing bad commit (files are safe on disk)..."
git reset HEAD~1

echo "📦 Staging all changes..."
git add -A

echo "📝 Committing..."
git commit -m "Major fixes: AI always works, dynamic conversations, multi-figure intro, language support

- AI: Browser-direct Anthropic with CORS header, aggressive fallback chain
- AI: Language injection (EN/ES/HE) into all AI prompts
- Identity/LifeDirection/Golem: Local fallback synthesis when AI unavailable
- Conversations: ALL templates replaced with profile-computed responses
- Scoring: Real multi-factor compatibility engine
- Synastry: Synthesis summaries with real framework analysis
- Patterns: Rich 3-section synthesis overlay
- Fishbowl: Dynamic pair rotation across constellation
- Intro: Random sacred geometry (Merkaba, Ankh, Pyramid, Dragon, Tree of Life, Hexagram)
- TopBar: Language picker + computePersonData for ASC fix
- Ritual: New engine + widget + detail (16 rituals, 12 traditions)
- Store v8 migration

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

echo "🚀 Pushing to GitHub (triggers Vercel deploy)..."
git push

echo "✅ Done! Vercel will auto-deploy in ~60 seconds."
