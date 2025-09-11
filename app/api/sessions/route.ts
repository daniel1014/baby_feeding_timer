import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth/auth';
import { headers } from 'next/headers';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sessionType = searchParams.get('type');
    const date = searchParams.get('date');

    // Use Neon's tagged template literal syntax for parameterized queries
    let sessions;
    if (sessionType && date) {
      sessions = await sql`
        SELECT * FROM session_history 
        WHERE userId = ${session.user.id}
          AND sessionType = ${sessionType}
          AND date = ${date}
        ORDER BY startTime DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (sessionType) {
      sessions = await sql`
        SELECT * FROM session_history 
        WHERE userId = ${session.user.id}
          AND sessionType = ${sessionType}
        ORDER BY startTime DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (date) {
      sessions = await sql`
        SELECT * FROM session_history 
        WHERE userId = ${session.user.id}
          AND date = ${date}
        ORDER BY startTime DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      sessions = await sql`
        SELECT * FROM session_history 
        WHERE userId = ${session.user.id}
        ORDER BY startTime DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      sessionType,
      startTime,
      endTime,
      duration,
      notes,
      // Breastfeeding fields
      side,
      // Bottle feeding fields
      amount,
      unit,
      // Sleeping fields
      environment,
      // Diaper fields
      diaperType,
      diaperAmount,
      diaperColor,
      diaperTexture,
      diaperMood,
      openAirAccident,
      diaperLeak
    } = body;

    if (!sessionType || !startTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const startTimeDate = new Date(startTime);
    const date = startTimeDate.toISOString().split('T')[0];

    const result = await sql`
      INSERT INTO session_history (
        userId, sessionType, startTime, endTime, date, duration, notes,
        side, amount, unit, environment,
        diaperType, diaperAmount, diaperColor, diaperTexture, diaperMood,
        openAirAccident, diaperLeak
      ) VALUES (
        ${session.user.id}, ${sessionType}, ${startTime}, ${endTime}, ${date}, ${duration}, ${notes},
        ${side || null}, ${amount || null}, ${unit || null}, ${environment || null},
        ${diaperType || null}, ${diaperAmount || null}, ${diaperColor || null}, 
        ${diaperTexture || null}, ${diaperMood || null},
        ${openAirAccident || false}, ${diaperLeak || false}
      )
      RETURNING *
    `;

    return NextResponse.json({ session: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}