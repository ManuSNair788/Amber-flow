import { NextResponse } from 'next/server';

export async function GET() {
  // Mock WhatsApp groups
  const groups = [
    { id: '1203631908751234@g.us', name: 'Leap Scholar Support' },
    { id: '1203631908755678@g.us', name: 'AECC Priority Leads' },
    { id: '1203631908759012@g.us', name: 'IDP Connect' },
    { id: '1203631908753456@g.us', name: 'maven Global' },
    { id: '1203631908759999@g.us', name: 'My Custom WA Group' }
  ];

  return NextResponse.json({ groups });
}
