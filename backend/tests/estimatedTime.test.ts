import { enrollments, knownLearnerIds } from '../src/data/seed';
import { getInProgressCourses, AVG_MINUTES_PER_LESSON } from '../src/services/progressService';

describe('Estimated Time Calculations', () => {
  describe('Learner 1', () => {
    it('should have 3 in-progress courses', () => {
      const courses = getInProgressCourses(1);
      expect(courses).toHaveLength(3);
    });

    it('course-onboarding: 2 incomplete lessons = 20 minutes', () => {
      const courses = getInProgressCourses(1);
      const course = courses.find((c) => c.courseId === 'course-onboarding');
      expect(course).toBeDefined();
      expect(course!.estimatedMinutesRemaining).toBe(2 * AVG_MINUTES_PER_LESSON);
      expect(course!.estimatedMinutesRemaining).toBe(20);
    });

    it('course-leadership: 2 incomplete lessons = 20 minutes', () => {
      const courses = getInProgressCourses(1);
      const course = courses.find((c) => c.courseId === 'course-leadership');
      expect(course).toBeDefined();
      expect(course!.estimatedMinutesRemaining).toBe(2 * AVG_MINUTES_PER_LESSON);
      expect(course!.estimatedMinutesRemaining).toBe(20);
    });

    it('course-compliance: 1 incomplete lesson = 10 minutes', () => {
      const courses = getInProgressCourses(1);
      const course = courses.find((c) => c.courseId === 'course-compliance');
      expect(course).toBeDefined();
      expect(course!.estimatedMinutesRemaining).toBe(1 * AVG_MINUTES_PER_LESSON);
      expect(course!.estimatedMinutesRemaining).toBe(10);
    });

    it('should be sorted by lastActivityAt descending (most recent first)', () => {
      const courses = getInProgressCourses(1);
      // course-leadership (2 days ago) > course-onboarding (4 days ago) > course-compliance (54 days ago)
      expect(courses[0].courseId).toBe('course-leadership');
      expect(courses[1].courseId).toBe('course-onboarding');
      expect(courses[2].courseId).toBe('course-compliance');
    });

    it('course-compliance should be marked stale (>30 days)', () => {
      const courses = getInProgressCourses(1);
      const course = courses.find((c) => c.courseId === 'course-compliance');
      expect(course!.isStale).toBe(true);
    });

    it('other courses should not be stale (<30 days)', () => {
      const courses = getInProgressCourses(1);
      const onboarding = courses.find((c) => c.courseId === 'course-onboarding');
      const leadership = courses.find((c) => c.courseId === 'course-leadership');
      expect(onboarding!.isStale).toBe(false);
      expect(leadership!.isStale).toBe(false);
    });
  });

  describe('Learner 2', () => {
    it('should have 1 in-progress course', () => {
      const courses = getInProgressCourses(2);
      expect(courses).toHaveLength(1);
    });

    it('course-safety: 1 incomplete lesson = 10 minutes', () => {
      const courses = getInProgressCourses(2);
      const course = courses[0];
      expect(course.courseId).toBe('course-safety');
      expect(course.estimatedMinutesRemaining).toBe(1 * AVG_MINUTES_PER_LESSON);
      expect(course.estimatedMinutesRemaining).toBe(10);
    });
  });


  describe('Unknown Learner', () => {
    it('should throw NotFoundError for unknown learner 999', () => {
      expect(() => getInProgressCourses(999)).toThrow('Learner 999 not found');
    });
  });

  describe('Formula Verification', () => {
    it('should use 10 minutes per lesson as default', () => {
      expect(AVG_MINUTES_PER_LESSON).toBe(10);
    });

    it('should calculate: incomplete_count × 10', () => {
      const enrollment = enrollments.find((e) => e.courseId === 'course-onboarding');
      if (enrollment) {
        const incompleteCount = enrollment.lessons.filter((l) => !l.completed).length;
        expect(incompleteCount).toBe(2);
        expect(incompleteCount * AVG_MINUTES_PER_LESSON).toBe(20);
      }
    });
  });
});
