import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const CLOUDFLARE_API_TOKEN = "S8Use9zdidyGF7lg2FFbUU-mbfSMn2Qb9dHaX9ok";

// GET - List all email routing
export async function GET() {
  try {
    const emails = await db.emailRouting.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      emails
    });
  } catch (error) {
    console.error('Error fetching email routing:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create new email routing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { zoneId, aliasPart, destinationEmail } = body;

    if (!zoneId || !aliasPart || !destinationEmail) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: zoneId, aliasPart, destinationEmail'
      }, { status: 400 });
    }

    // Get zone details
    const zoneResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!zoneResponse.ok) {
      throw new Error(`Failed to get zone details: ${zoneResponse.status} ${zoneResponse.statusText}`);
    }

    const zoneData = await zoneResponse.json();
    const zoneName = zoneData.result.name;
    const fullEmail = `${aliasPart}@${zoneName}`;

    // Create email routing rule
    const routingResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/email/routing/rules`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: true,
          matchers: [
            {
              type: "literal",
              field: "to",
              value: fullEmail
            }
          ],
          actions: [
            {
              type: "forward",
              value: [destinationEmail]
            }
          ],
          name: `Auto-generated via Email Manager`
        })
      }
    );

    if (!routingResponse.ok) {
      const errorData = await routingResponse.json();
      throw new Error(`Failed to create routing rule: ${errorData.message || routingResponse.statusText}`);
    }

    const routingData = await routingResponse.json();
    const ruleId = routingData.result.id;

    // Save to database
    const newEmailRouting = await db.emailRouting.create({
      data: {
        zoneId,
        zoneName,
        aliasPart,
        fullEmail,
        ruleId,
        destination: destinationEmail,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      email: newEmailRouting
    });
  } catch (error) {
    console.error('Error creating email routing:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}