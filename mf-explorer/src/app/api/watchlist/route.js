import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb.js';

// GET - Fetch user's watchlist
export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId') || 'default-user';
    
    const db = await getDatabase();
    const watchlistCollection = db.collection('watchlist');
    
    const watchlist = await watchlistCollection.findOne({ userId });
    
    if (!watchlist) {
      return NextResponse.json({ userId, funds: [] });
    }
    
    // Fetch performance data for each fund
    const fundsWithPerformance = await Promise.all(
      watchlist.funds.map(async (fund) => {
        try {
          const response = await fetch(`${request.nextUrl.origin}/api/scheme/${fund.schemeCode}/returns?period=1d,1m,3m,6m,1y`);
          const data = await response.json();
          
          return {
            ...fund,
            performance: data.returns || {}
          };
        } catch (error) {
          return {
            ...fund,
            performance: { '1d': 0, '1m': 0, '3m': 0, '6m': 0, '1y': 0 }
          };
        }
      })
    );
    
    return NextResponse.json({
      userId,
      funds: fundsWithPerformance
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Add fund to watchlist
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId = 'default-user', schemeCode, schemeName } = body;
    
    if (!schemeCode || !schemeName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const db = await getDatabase();
    const watchlistCollection = db.collection('watchlist');
    
    const result = await watchlistCollection.updateOne(
      { userId },
      {
        $addToSet: {
          funds: {
            schemeCode,
            schemeName,
            addedAt: new Date()
          }
        },
        $setOnInsert: { userId, createdAt: new Date() }
      },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true, message: 'Fund added to watchlist' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove fund from watchlist
export async function DELETE(request) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId') || 'default-user';
    const schemeCode = searchParams.get('schemeCode');
    
    if (!schemeCode) {
      return NextResponse.json({ error: 'Missing schemeCode' }, { status: 400 });
    }
    
    const db = await getDatabase();
    const watchlistCollection = db.collection('watchlist');
    
    await watchlistCollection.updateOne(
      { userId },
      {
        $pull: {
          funds: { schemeCode }
        }
      }
    );
    
    return NextResponse.json({ success: true, message: 'Fund removed from watchlist' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
