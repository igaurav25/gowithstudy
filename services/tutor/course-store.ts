import { TutorCourse, StudentTutorProgress } from "@/services/tutor/types";

/**
 * Shared in-memory registry for Tutor Courses and Student Learning Progress
 */
export const globalCourseStore = new Map<string, TutorCourse>();
export const globalProgressStore = new Map<string, StudentTutorProgress>();
