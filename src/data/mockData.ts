import { Subject, Paper, ModerationReport, AcademicSettings } from '../types';

export const academicSettings: AcademicSettings = {
  currentYear: '2025/2026',
  currentSemester: 1,
};

export const subjects: Subject[] = [
  {
    id: '1',
    code: 'CMIS 3134',
    name: 'Computer Architecture and Compiler Design',
    academicYear: '2025/2026',
    semester: 1,
    lecturerId: '2',
    lecturerName: 'Mr. WCC Premarathna',
    moderatorId: '3',
    moderatorName: 'Dr. Jane Smith',
  },
  {
    id: '2',
    code: 'CMIS 3124',
    name: 'Database Management Systems',
    academicYear: '2025/2026',
    semester: 1,
    lecturerId: '3',
    lecturerName: 'Dr. Jane Smith',
    moderatorId: '2',
    moderatorName: 'Mr. WCC Premarathna',
  },
  {
    id: '3',
    code: 'CMIS 3114',
    name: 'Software Engineering',
    academicYear: '2025/2026',
    semester: 1,
  },
];

export const papers: Paper[] = [
  {
    id: '1',
    subjectId: '1',
    subjectCode: 'CMIS 3134',
    subjectName: 'Computer Architecture and Compiler Design',
    lecturerId: '2',
    lecturerName: 'Mr. WCC Premarathna',
    academicYear: '2025/2026',
    semester: 1,
    status: 'under_moderation',
    paperUrl: '/mock/paper1.pdf',
    markingSchemeUrl: '/mock/marking1.pdf',
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-05-05T14:30:00Z',
  },
  {
    id: '2',
    subjectId: '2',
    subjectCode: 'CMIS 3124',
    subjectName: 'Database Management Systems',
    lecturerId: '3',
    lecturerName: 'Dr. Jane Smith',
    academicYear: '2025/2026',
    semester: 1,
    status: 'draft',
    createdAt: '2026-05-08T09:00:00Z',
    updatedAt: '2026-05-08T09:00:00Z',
  },
  {
    id: '3',
    subjectId: '3',
    subjectCode: 'CMIS 3136',
    subjectName: 'Software Engineering',
    lecturerId: '2',
    lecturerName: 'Mr. WCC Premarathna',
    academicYear: '2025/2026',
    semester: 1,
    status: 'revision_required',
    paperUrl: '/mock/software-engineering-paper.pdf',
    markingSchemeUrl: '/mock/software-engineering-scheme.pdf',
    createdAt: '2026-05-10T08:00:00Z',
    updatedAt: '2026-05-12T12:00:00Z',
  },
];

export const moderationReports: ModerationReport[] = [
  {
    id: '1',
    paperId: '1',
    moderatorId: '3',
    moderatorName: 'Prof. David Wilson',
    remarks: {
      standardAppropriate: true,
      coversMainContents: true,
      assessesLearningOutcomes: false,
      clearAndUnambiguous: true,
      appropriateTimeAllocation: true,
      appropriateMarkAllocation: true,
      appropriateNumberingAndFormatting: true,
      clearFigures: true,
      accurateModelAnswers: false,
      structuredModelAnswers: true,
    },
    additionalComments: 'Question 2 needs clarity. The model answer for Question 5 has an error in the assembly code section.',
    followUpActions: [],
    createdAt: '2026-05-06T11:00:00Z',
  },
  {
    id: '2',
    paperId: '3',
    moderatorId: '5',
    moderatorName: 'Dr. Emily Brown',
    remarks: {
      standardAppropriate: true,
      coversMainContents: true,
      assessesLearningOutcomes: true,
      clearAndUnambiguous: false,
      appropriateTimeAllocation: true,
      appropriateMarkAllocation: true,
      appropriateNumberingAndFormatting: true,
      clearFigures: true,
      accurateModelAnswers: true,
      structuredModelAnswers: true,
    },
    additionalComments: 'The paper questions are good overall, but Question 4 needs better wording and the model answer should include more detail.',
    followUpActions: [],
    createdAt: '2026-05-12T09:00:00Z',
  },
];

export const lecturers = [
  { id: '1', name: 'Dr. Sarah Johnson' },
  { id: '2', name: 'Mr. WCC Premarathna' },
  { id: '3', name: 'Dr. Jane Smith' },
  { id: '4', name: 'Mr. John Doe' },
];

export const moderators = [
  { id: '1', name: 'Dr. Sarah Johnson' },
  { id: '2', name: 'Mr. WCC Premarathna' },
  { id: '3', name: 'Dr. Jane Smith' },
  { id: '5', name: 'Dr. Emily Brown' },
  { id: '6', name: 'Prof. Michael Lee' },
];
