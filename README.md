# **Qurato — Learn Without Distractions**

Qurato transforms any YouTube playlist into a clean, structured, distraction-free course.
If you’ve ever opened YouTube to learn something and ended up lost in recommendations… Qurato fixes that.

Turn playlists into courses, track your progress, and stay focused — **all in one place.**

---

## 🚀 **Features**

### **📌 Convert YouTube Playlists into Courses**

Paste either:
* A YouTube playlist link
or
* One or more individual YouTube video links

Qurato will:
* Extracts all videos
* Organizes them into lessons
* Removes all YouTube distractions
* Gives you a minimal learning interface
  
### **🎯 Track Your Learning Progress**

* Mark lessons as completed
* Auto-start the next incomplete lesson
* See your completion percentage on the dashboard

### **💾 Save & Manage Courses**

* Save any course
* Quickly access created or saved courses
* Edit course title/description
* Delete or manage lessons easily

### **🔗 Share Courses**

Every course gets a unique public share link — share your playlists as clean learning paths.

### **🌗 Modern UI + Dark/Light Mode**

A sleek, minimal interface built for productivity:

* Beautiful modern design
* Intuitive UX
* Fully responsive
* Smooth animations
* Dark/light mode support

---

## 🧩 **Tech Stack**

### **Frontend**

* **Next.js 14 (App Router)**
* **React + TypeScript**
* **Tailwind CSS**
* **Framer Motion** (animations)
* **NextAuth.js** (auth)

### **Backend**

* **Next.js Route Handlers**
* **Prisma ORM**
* **MongoDB**

### **Other**

* **ShadCN UI components**
* **Vercel** (hosting)
* **YouTube API** parsing + custom extraction

---

## 📦 **Installation & Setup**

Clone the repo:

```bash
git clone https://github.com/yourusername/qurato.git
cd qurato
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```
DATABASE_URL=your_mongodb_connection_string
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Run the dev server:

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ **Core Workflow**

### **Creating a Course**

1. Click **Create +**
2. Paste a YouTube playlist link
3. Qurato auto-generates:

   * Course title
   * Thumbnail
   * All lessons
4. You can edit, delete, or reorder lessons.

### **Learning**

* Open any lesson
* Watch in a clean distraction-free player
* Mark completed
* Autoplay moves to the next incomplete lesson
* Track full course progress

---

## 📁 **Project Structure**

```
/app
  ├── (routes)
  ├── api
  │   ├── course
  │   ├── lecture
  │   └── auth
/components
/lib
/prisma
/public
/types
```

---

## 🧪 **Production Ready**

* Optimistic UI updates
* Error handling on all endpoints
* 100% mobile-first
* Server actions + caching
* Secure auth
* Scalable prisma models

---

## 🔮 **Upcoming Features**

* Notes inside lessons
* Daily streaks
* Course recommendation engine
* Export progress
* Upload custom videos

---

## 🤝 **Contribute**

PRs are welcome!
If you’d like to contribute, just open an issue or create a pull request.

---

## ⭐ **Support the Project**

If you like Qurato, consider starring the repo — it helps a lot!

---

## 👨‍💻 **Made by Utkal**

Built with love, focus, and a desire to learn without noise.

