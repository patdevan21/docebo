# Product Specification

## Overview

Learner Progress UI is a React-based application that displays a learner's in-progress courses, filters them by time remaining, and allows switching between different learner profiles for testing and demonstration.

## Key Features

### 1. Course Progress Display
- Shows completion percentage, last activity time (in local timezone), and estimated time remaining
- Displays "Inactive" badge for courses with no activity in 30+ days

### 2. Time Filter
- Allows users to filter courses by estimated completion time (≤15 min, ≤30 min, ≤60 min)
- Client-side filtering with no additional API calls

### 3. Learner Switcher
- Dropdown to switch between predefined learners (1, 2, 3, 999)
- State-based selection (no URL manipulation)
- Resets time filter when switching learners
- Each learner demonstrates different states:
  - **Learner 1**: 3 in-progress courses (happy path)
  - **Learner 2**: 1 in-progress course (single-course case)
  - **Learner 3**: No in-progress courses (empty state)
  - **Learner 999**: Unknown learner (404 error state)

### 4. Estimated Time Remaining
- Backend computes remaining minutes for each course
- Formula: `remaining_lesson_count × 10 minutes per lesson`
- Assumes average lesson duration of 10 minutes (constant `AVG_MINUTES_PER_LESSON`)

### 5. Error Handling
- Loading states with "Loading…" message
- Specific error messages for:
  - 400: Invalid learner ID
  - 404: Unknown learner
  - 500: Server errors
  - Network errors (backend not running)
- Request cancellation when switching learners

### 6. Refresh Button
- Allows manual data refresh for the current learner
- Triggers new API request with current filter preserved
- Disabled while loading

## Analytics Instrumentation

### Events Tracked

Events are logged to the browser console in structured JSON format with ISO timestamps.

1. **`course_progress_viewed`**
   - Fired when course list successfully loads
   - Includes: `learnerId`, `courseCount`
   - Use case: Measure when users view their progress

2. **`course_selected`**
   - Fired when user clicks on a course
   - Includes: `learnerId`, `courseId`, `title`
   - Use case: Identify popular or frequently accessed courses

### Implementation

Analytics are implemented in `src/analytics.ts` with:
- TypeScript-defined event types for type safety
- `trackEvent()` function that logs to console with ISO timestamp

Console output example:
```
[analytics] {"timestamp":"2026-10-27T02:46:00.000Z","type":"course_progress_viewed","learnerId":"1","courseCount":3}
```

## Architecture Notes

### State Management
- **learnerId**: Controlled by dropdown, starts with `DEFAULT_LEARNER_ID` (1)
- **courses**: API response data
- **maxMinutes**: Time filter selection (client-side filtering)
- **reloadCount**: Trigger for manual refresh (incremented on Refresh button)
- **error**: User-facing error message

### Timezone Handling
- Backend: Stores all timestamps in UTC (ISO-8601)
- Frontend: `formatLocal()` converts to viewer's local timezone and locale

## Future Enhancements

- Real analytics backend integration (POST to `/api/analytics/events`)
- User authentication and session tracking
- Course completion tracking and milestone notifications
- Learning path recommendations based on time filter patterns and usage
- Performance monitoring and error rate tracking

