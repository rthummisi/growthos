# GrowthOS Release: Short-Form Video Channels

## Scope

This release adds planning-first support for two new channels:

- YouTube Shorts
- Instagram Reels

GrowthOS now treats these as first-class distribution channels during channel discovery, asset generation, approval, scheduling, and tracking.

## Included

- Shared channel model updated from 19 to 21 channels
- New channel agents for YouTube Shorts and Instagram Reels
- New placement type: `short-form-video`
- New asset types:
  - `video-script`
  - `storyboard`
  - `shot-list`
  - `caption-track`
  - `hook-set`
  - `thumbnail-copy`
- Deterministic short-form asset packet generation for local/test runs
- Persistence of multi-asset short-form planning packets in the existing asset store
- Approval Queue support for reviewing typed short-form assets
- Asset Studio support for editing short-form packet assets
- Tracking dashboard support for short-form KPIs:
  - views
  - average view duration
  - completion rate
  - shares
  - saves / subscriber lift
- Demo and fallback metric data updated to include short-form channels
- E2E coverage for short-form asset packet generation and short-form metric refresh

## Explicitly Not Included In This Release

- Automated video rendering
- AI-generated B-roll or avatar video export
- Automated publishing to Instagram Reels
- Automated publishing to YouTube Shorts
- Real platform auth and production analytics ingestion beyond the existing integration pattern

## Product Intent

This release makes GrowthOS capable of planning and managing short-form video promotion for AI and developer tools without pretending to be a full autonomous video production system yet.
