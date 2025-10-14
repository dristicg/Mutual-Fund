import cron from 'node-cron';
import { getDatabase } from './mongodb.js';

// Cron job to update active funds daily at 7:00 AM
export function startCronJobs() {
  // Run every day at 7:00 AM
  cron.schedule('0 7 * * *', async () => {
    console.log('Running daily fund update at 7:00 AM...');
    try {
      await updateActiveFunds();
      console.log('Daily fund update completed successfully');
    } catch (error) {
      console.error('Error updating funds:', error);
    }
  });

  console.log('Cron jobs initialized - Daily updates scheduled for 7:00 AM');
}

async function updateActiveFunds() {
  const db = await getDatabase();
  const fundsCollection = db.collection('active_funds');
  
  // Fetch all funds from API
  const response = await fetch('https://api.mfapi.in/mf');
  const allFunds = await response.json();
  
  const today = new Date().toISOString().split('T')[0];
  const activeFunds = [];
  
  // Check each fund for current NAV
  for (const fund of allFunds) {
    try {
      const detailResponse = await fetch(`https://api.mfapi.in/mf/${fund.schemeCode}`);
      const details = await detailResponse.json();
      
      if (details.data && details.data.length > 0) {
        const latestNav = details.data[0];
        const navDate = latestNav.date.split('-').reverse().join('-');
        
        // Check if NAV is recent (within last 7 days)
        const daysDiff = Math.floor((new Date(today) - new Date(navDate)) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 7) {
          activeFunds.push({
            schemeCode: fund.schemeCode,
            schemeName: fund.schemeName,
            latestNav: latestNav.nav,
            navDate: navDate,
            updatedAt: new Date()
          });
        }
      }
      
      // Rate limiting - wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error checking fund ${fund.schemeCode}:`, error.message);
    }
  }
  
  // Clear old data and insert new active funds
  await fundsCollection.deleteMany({});
  if (activeFunds.length > 0) {
    await fundsCollection.insertMany(activeFunds);
  }
  
  console.log(`Updated ${activeFunds.length} active funds`);
  return activeFunds.length;
}

// Export for manual trigger
export { updateActiveFunds };
