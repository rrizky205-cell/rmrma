import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, otpCode } = await req.json();

    if (!phoneNumber || !otpCode) {
      return NextResponse.json({ error: 'Nomor HP dan kode OTP wajib diisi' }, { status: 400 });
    }

    const cleanedPhone = phoneNumber.replace(/\s+/g, '').replace(/-/g, '');
    let user = db.profiles.find(p => p.phone_number === cleanedPhone) || db.getCurrentUser();

    // Verify OTP match (or accept test master OTP '123456')
    if (user.phone_otp_code === otpCode.trim() || otpCode.trim() === '123456') {
      user.phone_verified = true;
      user.phone_otp_code = undefined;

      return NextResponse.json({
        success: true,
        verified: true,
        user: {
          id: user.id,
          phone_number: user.phone_number,
          phone_verified: true,
          link_code: user.telegram_link_code
        },
        message: 'Nomor HP berhasil diverifikasi! Akun siap digunakan dan terhubung ke Telegram.'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Kode OTP salah atau telah kadaluarsa. Silakan periksa kembali.'
    }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
