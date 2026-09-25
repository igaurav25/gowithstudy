import { describe, it, expect } from "vitest";
import { NotesService } from "@/services/notes-service";

describe("Integration: Notes CRUD, Search, and Ownership Boundaries", () => {
  const studentA = "usr_student_alpha_01";
  const studentB = "usr_student_beta_02";

  let studentANoteId = "";

  it("Step 1: Student A should create study materials", async () => {
    const note = await NotesService.createNote(studentA, {
      title: "Distributed Systems — Paxos and Raft Consensus",
      description: "Detailed analysis of state machine replication, leader election, and log compaction.",
      subject: "Distributed Systems",
      category: "Lecture Notes",
      tags: ["Distributed-Systems", "Paxos", "Raft", "Consensus"],
      fileUrl: "/notes/paxos-raft.pdf",
      fileName: "Paxos_Raft_CS402.pdf",
      fileSize: 3500000,
      status: "IN_PROGRESS",
    });

    expect(note.id).toBeDefined();
    expect(note.title).toContain("Paxos and Raft");
    expect(note.userId).toBe(studentA);
    expect(note.isArchived).toBe(false);

    studentANoteId = note.id;
  });

  it("Step 2: Student B creating notes should remain strictly isolated from Student A", async () => {
    await NotesService.createNote(studentB, {
      title: "Machine Learning — Gradient Descent Optimization",
      subject: "Machine Learning",
      category: "Lecture Notes",
      tags: ["ML", "Optimization"],
      status: "IN_PROGRESS",
    });

    const studentANotes = await NotesService.getNotes(studentA);
    const studentBNotes = await NotesService.getNotes(studentB);

    // Student A's note list should contain their note and not Student B's
    expect(studentANotes.some((n) => n.id === studentANoteId)).toBe(true);
    expect(studentBNotes.some((n) => n.id === studentANoteId)).toBe(false);
  });

  it("Step 3: Student B should be prevented from modifying Student A's note (IDOR Defense)", async () => {
    await expect(
      NotesService.updateNote(studentANoteId, studentB, {
        title: "Malicious Tampered Title by Intruder",
      })
    ).rejects.toThrow(/Note not found or unauthorized/);
  });

  it("Step 4: Student A updating their own note should succeed", async () => {
    const updated = await NotesService.updateNote(studentANoteId, studentA, {
      status: "COMPLETED",
      tags: ["Distributed-Systems", "Paxos", "Raft", "Consensus", "Exam-Ready"],
    });

    expect(updated.status).toBe("COMPLETED");
    expect(updated.tags).toContain("Exam-Ready");
  });

  it("Step 5: Should filter notes by subject, query, and category", async () => {
    const searchResults = await NotesService.getNotes(studentA, {
      query: "Paxos",
    });
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].id).toBe(studentANoteId);

    const filteredBySubject = await NotesService.getNotes(studentA, {
      subject: "Distributed Systems",
    });
    expect(filteredBySubject.length).toBeGreaterThan(0);

    const nonExistentSubject = await NotesService.getNotes(studentA, {
      subject: "Astronomy",
    });
    expect(nonExistentSubject.length).toBe(0);
  });

  it("Step 6: Should toggle archive state cleanly", async () => {
    const archived = await NotesService.toggleArchiveNote(studentANoteId, studentA);
    expect(archived.isArchived).toBe(true);

    const activeList = await NotesService.getNotes(studentA, { isArchived: false });
    expect(activeList.some((n) => n.id === studentANoteId)).toBe(false);

    const archivedList = await NotesService.getNotes(studentA, { isArchived: true });
    expect(archivedList.some((n) => n.id === studentANoteId)).toBe(true);

    // Unarchive
    const unarchived = await NotesService.toggleArchiveNote(studentANoteId, studentA);
    expect(unarchived.isArchived).toBe(false);
  });

  it("Step 7: Should calculate student note statistics and category counts", async () => {
    const stats = await NotesService.getNotesStats(studentA);

    expect(stats.total).toBeGreaterThan(0);
    expect(stats.subjectCounts).toBeDefined();
    expect(stats.subjectCounts["Distributed Systems"]).toBeGreaterThan(0);
  });

  it("Step 8: Student B cannot delete Student A's note; Student A can delete it", async () => {
    const intruderDeleteResult = await NotesService.deleteNote(studentANoteId, studentB);
    expect(intruderDeleteResult).toBe(false);

    const ownerDeleteResult = await NotesService.deleteNote(studentANoteId, studentA);
    expect(ownerDeleteResult).toBe(true);
  });
});
