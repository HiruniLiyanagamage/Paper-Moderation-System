#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Set DATABASE_URL before running any prisma commands
process.env.DATABASE_URL = 'postgresql://postgres.sxvmsabhwvbwiorlufrm:Warsha%402026@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require';

async function runCommand(command, args, description) {
  console.log(`\n📝 ${description}...`);
  
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL
      }
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${description} failed with code ${code}`));
      } else {
        console.log(`✅ ${description} completed`);
        resolve();
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

async function setup() {
  try {
    console.log('🚀 Starting database setup...');
    console.log(`📦 Using Supabase pooler at aws-1-ap-northeast-2.pooler.supabase.com:6543`);
    
    // Apply schema
    await runCommand('npx', ['prisma', 'db', 'push', '--accept-data-loss', '--skip-generate'], 'Applying database schema');
    
    // Seed database
    await runCommand('npm', ['run', 'prisma:seed'], 'Seeding database with demo data');
    
    console.log('\n✨ Database setup complete!');
    console.log('\n📋 Demo credentials:');
    console.log('  - Email: head@example.com (Department Head)');
    console.log('  - Email: lecturer@example.com (Lecturer)');
    console.log('  - Email: lecturer2@example.com (Lecturer)');
    console.log('  - Password: password (for all accounts)');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setup();
