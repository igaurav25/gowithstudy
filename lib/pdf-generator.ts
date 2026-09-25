/**
 * CampusFlow Clean Academic PDF Generator
 * Uses jsPDF to generate publication-grade, printable A4 student lecture notes and syllabus sheets.
 */
import jsPDF from "jspdf";
import { NoteItem } from "@/services/notes-service";

export interface PDFExportOptions {
  includeSyllabus?: boolean;
  includeViva?: boolean;
  watermark?: boolean;
}

export function generateNotePDF(note: NoteItem, options: PDFExportOptions = {}): jsPDF {
  const { includeSyllabus = true, includeViva = true } = options;

  // Initialize A4 document (210 x 297 mm)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const primaryColor: [number, number, number] = [79, 70, 229]; // Indigo-600
  const secondaryColor: [number, number, number] = [15, 23, 42]; // Slate-900
  const mutedColor: [number, number, number] = [100, 116, 139]; // Slate-500
  const lightBgColor: [number, number, number] = [248, 250, 252]; // Slate-50

  // Helper to check page break
  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - margin - 10) {
      doc.addPage();
      cursorY = margin + 12; // leave room for running header
    }
  };

  // 1. Top Decorative Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 6, "F");

  // Sub-header branding
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text("CAMPUSFLOW ACADEMIC REPOSITORY • ACCREDITED B.TECH CSE STUDY MATERIAL", margin, cursorY + 4);
  cursorY += 9;

  // 2. Main Title & Subject
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...secondaryColor);
  const titleLines = doc.splitTextToSize(note.title, contentWidth);
  doc.text(titleLines, margin, cursorY);
  cursorY += titleLines.length * 7 + 2;

  // Subject and Category Subtitle
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text(`${note.subject.toUpperCase()} • ${note.category.toUpperCase()}`, margin, cursorY);
  cursorY += 6;

  // 3. Metadata Info Box
  checkPageBreak(25);
  doc.setFillColor(...lightBgColor);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, cursorY, contentWidth, 20, 2, 2, "FD");

  const formattedDate = new Date(note.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedColor);

  const col1 = margin + 4;
  const col2 = margin + contentWidth / 2;

  doc.text(`Course: ${note.subject}`, col1, cursorY + 6);
  doc.text(`Added on: ${formattedDate}`, col1, cursorY + 11);
  doc.text(`Status: ${note.status.replace("_", " ")}`, col1, cursorY + 16);

  doc.text(`Document Type: Complete Lecture & Exam Notes`, col2, cursorY + 6);
  doc.text(`File: ${note.fileName || `${note.title}.pdf`}`, col2, cursorY + 11);
  doc.text(`Tags: ${note.tags.join(", ") || "Engineering, CSE"}`, col2, cursorY + 16);

  cursorY += 26;

  // 4. Executive Summary / Description
  if (note.description) {
    checkPageBreak(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text("EXECUTIVE OVERVIEW & SYNOPSIS", margin, cursorY);
    cursorY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const descLines = doc.splitTextToSize(note.description, contentWidth);
    doc.text(descLines, margin, cursorY);
    cursorY += descLines.length * 4.5 + 6;
  }

  // 5. Syllabus Topics Covered
  if (includeSyllabus && note.syllabusTopics && note.syllabusTopics.length > 0) {
    checkPageBreak(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text("KEY SYLLABUS TOPICS COVERED", margin, cursorY);
    cursorY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    note.syllabusTopics.forEach((topic, idx) => {
      checkPageBreak(6);
      doc.setFillColor(...primaryColor);
      doc.circle(margin + 2, cursorY - 1, 1, "F");
      const topicLines = doc.splitTextToSize(`${topic}`, contentWidth - 8);
      doc.text(topicLines, margin + 6, cursorY);
      cursorY += topicLines.length * 4.2;
    });

    cursorY += 6;
  }

  // 6. Full Detailed Lecture Notes Content
  if (note.fullNotesText) {
    checkPageBreak(25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...secondaryColor);
    doc.text("DETAILED LECTURE STUDY NOTES", margin, cursorY);
    cursorY += 2;

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(margin, cursorY, margin + contentWidth, cursorY);
    cursorY += 6;

    // Process line by line
    const rawLines = note.fullNotesText.split("\n");
    let inCode = false;
    let codeBuffer: string[] = [];

    const flushCodeBuffer = () => {
      if (codeBuffer.length === 0) return;
      const codeBlockHeight = codeBuffer.length * 3.8 + 4;
      checkPageBreak(codeBlockHeight);

      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, cursorY, contentWidth, codeBlockHeight, 1.5, 1.5, "FD");

      doc.setFont("courier", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);

      let codeY = cursorY + 4;
      codeBuffer.forEach((cLine) => {
        doc.text(cLine.slice(0, 85), margin + 3, codeY);
        codeY += 3.8;
      });

      cursorY += codeBlockHeight + 4;
      codeBuffer = [];
    };

    rawLines.forEach((line) => {
      const trimmed = line.trim();

      // Check code block
      if (trimmed.startsWith("```")) {
        if (inCode) {
          flushCodeBuffer();
          inCode = false;
        } else {
          inCode = true;
        }
        return;
      }

      if (inCode) {
        codeBuffer.push(line);
        return;
      }

      // Check headers
      if (trimmed.startsWith("### ")) {
        checkPageBreak(12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.text(trimmed.replace("### ", ""), margin, cursorY + 2);
        cursorY += 6;
        return;
      }

      if (trimmed.startsWith("## ")) {
        checkPageBreak(16);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...secondaryColor);
        cursorY += 2;
        doc.text(trimmed.replace("## ", ""), margin, cursorY);
        cursorY += 6;
        return;
      }

      if (trimmed.startsWith("# ")) {
        checkPageBreak(18);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(...secondaryColor);
        cursorY += 3;
        doc.text(trimmed.replace("# ", ""), margin, cursorY);
        cursorY += 7;
        return;
      }

      // Bullet points
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        checkPageBreak(7);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);

        doc.setFillColor(79, 70, 229);
        doc.circle(margin + 2, cursorY - 1, 0.8, "F");

        const textContent = trimmed.replace(/^[\-\*]\s+/, "");
        const lines = doc.splitTextToSize(textContent, contentWidth - 6);
        doc.text(lines, margin + 5, cursorY);
        cursorY += lines.length * 4.2;
        return;
      }

      // Blank line
      if (!trimmed) {
        cursorY += 2.5;
        return;
      }

      // Standard paragraph text
      checkPageBreak(7);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const paraLines = doc.splitTextToSize(line, contentWidth);
      doc.text(paraLines, margin, cursorY);
      cursorY += paraLines.length * 4.2;
    });

    if (inCode) {
      flushCodeBuffer();
    }

    cursorY += 6;
  }

  // 7. University Exam & Viva Questions
  if (includeViva && note.vivaQuestions && note.vivaQuestions.length > 0) {
    checkPageBreak(25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...secondaryColor);
    doc.text("UNIVERSITY EXAM & VIVA VOCE QUESTIONS", margin, cursorY);
    cursorY += 2;

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(margin, cursorY, margin + contentWidth, cursorY);
    cursorY += 6;

    note.vivaQuestions.forEach((v, index) => {
      checkPageBreak(25);

      // Question
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      const qLines = doc.splitTextToSize(`Q${index + 1}: ${v.question}`, contentWidth);
      doc.text(qLines, margin, cursorY);
      cursorY += qLines.length * 4.2 + 1;

      // Answer
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const aLines = doc.splitTextToSize(`Answer: ${v.answer}`, contentWidth - 4);
      doc.text(aLines, margin + 4, cursorY);
      cursorY += aLines.length * 4.2 + 2;

      // Examiner Tip if present
      if (v.tip) {
        checkPageBreak(12);
        doc.setFillColor(254, 243, 199); // Amber-100
        doc.setDrawColor(245, 158, 11);
        const tipLines = doc.splitTextToSize(`💡 Examiner Tip: ${v.tip}`, contentWidth - 10);
        const tipHeight = tipLines.length * 3.8 + 4;
        doc.roundedRect(margin + 4, cursorY, contentWidth - 8, tipHeight, 1, 1, "FD");

        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(146, 64, 14);
        doc.text(tipLines, margin + 7, cursorY + 3.2);
        cursorY += tipHeight + 4;
      } else {
        cursorY += 3;
      }
    });
  }

  // 8. Add Running Headers & Footers across all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Running Header (pages > 1)
    if (p > 1) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...mutedColor);
      doc.text(`CampusFlow Study Material • ${note.subject}: ${note.title.slice(0, 45)}...`, margin, 10);

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, 12, pageWidth - margin, 12);
    }

    // Running Footer
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedColor);
    doc.text("CampusFlow Verified Academic Repository • For Student Educational Use", margin, pageHeight - 8);

    const pageStr = `Page ${p} of ${totalPages}`;
    const pageStrWidth = doc.getTextWidth(pageStr);
    doc.text(pageStr, pageWidth - margin - pageStrWidth, pageHeight - 8);
  }

  return doc;
}

/**
 * Triggers clean PDF download directly in browser
 */
export function downloadNoteAsPDF(note: NoteItem, options: PDFExportOptions = {}): void {
  const doc = generateNotePDF(note, options);
  const cleanTitle = (note.fileName || note.title)
    .replace(/\.pdf$/i, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`${cleanTitle}_CampusFlow_Notes.pdf`);
}

/**
 * Opens PDF directly in a new browser tab for clean full-page reading/printing
 */
export function openNotePDFInNewTab(note: NoteItem, options: PDFExportOptions = {}): void {
  const doc = generateNotePDF(note, options);
  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, "_blank");
}
