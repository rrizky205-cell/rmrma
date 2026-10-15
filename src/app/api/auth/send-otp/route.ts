import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';
import { generateOtpCode } from '@/lib/utils/crypto';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber || phoneNumber.length < 9) {
      return NextResponse.json({ error: 'Nomor HP tidak valid. Masukkan nomor HP aktif.' }, { status: 400 });
    }

    const cleanedPhone = phoneNumber.replace(/\s+/g, '').replace(/-/g, '');
    const otp = generateOtpCode();

    // Store OTP on user or temporary session
    let user = db.profiles.find(p => p.phone_number === cleanedPhone);
    if (user) {
      user.phone_otp_code = otp;
    } else {
      const activeUser = db.getCurrentUser();
      activeUser.phone_number = cleanedPhone;
      activeUser.phone_otp_code = otp;
    }

    return NextResponse.json({
      success: true,
      message: `Kode OTP 6-digit telah dikirim ke WhatsApp / SMS nomor ${cleanedPhone}.`,
      // For immediate seamless local trial, provide the OTP in development
      demo_otp: otp
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
