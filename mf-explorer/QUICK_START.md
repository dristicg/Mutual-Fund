# 🚀 Quick Start Guide

## Step 1: Install Dependencies (RUNNING NOW)
```bash
npm install
```
This will install `mongodb` and `node-cron` packages.

---

## Step 2: Setup MongoDB

### Option A: Local MongoDB (Easiest for Testing)
1. Download MongoDB: https://www.mongodb.com/try/download/community
2. Install and start MongoDB
3. Create file `.env.local` in project root:
```
MONGODB_URI=mongodb://localhost:27017/mf-explorer
```

### Option B: MongoDB Atlas (Cloud - Recommended for Production)
1. Go to https://cloud.mongodb.com
2. Sign up for free account
3. Create a new cluster (free tier available)
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Create `.env.local`:
```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/mf-explorer
```

---

## Step 3: Run the Application
```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## Step 4: Initialize Cron Job (Optional)
The cron job auto-starts when the app runs. To manually trigger:
```
Visit: http://localhost:3000/api/init-cron
```

---

## 🎯 What You Can Do Now

### 1. **Browse Funds** (`/funds`)
- Search and filter 2500+ active mutual funds
- View NAV history and performance

### 2. **Analyze Funds** (`/funds/[code]`)
- View detailed fund information
- Use SIP, Lumpsum, and SWP calculators
- See historical NAV charts (6M, 1Y, 3Y, 5Y, All)

### 3. **Create Watchlist** (`/watchlist`)
- Add your favorite funds
- Track performance: 1D, 1M, 3M, 6M, 1Y
- Quick access to fund details

### 4. **Virtual Portfolio** (`/virtual-portfolio`)
- Start with ₹10,00,000 virtual money
- Create virtual SIPs
- Track performance without real investment

---

## 📱 Navigation

Use the top navigation bar:
- 🏠 **Home** - Landing page
- 🔍 **Explore Funds** - Browse all funds
- 📌 **Watchlist** - Your tracked funds
- 💼 **Virtual Portfolio** - SIP simulator

---

## ⏰ Automatic Updates

The system automatically updates active funds **every day at 7:00 AM**.

---

## 🎨 UI Features

✅ Dark theme with proper contrast  
✅ Light text for visibility  
✅ Responsive design  
✅ Color-coded returns (green/red)  
✅ Smooth animations  

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
**Solution:** Make sure MongoDB is running or check your `MONGODB_URI` in `.env.local`

### Port Already in Use
```
Port 3000 is already in use
```
**Solution:** The app will auto-use port 3001. Check terminal output.

### Cron Job Not Running
**Solution:** Visit `http://localhost:3000/api/init-cron` to manually start it.

---

## 📚 Documentation

- **FEATURES_SUMMARY.md** - Complete feature list
- **SETUP.md** - Detailed setup instructions
- **env.example.txt** - Environment variables template

---

## 🎉 You're All Set!

Enjoy exploring mutual funds with **MF Explorer**! 🚀
