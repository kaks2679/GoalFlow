# ⚡ GoalForge - Quick Start Guide

## 🎯 What is GoalForge?

A complete productivity web app to manage goals, track tasks, and boost your productivity. Built with React + Firebase.

---

## 🚀 5-Minute Setup

### Step 1: Get the Code
Already in your folder: `/home/user/goalforge`

### Step 2: Install Dependencies
```bash
cd /home/user/goalforge
npm install --legacy-peer-deps
```

### Step 3: Set Up Firebase (15 minutes)

1. **Create Firebase Project**
   - Go to: https://console.firebase.google.com/
   - Click "Add project" → Name it "goalforge" → Create

2. **Enable Features**
   - **Authentication**: Enable Email/Password and Google
   - **Firestore**: Create database (test mode)
   - **Storage**: Get started (test mode)

3. **Get Config**
   - Project Settings → Your apps → Web icon `</>`
   - Copy the `firebaseConfig` object

4. **Create `.env` File**
   ```bash
   # Copy .env.example to .env
   cp .env.example .env
   
   # Edit .env and paste your Firebase config values
   ```

### Step 4: Run Locally
```bash
npm start
```
Opens at: http://localhost:3000

### Step 5: Deploy to Firebase
```bash
# Install Firebase CLI (one-time)
npm install -g firebase-tools

# Login
firebase login

# Initialize (choose your project, public dir: build, SPA: yes)
firebase init hosting

# Build and deploy
npm run build
firebase deploy --only hosting
```

**🎉 You're live!** Your URL: `https://your-project-id.web.app`

---

## 📋 Essential Commands

```bash
# Development
npm start              # Run locally (http://localhost:3000)
npm run build          # Build for production
npm test               # Run tests

# Deployment
firebase login         # Login to Firebase
firebase deploy        # Deploy everything
firebase deploy --only hosting  # Deploy only website

# Git
git add .
git commit -m "Your message"
git push origin main
```

---

## 🎨 Features Included

✅ **Authentication**: Email/Password + Google Sign-In  
✅ **Dashboard**: Stats, today's tasks, active goals  
✅ **Goals**: Create, track progress, set deadlines  
✅ **Tasks**: Natural language dates, priorities, subtasks  
✅ **Calendar**: Event management (basic)  
✅ **Analytics**: Progress tracking (basic)  
✅ **Profile**: Update info, change password  
✅ **Responsive**: Works on mobile, tablet, desktop  
✅ **PWA**: Install to home screen, offline support  

---

## 📚 Documentation

- **Beginners**: Read `BEGINNER_GUIDE.md` (detailed walkthrough)
- **Developers**: Read `README.md` (technical docs)
- **Summary**: Read `DEPLOYMENT_SUMMARY.md` (what's built)
- **Quick Ref**: This file!

---

## 🐛 Common Issues

**"npm: command not found"**
- Install Node.js from https://nodejs.org/

**"Module not found"**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Firebase errors**
- Check `.env` file exists and has correct values
- Restart server: `Ctrl+C` then `npm start`

**Build fails**
- Check terminal for error details
- Usually a syntax error or missing import

---

## 🔗 Important Links

- **GitHub Repo**: https://github.com/kaks2679/GoalFlow
- **Firebase Console**: https://console.firebase.google.com/
- **React Docs**: https://react.dev/learn
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 📞 Need Help?

1. Check `BEGINNER_GUIDE.md` for detailed steps
2. Search error message on Stack Overflow
3. Check Firebase Console for backend issues
4. Open GitHub issue for bugs

---

## 🎯 Quick Test

After setup, test these:
1. ✅ Sign up with email
2. ✅ Create a goal
3. ✅ Add a task
4. ✅ View dashboard
5. ✅ Update profile

---

## 💡 Next Steps

1. **Customize**: Change colors in `tailwind.config.js`
2. **Enhance**: Add full calendar with `react-big-calendar`
3. **Secure**: Update Firestore rules for production
4. **Monitor**: Check Firebase Console for usage
5. **Share**: Deploy and share your URL!

---

**That's it! You're ready to start forging your goals! 🎯**

*For detailed information, read the other guides.*
