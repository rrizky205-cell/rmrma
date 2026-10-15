import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';

export async function POST(req: NextRequest) {
  try {
    const notification = await req.json();
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    if (!orderId) {
      return NextResponse.json({ error: 'order_id missing' }, { status: 400 });
    }

    let status: 'settlement' | 'pending' | 'deny' | 'expire' | 'cancel' = 'pending';

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        status = 'settlement';
      }
    } else if (transactionStatus === 'settlement') {
      status = 'settlement';
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny') {
      status = 'deny';
    } else if (transactionStatus === 'expire') {
      status = 'expire';
    } else if (transactionStatus === 'pending') {
      status = 'pending';
    }

    db.updatePaymentStatus(orderId, status, `Notifikasi Midtrans status: ${transactionStatus}`);

    return NextResponse.json({ ok: true, status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
