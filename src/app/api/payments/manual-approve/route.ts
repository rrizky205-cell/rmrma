import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';

export async function POST(req: NextRequest) {
  try {
    const { orderId, action, adminNotes } = await req.json();

    if (!orderId || !action) {
      return NextResponse.json({ error: 'orderId dan action wajib diisi' }, { status: 400 });
    }

    const payment = db.payments.find(p => p.order_id === orderId);
    if (!payment) {
      return NextResponse.json({ error: 'Data pembayaran tidak ditemukan' }, { status: 404 });
    }

    const newStatus = action === 'approve' ? 'settlement' : 'deny';
    db.updatePaymentStatus(orderId, newStatus, adminNotes || (action === 'approve' ? 'Disetujui manual oleh Admin' : 'Ditolak manual oleh Admin'));

    // Log admin action to audit logs
    db.logAdminAction(
      'admin@tatadana.id',
      payment.user_id,
      action === 'approve' ? 'APPROVE_MANUAL_PAYMENT' : 'REJECT_MANUAL_PAYMENT',
      { orderId, plan: payment.plan_selected, amount: payment.amount, adminNotes }
    );

    return NextResponse.json({
      success: true,
      status: newStatus,
      message: action === 'approve' ? 'Pembayaran berhasil disetujui. Akun user otomatis di-upgrade!' : 'Pembayaran telah ditolak.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
