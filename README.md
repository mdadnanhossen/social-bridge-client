# Social Bridge – Frontend

Social Bridge is a community service platform designed to connect volunteers with people in need. It allows users to discover community service events, participate in social initiatives, and organize activities that make a positive impact on society.

This repository contains the frontend application of Social Bridge, built with Next.js and modern web technologies.

## 🚀 Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Better Auth
- MongoDB (via Backend API)
- Lucide React
- Sonner
- Base UI / shadcn components

## ✨ Features

- Modern and responsive user interface.
- User authentication and authorization.
- Google authentication integration.
- Browse upcoming community service events.
- Search events by keywords.
- Filter events by categories.
- View individual event details.
- Create new community service events.
- Manage events created by organizers.
- Update existing events.
- Delete events.
- Protected routes for authenticated users.
- Toast notifications for user feedback.
- Dark mode support.

## 📁 Project Structure

```text
social-bridge-client/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── forms/
│   │   ├── shared/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   └── ...
├── .env
├── .gitignore
├── next.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone YOUR_FRONTEND_REPOSITORY_URL
```

### 2. Navigate to the Project Directory

```bash
cd social-bridge-client
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=your_backend_api_url
BETTER_AUTH_URL=your_frontend_url
BETTER_AUTH_SECRET=your_auth_secret

BETTER_AUTH_GOOGLE_CLIENT_ID=your_google_client_id
BETTER_AUTH_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Important:** Replace the placeholder values with your actual environment configuration. Never expose secret keys or commit environment files to GitHub.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## 🔗 Backend Integration

Social Bridge frontend communicates with the Express.js backend through REST APIs.

The backend handles:

- Event creation and management.
- Event data retrieval.
- MongoDB database operations.
- JWT-based API authentication.
- Protected API requests.

Configure the backend URL using:

```env
NEXT_PUBLIC_API_URL=your_backend_api_url
```

## 🔐 Authentication

Better Auth is used for user authentication.

Authentication features include:

- Email and password authentication.
- Google OAuth integration.
- Session management.
- JWT-based authentication for protected backend API requests.

## 🌐 Deployment

The frontend is designed to be deployed on platforms such as Vercel.

Before deployment:

1. Push your code to GitHub.
2. Import the repository into Vercel.
3. Configure the required environment variables.
4. Deploy the application.
5. Ensure the backend API URL and authentication configuration are correct.

## 👨‍💻 Developer

**Md Adnan Hossen**

- GitHub: [mdadnanhossen](https://github.com/mdadnanhossen)
- LinkedIn: [adnan35](https://linkedin.com/in/adnan35)

---

<p align="center">
  Built with ❤️ for community service and social impact.
</p>