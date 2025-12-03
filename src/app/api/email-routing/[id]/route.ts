import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const CLOUDFLARE_API_TOKEN = "S8Use9zdidyGF7lg2FFbUU-mbfSMn2Qb9dHaX9ok";

// DELETE - Delete email routing
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { ruleId } = body;

    if (!ruleId) {
      return NextResponse.json({
        success: false,
        error: 'Missing ruleId'
      }, { status: 400 });
    }

    // Get email routing details first
    const emailRouting = await db.emailRouting.findUnique({
      where: { id }
    });

    if (!emailRouting) {
      return NextResponse.json({
        success: false,
        error: 'Email routing not found'
      }, { status: 404 });
    }

    // Delete from Cloudflare API
    const deleteResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${emailRouting.zoneId}/email/routing/rules/${ruleId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json();
      throw new Error(`Failed to delete routing rule: ${errorData.message || deleteResponse.statusText}`);
    }

    // Delete from database
    await db.emailRouting.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Email routing deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting email routing:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}