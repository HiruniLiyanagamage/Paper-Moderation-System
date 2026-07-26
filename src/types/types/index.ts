export interface Subject {
  id: string;
  code: string;
  name: string;
  academicYear: string;
  semester: number;
  lecturerId?: string;
  lecturerName?: string;
  moderatorId?: string;
  moderatorName?: string;
}

export interface Paper {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  lecturerId: string;
  lecturerName: string;
  academicYear: string;
  semester: number;
  status: 'draft' | 'submitted' | 'under_moderation' | 'revision_required' | 'finalized';
  paperUrl?: string;
  markingSchemeUrl?: string;
  finalPaperUrl?: string;
  finalMarkingSchemeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModerationReport {
  id: string;
  paperId: string;
  moderatorId: string;
  moderatorName: string;
  remarks: {
    standardAppropriate: boolean;
    coversMainContents: boolean;
    assessesLearningOutcomes: boolean;
    clearAndUnambiguous: boolean;
    appropriateTimeAllocation: boolean;
    appropriateMarkAllocation: boolean;
    appropriateNumberingAndFormatting: boolean;
    clearFigures: boolean;
    accurateModelAnswers: boolean;
    structuredModelAnswers: boolean;
  };
  additionalComments: string;
  followUpActions: string[];
  createdAt: string;
}

export interface AcademicSettings {
  currentYear: string;
  currentSemester: number;
}
