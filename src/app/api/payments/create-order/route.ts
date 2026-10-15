import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';

export async function POST(req: NextRequest) {
  try {
    const { plan, paymentMethod, proofUrl } = await req.json();
    const user = db.getCurrentUser();

    if (!plan || (plan !== 'starter' && plan !== 'pro')) {
      return NextResponse.json({ error: 'Paket langganan tidak valid' }, { status: 400 });
    }

    const amount = plan === 'starter' ? 49000 : 99000;
    const orderId = `ORD-TATA-${plan.toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const isManual = paymentMethod === 'manual_transfer';

    const newPayment = {
      id: 'pay_' + Math.random().toString(36).substring(2, 9),
      user_id: user.id,
      user_name: user.full_name,
      order_id: orderId,
      plan_selected: plan as 'starter' | 'pro',
      amount,
      payment_method: paymentMethod || 'qris',
      status: isManual ? ('pending' as const) : ('settlement' as const), // Simulated instant settlement for mock gateway, pending for manual
      proof_image_url: proofUrl,
      admin_notes: isManual ? 'Menunggu verifikasi bukti transfer oleh admin' : 'Pembayaran otomatis terkonfirmasi',
      created_at: new Date().toISOString()
    };

    db.payments.unshift(newPayment);

    // If automatic settlement, immediately upgrade user
    if (!isManual) {
      user.plan = plan;
    }

    return NextResponse.json({
      success: true,
      orderId,
      amount,
      status: newPayment.status,
      payment: newPayment
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
