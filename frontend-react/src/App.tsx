import { useEffect, useState } from 'react';
import type { CourseProgress, LearnerProgressResponse } from './types';
import { trackEvent } from './analytics';

const DEFAULT_LEARNER_ID = 1;

const LEARNERS = [
  { id: 1, label: 'Learner 1: 3 courses in progress' },
  { id: 2, label: 'Learner 2: 1 course in progress' },
  { id: 3, label: 'Learner 3: nothing in progress (empty state)' },
  { id: 999, label: 'Learner 999 — unknown (error state)' },
];

const TIME_FILTERS: { label: string; value: number | null }[] = [
  { label: 'Any time', value: null },
  { label: '≤ 15 min', value: 15 },
  { label: '≤ 30 min', value: 30 },
  { label: '≤ 60 min', value: 60 },
];

// Error message helper function
function errorMessage(res: Response, learnerId: number): string {
  if (res.status === 400) return `"${learnerId}" is not a valid learner ID.`;
  if (res.status === 404) return `Learner ${learnerId} was not found.`;
  return 'Something went wrong on our side. Please try again.';
}

// Convert the ISO date string to a localized string
function formatLocal(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function App() {
  const [learnerId, setLearnerId] = useState(DEFAULT_LEARNER_ID);
  const [courses, setCourses] = useState<CourseProgress[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [maxMinutes, setMaxMinutes] = useState<number | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  const onLearnerChange = (id: number) => {
    setLearnerId(id);
    setMaxMinutes(null);
    setReloadCount(0);
  };

  useEffect(() => {
    const controller = new AbortController();
    setCourses(null);
    setError(null);

    fetch(`/api/learners/${learnerId}/progress`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(errorMessage(res, learnerId));
        }
        const body = (await res.json()) as LearnerProgressResponse;
        setCourses(body.courses);
        trackEvent({
          type: 'course_progress_viewed',
          learnerId: String(learnerId),
          courseCount: body.courses.length,
        }); // Track course progress viewed event
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          err instanceof TypeError
            ? 'Could not reach the server. Check that the backend is running.'
            : err instanceof Error
              ? err.message
              : 'Something went wrong.',
        );
      });

    return () => controller.abort();
  }, [learnerId, reloadCount]);

  return (
    <main className="page">
      <p className="eyebrow">Docebo · pilot</p>
      <h1>My progress</h1>

      {/* Learner Filter */}
      <div className="toolbar">
        <label className="field">
          <span>Viewing as</span>
          <select value={learnerId} onChange={(e) => onLearnerChange(Number(e.target.value))}>
            {LEARNERS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn" onClick={() => {
          setReloadCount((c) => c + 1);
        }} disabled={courses === null}>
          Refresh
        </button>
      </div>
      <p className="lede">In-progress courses for learner {learnerId}.</p>
      {error ? (
        <p role="alert">{error}</p>
      ) : courses === null ? (
        <p role="status">Loading…</p>
      ) : courses.length === 0 ? (
        <p>No courses in progress.</p>
      ) : (
        <>

        {/* Time Filter */}
          <div className="chips" role="group" aria-label="Time I have available">
            <span className="chips-label">I have:</span>
            {TIME_FILTERS.map((filter) => (
              <button
                key={filter.label}
                type="button"
                className={`chip${maxMinutes === filter.value ? ' chip-active' : ''}`}
                onClick={() => {
                  setMaxMinutes(filter.value ?? null);
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <CourseList
            learnerId={String(learnerId)}
            courses={
              maxMinutes === null
                ? courses
                : courses.filter((course) => course.estimatedMinutesRemaining <= maxMinutes)
            }
          />
        </>
      )}
    </main>
  );
}

function CourseList({ learnerId, courses }: { learnerId: string; courses: CourseProgress[] }) {
  if (courses.length === 0) {
    return <p>No courses match this time filter.</p>;
  }
  return (
    <>
      <ul className="course-list">
        {courses.map((course) => (
          <li
            key={course.courseId}
            className="course"
            onClick={() =>
              trackEvent({
                type: 'course_selected',
                learnerId: String(learnerId),
                courseId: course.courseId,
                title: course.title,
              }) // Add analytics tracking for course selection
            }
          >
            <h2>{course.title}</h2>
            <p className="meta">
              {course.completionPercentage}% · {formatLocal(course.lastActivityAt)} ·{' '}
              {course.estimatedMinutesRemaining} min left
            </p>
            {course.isStale ? <span className="badge">Inactive</span> : null}
          </li>
        ))}
      </ul>
    </>
  );
}