export const sortEventsPriority = (events) => {
  if (!Array.isArray(events)) return [];

  const now = new Date();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const p1_deadlineSoon = [];
  const p2_startingSoon = [];
  const p3_others = [];
  const p4_expired = [];

  events.forEach((event) => {
  let handled = false;
  const eventDate = event.eventDate ? new Date(event.eventDate) : null;
  const deadline = event.deadline ? new Date(event.deadline) : null;

  // Check if event date has already passed OR registration deadline has passed
  if ((eventDate && eventDate < now) || (deadline && deadline < now)) {
  p4_expired.push(event);
  handled = true;
  }
  // Check if registration deadline is expiring within 24 hours
  else if (
  deadline &&
  deadline >= now &&
  (deadline.getTime() - now.getTime()) <= ONE_DAY_MS
  ) {
  p1_deadlineSoon.push(event);
  handled = true;
  }
  // Check if event start date is within 24 hours
  else if (
  eventDate &&
  eventDate >= now &&
  (eventDate.getTime() - now.getTime()) <= ONE_DAY_MS
  ) {
  p2_startingSoon.push(event);
  handled = true;
  }

  // Regular active events (upcoming)
  if (!handled) {
  p3_others.push(event);
  }
  });

  // Sort sub-groups by earliest date first to make it even more intuitive
  p1_deadlineSoon.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  p2_startingSoon.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

  // P3: Nearest upcoming event date first
  p3_others.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

  // P4: Expired events (sort newest expired first for relevance)
  p4_expired.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));

  // Final return: P1 -> P2 -> P3 -> P4
  return [...p1_deadlineSoon, ...p2_startingSoon, ...p3_others, ...p4_expired];
};
