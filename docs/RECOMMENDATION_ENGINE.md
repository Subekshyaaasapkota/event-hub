# Recommendation Engine

How EventHub decides which events to show a student.

## What runs where

The scoring and sorting live in `server/src/utils/recommendationEngine.js`.
`getRecommendedEvents` in `server/src/services/eventService.js` orchestrates:
it loads the user, fetches the events, calls the two helpers and trims the
result. There is no scoring logic in the service itself.

## The two parts of the score

### Jaccard similarity over tags

Compares the student's `interestedSkills` against the event's `tags`.

```js
const intersection = userInterests.filter((tag) => eventTags.includes(tag));
const union = new Set([...userInterests, ...eventTags]);
const jaccardScore = union.size > 0 ? intersection.length / union.size : 0;
```

Both sides are lowercased and trimmed first, so `React` and `react ` are the
same interest. The result is between 0 and 1.

Worth knowing: the union includes the student's own interests, so adding more
interests can lower the score for any single event. That is how Jaccard
works, not a bug, but it surprises people who assume more interests means
higher scores.

### Keyword boost over the description

Every interest that appears as a substring of the description adds `0.05`.

```js
if (description.includes(keyword)) descriptionBoost += 0.05;
```

This catches events whose organizer tagged them poorly. It is a substring test,
not a word test, so an interest of `go` also matches `google`. At this scale
that is acceptable; it is a rough edge, not a design.

The final score is `jaccardScore + descriptionBoost`, so the boost can push a
value above 1. Nothing depends on the score staying in range, but do not read
it as a percentage.

## Sorting

Primary key is `relevanceScore` descending. Ties break on `eventDate`
ascending, so equally relevant events show the soonest first.

## The two behaviours that surprise people

Both of these are in `getRecommendedEvents` and neither is obvious from the
scoring alone.

**With interests set, events that score zero are dropped entirely.**

```js
events = events.filter((event) => event.relevanceScore > 0);
```

The result is fewer than 10, or none at all. A student with interests of
`Rust` and `Embedded` sees an empty list in a project with no matching events,
rather than a fallback list of upcoming ones. This is deliberate: showing
unrelated events would make the feature look broken. It does mean the dashboard
can be empty on purpose.

**With no interests set, scoring is skipped entirely.**

The user has no `interestedSkills`, so the function does not score or filter at
all. It sorts every published event by date ascending and returns the next 10.
The same endpoint therefore behaves completely differently depending on how
complete the student's profile is, with no error and nothing in the response
saying which mode ran.

## Cost

Every call loads all published events and scores them in memory. There is no
index, no cache and no precomputation. That is the right trade at this scale
and it is the thing to revisit first if event count grows into the thousands.

Only `published` events are ever considered, in both branches.
