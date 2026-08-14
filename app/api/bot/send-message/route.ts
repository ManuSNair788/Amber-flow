import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { groupId, message } = await request.json();

    if (!groupId || !message) {
      return NextResponse.json({ success: false, error: 'Missing groupId or message' }, { status: 400 });
    }

    // Mock sending message to WhatsApp
    console.log(`\n========================================`);
    console.log(`📲 [MOCK WHATSAPP BOT] Message Sent!`);
    console.log(`========================================`);
    console.log(`To Group ID: ${groupId}`);
    console.log(`Message: \n${message}`);
    console.log(`========================================\n`);

    return NextResponse.json({ success: true, message: 'Message sent successfully via Mock WhatsApp Bot' });
  } catch (error) {
    console.error('Mock WhatsApp Bot Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
