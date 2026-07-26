#!/usr/bin/env node

const { Client } = require('pg');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://postgres.sxvmsabhwvbwiorlufrm:Warsha%402026@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require';

async function applyMigrations() {
  console.log('📊 Connecting to Supabase PostgreSQL...');
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase');

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'prisma', 'migration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Applying database schema...');
    
    // Split by -- to handle comments and execute statements
    const statements = sql.split(';\n').filter(s => s.trim() && !s.trim().startsWith('--'));
    
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed) {
        try {
          await client.query(trimmed + ';');
        } catch (err) {
          // Ignore "already exists" errors for idempotency
          if (!err.message.includes('already exists')) {
            throw err;
          }
        }
      }
    }

    console.log('✅ Schema applied successfully');
    await client.end();

    // Now seed with Prisma
    console.log('📝 Seeding database...');
    const prisma = new PrismaClient();

    const users = [
      { email: 'head@example.com', name: 'Department Head', role: 'DEPARTMENT_HEAD', department: 'CS', password: 'password' },
      { email: 'lecturer@example.com', name: 'Dr. Lecturer', role: 'LECTURER', department: 'CS', password: 'password' },
      { email: 'lecturer2@example.com', name: 'Dr. Another', role: 'LECTURER', department: 'CS', password: 'password' },
    ];

    for (const user of users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: { ...user, id: user.email.split('@')[0] },
      });
    }

    const headUser = await prisma.user.findUnique({ where: { email: 'head@example.com' } });
    const lecturer1 = await prisma.user.findUnique({ where: { email: 'lecturer@example.com' } });
    const lecturer2 = await prisma.user.findUnique({ where: { email: 'lecturer2@example.com' } });

    // Create subjects
    const subject1 = await prisma.subject.upsert({
      where: { code: 'CMIS3134' },
      update: {},
      create: {
        code: 'CMIS3134',
        name: 'Database Systems',
        academicYear: '2024',
        semester: 1,
        lecturerId: lecturer1.id,
        moderatorId: headUser.id,
      },
    });

    const subject2 = await prisma.subject.upsert({
      where: { code: 'CMIS3124' },
      update: {},
      create: {
        code: 'CMIS3124',
        name: 'Web Development',
        academicYear: '2024',
        semester: 1,
        lecturerId: lecturer1.id,
        moderatorId: headUser.id,
      },
    });

    const subject3 = await prisma.subject.upsert({
      where: { code: 'CMIS3114' },
      update: {},
      create: {
        code: 'CMIS3114',
        name: 'Software Engineering',
        academicYear: '2024',
        semester: 1,
        lecturerId: lecturer2.id,
        moderatorId: headUser.id,
      },
    });

    // Create papers
    await prisma.paper.create({
      data: {
        id: 'paper1',
        subjectId: subject1.id,
        lecturerId: lecturer1.id,
        academicYear: '2024',
        semester: 1,
        status: 'UNDER_MODERATION',
        paperUrl: 'https://example.com/papers/paper1.pdf',
        markingSchemeUrl: 'https://example.com/schemes/scheme1.pdf',
      },
    }).catch(() => {});

    await prisma.paper.create({
      data: {
        id: 'paper2',
        subjectId: subject2.id,
        lecturerId: lecturer1.id,
        academicYear: '2024',
        semester: 1,
        status: 'DRAFT',
        paperUrl: 'https://example.com/papers/paper2.pdf',
      },
    }).catch(() => {});

    await prisma.paper.create({
      data: {
        id: 'paper3',
        subjectId: subject3.id,
        lecturerId: lecturer2.id,
        academicYear: '2024',
        semester: 1,
        status: 'REVISION_REQUIRED',
        paperUrl: 'https://example.com/papers/paper3.pdf',
        markingSchemeUrl: 'https://example.com/schemes/scheme3.pdf',
      },
    }).catch(() => {});

    // Create moderation reports
    const paper1 = await prisma.paper.findUnique({ where: { id: 'paper1' } });
    if (paper1) {
      await prisma.moderationReport.create({
        data: {
          paperId: paper1.id,
          moderatorId: headUser.id,
          remarks: {
            content: 'Overall good structure',
            issues: ['Missing references', 'Font inconsistency'],
          },
          additionalComments: 'Please revise',
          followUpActions: {
            action1: 'Add more references',
            action2: 'Correct font sizes',
          },
        },
      }).catch(() => {});
    }

    console.log('✅ Database seeded successfully');
    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

applyMigrations();
