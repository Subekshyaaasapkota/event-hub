/**
 * Calculates the relevance score for an event based on student interests.
 * Uses Hybrid Algorithm: Jaccard Similarity (Tags) + Keyword Boosting (Description).
 * 
 * @param {Object} event - The event object from MongoDB.
 * @param {Array<string>} userInterests - Array of normalized interest strings.
 * @returns {number} The calculated relevance score.
 */
export const calculateRelevanceScore = (event, userInterests) => {
  if (!userInterests || userInterests.length === 0) return 0;

  const eventTags = (event.tags || []).map((t) => t.toLowerCase().trim());
  const description = (event.description || "").toLowerCase();

  // --- 1. Jaccard Similarity (Tags) ---
  const intersection = userInterests.filter((tag) => eventTags.includes(tag));
  const union = new Set([...userInterests, ...eventTags]);
  
  const jaccardScore = union.size > 0 ? intersection.length / union.size : 0;

  // --- 2. Keyword Boosting (Description) ---
  let descriptionBoost = 0;
  userInterests.forEach((keyword) => {
  if (description.includes(keyword)) {
  descriptionBoost += 0.05; // 5% boost per keyword match
  }
  });

  return jaccardScore + descriptionBoost;
};

/**
 * Sorts a list of events by relevance score and date.
 * 
 * @param {Array} events - List of events with relevanceScore attached.
 * @returns {Array} Sorted list of events.
 */
export const sortEventsByRelevance = (events) => {
  return events.sort((a, b) => {
  // Primary: Relevance Score (Descending)
  if (b.relevanceScore !== a.relevanceScore) {
  return b.relevanceScore - a.relevanceScore;
  }
  // Secondary: Event Date (Ascending - Soonest first)
  return new Date(a.eventDate) - new Date(b.eventDate);
  });
};
