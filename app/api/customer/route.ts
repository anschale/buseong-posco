import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, birthDate, address, interests, privacyConsent } = body;

    // 1. 유효성 검사
    if (!name || !phone || !birthDate || !address || !interests || privacyConsent !== true) {
      return NextResponse.json(
        { error: '필수 입력 항목이 누락되었거나 개인정보 제공 동의가 필요합니다.' },
        { status: 400 }
      );
    }

    // 2. DB에 관심고객 저장
    // 만약 Supabase DB가 아직 연결되지 않았더라도 예외처리를 통해 
    // 최소한 동작 오류를 방지하고 이메일 전송을 시도합니다.
    let savedCustomer;
    try {
      savedCustomer = await prisma.customer.create({
        data: {
          name,
          phone,
          birthDate,
          address,
          interests: Array.isArray(interests) ? interests.join(', ') : interests,
          privacyConsent: true,
        },
      });
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // DB 연결 실패 시에도 사용자 경험을 방해하지 않고 경고 로깅을 남기며, 이메일로 우선 전송될 수 있도록 흘려보냅니다.
    }

    // 3. Nodemailer 이메일 발송
    const smtpHost = process.env.SMTP_HOST || 'smtp.naver.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '465');
    const smtpUser = process.env.SMTP_USER || '';
    const smtpPass = process.env.SMTP_PASS || '';
    const notificationEmail = process.env.NOTIFICATION_EMAIL || 'anschale@naver.com';

    let emailSent = false;
    let emailErrorMsg = '';

    if (smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465, // 465 포트는 SSL 사용
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const mailOptions = {
          from: smtpUser,
          to: notificationEmail,
          subject: `[부성동 포스코더샵] 새로운 관심고객 등록 알림 - ${name}님`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <div style="background-color: #0b1a30; color: #d4af37; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 1px;">부성동 포스코더샵 (천안 부성2구역)</h1>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #a3b8cc;">새로운 관심고객 정보가 접수되었습니다.</p>
              </div>
              <div style="padding: 24px; background-color: #ffffff;">
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; width: 30%; color: #333333;">이름</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #555555;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333333;">연락처</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #555555;">${phone}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333333;">생년월일</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #555555;">${birthDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333333;">거주지역</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #555555;">${address}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333333;">관심평형대</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #1a56db; font-weight: bold;">
                      ${Array.isArray(interests) ? interests.join(', ') : interests}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333333;">등록일시</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #888888;">${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</td>
                  </tr>
                </table>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; font-size: 12px; color: #666666; line-height: 1.6;">
                  이 정보는 분양 홍보 사이트를 통해 수집된 관심고객 데이터입니다. 청약 일정 및 분양 관련 소식 발송 등 마케팅 목적으로 활용할 수 있습니다. 개인정보 취급에 유의해 주시기 바랍니다.
                </div>
              </div>
              <div style="background-color: #f1f3f5; padding: 15px; text-align: center; font-size: 11px; color: #999999; border-top: 1px solid #e9ecef;">
                부성동 포스코더샵 홍보센터 © ${new Date().getFullYear()} All Rights Reserved.
              </div>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        emailSent = true;
      } catch (emailError: any) {
        console.error('Email send error:', emailError);
        emailErrorMsg = emailError.message || '이메일 전송 실패';
      }
    } else {
      console.warn('SMTP settings are not fully configured in environment variables.');
      emailErrorMsg = '이메일 설정(SMTP_USER, SMTP_PASS)이 등록되지 않았습니다.';
    }

    return NextResponse.json({
      success: true,
      data: savedCustomer || { name, phone },
      emailSent,
      emailError: emailSent ? null : emailErrorMsg,
    });
  } catch (error: any) {
    console.error('Customer registration API error:', error);
    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
