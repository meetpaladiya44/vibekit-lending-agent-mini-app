import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { instruction, userAddress } = body;

    if (!instruction || !userAddress) {
      return NextResponse.json(
        { error: 'Missing instruction or userAddress' },
        { status: 400 }
      );
    }

    // Make the request to the external lending agent API
    const response = await fetch('https://lending-agent.xcan.dev/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instruction,
        userAddress,
      }),
    });

    if (!response.ok) {
      throw new Error(`External API failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Lending agent API error:', error);
    return NextResponse.json(
      { error: 'Failed to process lending agent request' },
      { status: 500 }
    );
  }
}
