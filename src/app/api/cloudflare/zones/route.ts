import { NextRequest, NextResponse } from 'next/server';

const CLOUDFLARE_API_TOKEN = "S8Use9zdidyGF7lg2FFbUU-mbfSMn2Qb9dHaX9ok";
const CLOUDFLARE_ACCOUNT_ID = "6543986839c715461d19a855c7afa9d7";

export async function GET() {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones?status=active&per_page=50`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      zones: data.result || []
    });
  } catch (error) {
    console.error('Error fetching zones:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}