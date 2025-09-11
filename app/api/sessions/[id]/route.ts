import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth/auth';
import { headers } from 'next/headers';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const result = await sql`
      SELECT * FROM session_history 
      WHERE id = ${id} AND userId = ${session.user.id}
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ session: result[0] });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
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

    const result = await sql`
      UPDATE session_history SET
        notes = ${notes || null},
        side = ${side || null},
        amount = ${amount || null},
        unit = ${unit || null},
        environment = ${environment || null},
        diaperType = ${diaperType || null},
        diaperAmount = ${diaperAmount || null},
        diaperColor = ${diaperColor || null},
        diaperTexture = ${diaperTexture || null},
        diaperMood = ${diaperMood || null},
        openAirAccident = ${openAirAccident || false},
        diaperLeak = ${diaperLeak || false}
      WHERE id = ${id} AND userId = ${session.user.id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ session: result[0] });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const result = await sql`
      DELETE FROM session_history 
      WHERE id = ${id} AND userId = ${session.user.id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}