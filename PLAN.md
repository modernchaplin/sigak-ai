# SIGAK.AI MVP Upgrade Plan

## Goal
Upgrade SIGAK.AI from a card-like MVP into a stronger Korean AI-era perspective archive without adding out-of-scope product features.

## Current Findings
- Main app entry is `app/page.tsx`, rendering `SigakHome` with `data/sigak.mvp.json`.
- `app/components/sigak-home.tsx` already supports state-based `home / axis / detail` navigation.
- Content is already mostly data-driven through axis topics, sections, tags, and related IDs.
- The biggest gaps are content consistency, representative detail depth, related-link coherence, and visual hierarchy.

## Implementation Steps
1. Add project rules in `AGENTS.md` so future edits preserve the SIGAK.AI direction.
2. Normalize content IDs and related IDs for long-term expansion.
3. Add/complete representative topics: AGI 타임라인, AlphaGo, Demis Hassabis, 코딩, AI는 도구인가 환경인가.
4. Add lightweight placeholder topics required by related links, such as ChatGPT, AI Agent, AlphaFold.
5. Update detail rendering to use `timelineItems` and keep a shared template.
6. Strengthen home, axis, and detail UI hierarchy while preserving black/white/yellow visual identity.
7. Run lint and build; fix any failures.

## Scope Guardrails
- No login, DB, search, comments, community, admin, crawling, AI generation, external APIs, or new main axes.
- Keep navigation state-based for now, but keep hashes and topic IDs route-ready.
