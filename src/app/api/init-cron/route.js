import { NextResponse } from 'next/server';
import { startCronJobs } from '@/lib/cron.js';

let cronInitialized = false;

export async function GET() {
  if (!cronInitialized) {
    startCronJobs();
    cronInitialized = true;
    return NextResponse.json({ message: 'Cron jobs initialized successfully' });
  }
  
  return NextResponse.json({ message: 'Cron jobs already running' });
}
