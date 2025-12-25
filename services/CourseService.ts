
import { INITIAL_COURSES } from '../constants';
import { Course } from '../types';

export const CourseService = {
  /**
   * Returns all available official courses.
   * Simulating an async API call.
   */
  getAvailableCourses: async (): Promise<Course[]> => {
    return new Promise((resolve) => {
      // Simulate network latency
      setTimeout(() => {
        resolve(INITIAL_COURSES);
      }, 300);
    });
  },

  /**
   * Returns details for a specific course by ID.
   */
  getCourseContent: async (courseId: string): Promise<Course | null> => {
    return new Promise((resolve) => {
      const course = INITIAL_COURSES.find(c => c.id === courseId);
      setTimeout(() => {
        resolve(course || null);
      }, 300);
    });
  }
};
