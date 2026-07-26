import 'dotenv/config';

console.log('DATABASE_URL =', process.env.DATABASE_URL);

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      email: 'head@example.com',
      name: 'Dr. Sarah Johnson',
      password: 'password',
      role: 'DEPARTMENT_HEAD',
      department: 'Department of Computing and Information Systems',
    },
    {
      email: 'lecturer@example.com',
      name: 'Mr. WCC Premarathna',
      password: 'password',
      role: 'LECTURER',
      department: 'Department of Computing and Information Systems',
    },
    {
      email: 'lecturer2@example.com',
      name: 'Dr. Jane Smith',
      password: 'password',
      role: 'MODERATOR',
      department: 'Department of Computing and Information Systems',
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }

  const head = await prisma.user.findUnique({ where: { email: 'head@example.com' } });
  const lecturer1 = await prisma.user.findUnique({ where: { email: 'lecturer@example.com' } });
  const lecturer2 = await prisma.user.findUnique({ where: { email: 'lecturer2@example.com' } });

  if (!head || !lecturer1 || !lecturer2) {
    throw new Error('Required seeded users could not be created.');
  }

  const subjects = [
    {
      code: 'CMIS 3134',
      name: 'Computer Architecture and Compiler Design',
      academicYear: '2025/2026',
      semester: 1,
      lecturerId: lecturer1.id,
      moderatorId: lecturer2.id,
    },
    {
      code: 'CMIS 3124',
      name: 'Database Management Systems',
      academicYear: '2025/2026',
      semester: 1,
      lecturerId: lecturer2.id,
      moderatorId: lecturer1.id,
    },
    {
      code: 'CMIS 3114',
      name: 'Software Engineering',
      academicYear: '2025/2026',
      semester: 1,
    },
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { code: subject.code },
      update: subject,
      create: subject,
    });
  }

  const subject1 = await prisma.subject.findUnique({ where: { code: 'CMIS 3134' } });
  const subject2 = await prisma.subject.findUnique({ where: { code: 'CMIS 3124' } });
  const subject3 = await prisma.subject.findUnique({ where: { code: 'CMIS 3114' } });

  if (!subject1 || !subject2 || !subject3) {
    throw new Error('Required seeded subjects could not be created.');
  }

  const papers = [
    {
      subjectId: subject1.id,
      lecturerId: lecturer1.id,
      academicYear: '2025/2026',
      semester: 1,
      status: 'UNDER_MODERATION',
      paperUrl: '/mock/paper1.pdf',
      markingSchemeUrl: '/mock/marking1.pdf',
    },
    {
      subjectId: subject2.id,
      lecturerId: lecturer2.id,
      academicYear: '2025/2026',
      semester: 1,
      status: 'DRAFT',
    },
    {
      subjectId: subject3.id,
      lecturerId: lecturer1.id,
      academicYear: '2025/2026',
      semester: 1,
      status: 'REVISION_REQUIRED',
      paperUrl: '/mock/software-engineering-paper.pdf',
      markingSchemeUrl: '/mock/software-engineering-scheme.pdf',
    },
  ];

  for (const paper of papers) {
    await prisma.paper.create({ data: paper });
  }

  const paper1 = await prisma.paper.findFirst({ where: { paperUrl: '/mock/paper1.pdf' } });
  const paper3 = await prisma.paper.findFirst({ where: { paperUrl: '/mock/software-engineering-paper.pdf' } });

  if (paper1) {
    await prisma.moderationReport.upsert({
      where: { paperId: paper1.id },
      update: {
        moderatorId: lecturer2.id,
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
      },
      create: {
        paperId: paper1.id,
        moderatorId: lecturer2.id,
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
      },
    });
  }

  if (paper3) {
    await prisma.moderationReport.upsert({
      where: { paperId: paper3.id },
      update: {
        moderatorId: lecturer1.id,
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
      },
      create: {
        paperId: paper3.id,
        moderatorId: lecturer1.id,
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
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
