# MF Explorer - Setup Guide

## 🚀 New Features Added

### 1. **Active Funds Filter**
- Only shows mutual funds with current NAV data
- Automatically filters out inactive/closed funds

### 2. **Daily Auto-Update (Cron Job)**
- Runs every day at 7:00 AM
- Updates MongoDB with latest active funds
- Keeps data fresh automatically

### 3. **Watchlist Feature** (`/watchlist`)
- Add funds to your personal watchlist
- Track performance across multiple time periods (1D, 1M, 3M, 6M, 1Y)
- Quick access to your favorite funds

### 4. **Virtual Portfolio** (`/virtual-portfolio`)
- Start with ₹10,00,000 virtual money
- Create virtual SIPs to test strategies
- Track performance without real investment

---

## 📦 Installation Steps

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `mongodb` - Database for watchlist and portfolio
- `node-cron` - Scheduled tasks for daily updates

### 2. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# Windows: Download from https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
mongod
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Create `.env.local` file in project root:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mf-explorer?retryWrites=true&w=majority
```

### 3. Initialize Cron Jobs

The cron job will auto-start when you run the app. To manually trigger:
```bash
# Visit this URL after starting the server
http://localhost:3000/api/init-cron
```

---

## 🎯 Running the Application

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🗂️ Database Collections

The app creates 3 MongoDB collections:

1. **`active_funds`** - Stores funds with current NAV
2. **`watchlist`** - User watchlists
3. **`virtual_portfolio`** - Virtual SIP investments

---

## 🎨 UI Improvements

All pages now have:
- ✅ Dark theme with proper contrast
- ✅ Light text colors for visibility
- ✅ Consistent spacing and layout
- ✅ Responsive design
- ✅ Beautiful gradient accents

---

## 📱 Navigation

New navigation bar with:
- 🏠 Home
- 🔍 Explore Funds
- 📌 Watchlist
- 💼 Virtual Portfolio

---

## 🔧 API Endpoints

### Watchlist
- `GET /api/watchlist?userId=default-user` - Get watchlist
- `POST /api/watchlist` - Add fund
- `DELETE /api/watchlist?userId=X&schemeCode=Y` - Remove fund

### Virtual Portfolio
- `GET /api/virtual-portfolio?userId=default-user` - Get portfolio
- `POST /api/virtual-portfolio` - Create SIP
- `DELETE /api/virtual-portfolio?userId=X&sipId=Y` - Remove SIP

### Fund Data
- `GET /api/mf` - Get active funds list
- `GET /api/scheme/[code]/returns?period=1d,1m,3m,6m,1y` - Get returns

---

## ⏰ Cron Job Schedule

- **Daily at 7:00 AM** - Updates active funds database
- Checks NAV dates to filter active funds
- Removes funds without recent NAV data

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: MongoClient connection failed
```
**Solution**: Check your `MONGODB_URI` in `.env.local`

### Cron Job Not Running
```bash
# Manually trigger cron initialization
curl http://localhost:3000/api/init-cron
```

### Port Already in Use
```bash
# Kill process on port 3000
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -ti:3000 | xargs kill
```

---

## 📊 Features Summary

| Feature | Status | Description |
|---------|--------|-------------|
| Active Funds Filter | ✅ | Only shows funds with current NAV |
| Daily Auto-Update | ✅ | Cron job at 7:00 AM |
| Watchlist | ✅ | Track favorite funds |
| Virtual Portfolio | ✅ | Test SIP strategies |
| Dark Theme | ✅ | Beautiful UI with proper contrast |
| Responsive Design | ✅ | Works on all devices |

---

## 🎉 You're All Set!

Start the app with `npm run dev` and explore all the new features!
