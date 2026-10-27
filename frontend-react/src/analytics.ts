export type AnalyticsEvent =
  | { type: 'course_progress_viewed'; learnerId: string; courseCount: number }
  | { type: 'course_selected'; learnerId: string; courseId: string; title: string };

export function trackEvent(event: AnalyticsEvent): void {
  const timestamp = new Date().toISOString();
  const payload = { timestamp, ...event };
  
  // Log to console for development/debugging
  console.log('[analytics]', JSON.stringify(payload));
  
}
