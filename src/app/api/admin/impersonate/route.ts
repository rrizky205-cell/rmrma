import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';

export async function POST(req: NextRequest) {
  try {
    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId wajib disertakan' }, { status: 400 });
    }

    const targetUser = db.profiles.find(p => p.id === targetUserId);
    if (!targetUser) {
      return NextResponse.json({ error: 'Pengguna tujuan tidak ditemukan' }, { status: 404 });
    }

    const currentAdmin = db.getCurrentUser();

    // Log this sensitive impersonation action into audit logs!
    db.logAdminAction(
      currentAdmin.email,
      targetUserId,
      'IMPERSONATE_USER',
      { targetName: targetUser.full_name, targetEmail: targetUser.email, reason: 'Admin user impersonation session' }
    );

    // Switch active user session
    db.setCurrentUser(targetUserId);

    return NextResponse.json({
      success: true,
      impersonated: {
        id: targetUser.id,
        name: targetUser.full_name,
        email: targetUser.email,
        plan: targetUser.plan
      },
      redirect: '/dashboard'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
