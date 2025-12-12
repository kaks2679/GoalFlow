# 🎯 GoalForge - Personal Achievement Platform

A modern, full-stack productivity web application built with React and Firebase that helps users manage goals, track progress, and achieve more.

## ✨ Features

### 🔐 Authentication System
- Email/password authentication with validation
- Google Sign-In integration
- Password strength meter
- Email verification
- Password reset functionality
- "Remember me" option
- Secure user profiles

### 📊 Dashboard
- Real-time statistics and metrics
- Today's tasks overview
- Active goals tracking
- Productivity streak counter
- Quick actions panel
- Progress visualization

### 🎯 Goals Management
- Create, edit, and delete goals
- Multiple goal categories (study, fitness, finance, habit, personal, etc.)
- Progress tracking (0-100%)
- Deadline setting
- Priority levels (low, medium, high)
- Goal status tracking
- Tags and organization

### ✅ Tasks System
- Task creation with subtasks
- Natural language date parsing ("tomorrow at 3pm", "next Monday")
- Due dates and reminders
- Task status (todo, in progress, done)
- Priority levels
- Link tasks to goals
- Filter and search functionality

### 📅 Calendar
- Monthly/weekly/daily views
- Drag-and-drop event scheduling
- Color-coded events
- Task integration
- Goal deadline visualization
- Event categories

### 📈 Analytics
- Task completion charts
- Goal progress tracking
- Category breakdown
- Productivity streak analysis
- Time-based insights
- Visual progress reports

### 👤 Profile Management
- Update personal information
- Profile photo upload
- Theme preferences (light/dark mode)
- Language settings
- Timezone configuration
- Notification preferences

### 🔔 Notifications
- Browser push notifications
- Email reminders
- Task deadline alerts
- Goal milestone notifications
- Customizable notification settings

### 📎 Attachments
- Upload documents/images
- Link files to tasks and goals
- Firebase Storage integration

## 🛠️ Technology Stack

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization
- **date-fns** - Date manipulation
- **chrono-node** - Natural language date parsing
- **react-toastify** - Toast notifications
- **react-calendar** - Calendar component

### Backend
- **Firebase Authentication** - User management
- **Firebase Firestore** - NoSQL database
- **Firebase Storage** - File storage
- **Firebase Cloud Functions** - Serverless functions
- **Firebase Cloud Messaging** - Push notifications
- **Firebase Hosting** - Deployment

## 📁 Project Structure

```
goalforge/
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── firebase-messaging-sw.js
│   └── icons/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── ForgotPassword.js
│   │   │   └── PasswordStrengthMeter.js
│   │   ├── dashboard/
│   │   ├── goals/
│   │   ├── tasks/
│   │   ├── calendar/
│   │   ├── analytics/
│   │   ├── profile/
│   │   └── common/
│   │       ├── Layout.js
│   │       ├── Navbar.js
│   │       └── Sidebar.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── hooks/
│   │   └── useFirestore.js
│   ├── services/
│   │   ├── firebase.js
│   │   ├── goalsService.js
│   │   ├── tasksService.js
│   │   └── calendarService.js
│   ├── pages/
│   │   ├── Dashboard.js
│   │   ├── Goals.js
│   │   ├── Tasks.js
│   │   ├── Calendar.js
│   │   ├── Analytics.js
│   │   ├── Profile.js
│   │   └── Landing.js
│   ├── utils/
│   │   └── helpers.js
│   ├── App.js
│   └── index.js
├── .env.example
├── .gitignore
├── package.json
├── tailwind.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account (free tier is sufficient)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/goalforge.git
cd goalforge
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Firebase Setup

#### A. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: "goalforge" (or your choice)
4. Enable Google Analytics (optional)
5. Click "Create Project"

#### B. Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Email/Password** authentication
4. Enable **Google** sign-in provider
5. Add your authorized domain (e.g., localhost, your-domain.com)

#### C. Create Firestore Database
1. Go to **Firestore Database**
2. Click "Create Database"
3. Start in **Test Mode** (for development)
4. Choose your preferred location
5. Click "Enable"

#### D. Set Up Storage
1. Go to **Storage**
2. Click "Get Started"
3. Start in **Test Mode**
4. Choose same location as Firestore
5. Click "Done"

#### E. Get Firebase Configuration
1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon (</>) to register a web app
4. Register app name: "goalforge-web"
5. Copy the Firebase configuration object

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 5. Configure Firestore Security Rules

In Firebase Console, go to Firestore Database > Rules and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Goals
    match /goals/{goalId} {
      allow read, write: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Tasks
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Calendar Events
    match /events/{eventId} {
      allow read, write: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Reminders
    match /reminders/{reminderId} {
      allow read, write: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### 6. Configure Storage Security Rules

In Firebase Console, go to Storage > Rules and replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 7. Run Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

## 📦 Building for Production

### 1. Build the Application
```bash
npm run build
```

### 2. Deploy to Firebase Hosting

#### Install Firebase Tools
```bash
npm install -g firebase-tools
```

#### Login to Firebase
```bash
firebase login
```

#### Initialize Firebase Hosting
```bash
firebase init hosting
```

Select:
- Use existing project: Choose your Firebase project
- Public directory: `build`
- Configure as single-page app: `Yes`
- Set up automatic builds with GitHub: `No` (optional)
- Overwrite index.html: `No`

#### Deploy
```bash
firebase deploy
```

Your app will be live at: `https://your-project-id.web.app`

## 🔔 Setting Up Push Notifications (Optional)

### 1. Generate VAPID Key
```bash
firebase messaging:generate-key-pair
```

### 2. Create Service Worker

Create `public/firebase-messaging-sw.js`:

```javascript
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

### 3. Request Permission

Users will be prompted to allow notifications when they first use the app.

## 🔧 Troubleshooting

### Common Issues

#### 1. Authentication Errors
- Verify Firebase configuration in `.env`
- Check if authentication methods are enabled in Firebase Console
- Ensure authorized domains are added

#### 2. Firestore Permission Denied
- Review security rules in Firestore
- Ensure user is authenticated
- Check if userId matches in queries

#### 3. Build Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install --legacy-peer-deps` again
- Clear cache: `npm cache clean --force`

#### 4. Storage Upload Fails
- Check storage security rules
- Verify file size limits
- Ensure user is authenticated

## 📱 PWA Features

The app is a Progressive Web App (PWA) with:
- Offline support
- Install to home screen
- Fast loading with service workers
- Responsive design for all devices

## 🎨 Customization

### Changing Theme Colors

Edit `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
        secondary: '#your-color'
      }
    }
  }
}
```

### Adding New Goal Categories

Edit the categories array in your goals component or create a configuration file.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit changes: `git commit -m 'Add YourFeature'`
4. Push to branch: `git push origin feature/YourFeature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React team for the amazing framework
- Firebase team for the backend infrastructure
- Tailwind CSS for the styling system
- All open-source contributors

## 📧 Support

For support, email support@goalforge.app or open an issue in the repository.

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Team collaboration features
- [ ] AI-powered goal suggestions
- [ ] Integration with third-party calendars
- [ ] Voice commands
- [ ] Gamification elements
- [ ] Social features
- [ ] Export data functionality

---

**Built with ❤️ by the GoalForge Team**

Start forging your goals today! 🎯
