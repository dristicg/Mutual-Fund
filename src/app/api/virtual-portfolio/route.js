import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb.js';

// GET - Fetch user's virtual portfolio
export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId') || 'default-user';
    
    const db = await getDatabase();
    const portfolioCollection = db.collection('virtual_portfolio');
    
    const portfolio = await portfolioCollection.findOne({ userId });
    
    if (!portfolio) {
      return NextResponse.json({ 
        userId, 
        balance: 1000000, // Starting virtual money: 10 lakhs
        sips: [],
        totalInvested: 0,
        currentValue: 0
      });
    }
    
    // Calculate current values for all SIPs
    const sipsWithCurrentValue = await Promise.all(
      portfolio.sips.map(async (sip) => {
        try {
          const response = await fetch(`${request.nextUrl.origin}/api/scheme/${sip.schemeCode}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: sip.amount,
              frequency: sip.frequency,
              from: sip.startDate,
              to: new Date().toISOString().split('T')[0]
            })
          });
          
          const result = await response.json();
          
          return {
            ...sip,
            currentValue: result.currentValue || 0,
            totalInvested: result.totalInvested || 0,
            returns: result.absoluteReturn || 0
          };
        } catch (error) {
          return {
            ...sip,
            currentValue: 0,
            totalInvested: 0,
            returns: 0
          };
        }
      })
    );
    
    const totalInvested = sipsWithCurrentValue.reduce((sum, sip) => sum + (sip.totalInvested || 0), 0);
    const currentValue = sipsWithCurrentValue.reduce((sum, sip) => sum + (sip.currentValue || 0), 0);
    
    return NextResponse.json({
      userId,
      balance: portfolio.balance || 1000000,
      sips: sipsWithCurrentValue,
      totalInvested,
      currentValue,
      totalReturns: currentValue - totalInvested
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new virtual SIP
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      userId = 'default-user', 
      schemeCode, 
      schemeName,
      amount,
      frequency,
      startDate 
    } = body;
    
    if (!schemeCode || !schemeName || !amount || !frequency || !startDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const db = await getDatabase();
    const portfolioCollection = db.collection('virtual_portfolio');
    
    const newSip = {
      id: Date.now().toString(),
      schemeCode,
      schemeName,
      amount: Number(amount),
      frequency,
      startDate,
      createdAt: new Date()
    };
    
    const result = await portfolioCollection.updateOne(
      { userId },
      {
        $push: { sips: newSip },
        $setOnInsert: { 
          userId, 
          balance: 1000000,
          createdAt: new Date() 
        }
      },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true, message: 'Virtual SIP created', sip: newSip });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove virtual SIP
export async function DELETE(request) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId') || 'default-user';
    const sipId = searchParams.get('sipId');
    
    if (!sipId) {
      return NextResponse.json({ error: 'Missing sipId' }, { status: 400 });
    }
    
    const db = await getDatabase();
    const portfolioCollection = db.collection('virtual_portfolio');
    
    await portfolioCollection.updateOne(
      { userId },
      {
        $pull: {
          sips: { id: sipId }
        }
      }
    );
    
    return NextResponse.json({ success: true, message: 'Virtual SIP removed' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
