# EventHub Recommendation Engine (Hybrid Algorithm)

This document outlines the technical implementation of the recommendation algorithm used in the EventHub platform to suggest events to students based on their interests.

## 1. Overview
The recommendation engine uses a **Hybrid Approach** combining **Jaccard Similarity** (for categorical tags) and a **Keyword Boosting** mechanism (for contextual descriptions).

## 2. Core Algorithm Components

### A. Jaccard Similarity (Tags)
Used to measure the similarity between the student's interest set and the event's tag set.
- **Intersection**: The count of tags that appear in both the student's profile and the event.
- **Union**: The count of all unique tags across both sets combined.
- **Formula**: `Score = Intersection / Union`
- **Result**: A value between `0` and `1`. A score of `1` means the tags match perfectly.

### B. Keyword Boosting (Description)
Analyzes the event's description for relevant keywords that might not have been explicitly tagged.
- **Logic**: For every interest keyword found in the event description, a small boost (`+0.05`) is added to the relevance score.
- **Purpose**: Captures relevant events even if the organizer was not thorough with tagging.

## 3. Implementation Workflow
The logic is implemented in the `getRecommendedEvents` function within `server/src/services/eventService.js`:

1.  **Data Normalization**: All tags and interests are converted to lowercase and trimmed to avoid case-sensitivity issues.
2.  **Dataset Retrieval**: All published events are fetched from the database.
3.  **Scoring**: Each event is processed to calculate its `relevanceScore`.
4.  **Sorting**:
  - Primary Sort: `relevanceScore` (Highest to Lowest).
  - Secondary Sort: `eventDate` (Soonest to Latest).
5.  **Limiting**: The top 10 most relevant events are returned to the dashboard.

## 4. Why this approach?
- **Accuracy**: Jaccard Similarity ensures that events with high tag overlap are prioritized.
- **Contextual Awareness**: The description boost ensures that context is not lost if tags are missing.
- **Performance**: The algorithm is lightweight enough to run in real-time for small-to-medium datasets without needing a dedicated search engine like ElasticSearch.

---
*Documented on: 2026-04-25*
