import { NotesService } from "@/services/notes-service";
import { SyllabusService } from "@/services/syllabus-service";
import { UnifiedCitation } from "@/services/search/types";

export class InternalDbRetriever {
  /**
   * Search across user's notes, syllabus, and college info
   */
  static async search(
    userId: string,
    query: string
  ): Promise<UnifiedCitation[]> {
    const citations: UnifiedCitation[] = [];
    const qLower = query.toLowerCase();
    const queryTerms = qLower.split(/\s+/).filter((w) => w.length > 2);

    try {
      // 1. Search in Notes
      const notes = await NotesService.getNotes(userId);
      for (const note of notes) {
        const matchesTitle = queryTerms.some((t) => note.title.toLowerCase().includes(t));
        const matchesSubject = queryTerms.some((t) => note.subject.toLowerCase().includes(t));
        const matchesTags = note.tags.some((tag) => queryTerms.some((t) => tag.toLowerCase().includes(t)));

        if (matchesTitle || matchesSubject || matchesTags) {
          citations.push({
            id: `db_note_${note.id}`,
            sourceType: "CAMPUSFLOW_DB",
            title: `Student Note: ${note.title}`,
            domain: "campusflow.local/notes",
            url: `/dashboard/notes?id=${note.id}`,
            snippet: note.description || `Subject: ${note.subject} | Status: ${note.status}`,
            retrievalTime: new Date().toISOString(),
            confidenceScore: 0.92,
            isPrimaryAuthoritative: true,
          });
        }
      }

      // 2. Search in Accredited Syllabus
      const allCourses = SyllabusService.getAllCourses();
      for (const course of allCourses) {
        const matchesCourse =
          queryTerms.some((t) => course.title.toLowerCase().includes(t)) ||
          queryTerms.some((t) => course.courseCode.toLowerCase().includes(t));

        if (matchesCourse) {
          citations.push({
            id: `db_syllabus_${course.id}`,
            sourceType: "CAMPUSFLOW_DB",
            title: `B.Tech Syllabus: ${course.courseCode} — ${course.title}`,
            domain: "campusflow.local/syllabus",
            url: `/dashboard/syllabus?course=${course.id}`,
            snippet: course.description,
            retrievalTime: new Date().toISOString(),
            confidenceScore: 0.95,
            isPrimaryAuthoritative: true,
          });
        }
      }
    } catch {
      // Return empty if any error
    }

    return citations.slice(0, 3);
  }
}
