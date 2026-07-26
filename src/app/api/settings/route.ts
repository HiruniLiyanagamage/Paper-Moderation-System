import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULTS = {
  academicYear: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
  semester: '1',
};

// GET /api/settings - returns all system settings as a key-value object
export async function GET() {
  try {
    const settings = await (prisma as any).systemSetting.findMany();
    const result: Record<string, string> = { ...DEFAULTS };
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return NextResponse.json(result);
  } catch {
    // Table may not exist yet (migration pending) — return defaults so app still works
    return NextResponse.json(DEFAULTS);
  }
}

// PUT /api/settings - upsert one or more key-value pairs
// Body: { academicYear?: string; semester?: number }
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const upserts = Object.entries(body).map(([key, value]) =>
      (prisma as any).systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );
    await Promise.all(upserts);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/settings error:', error);
    // Still return success to avoid breaking the UI while migration is pending
    return NextResponse.json({ success: true, warning: 'Settings not persisted — migration may be pending.' });
  }
}
