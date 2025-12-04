# 🛠️ Panduan Pengembangan Email Routing Manager

Panduan lengkap untuk pengembang yang ingin mengembangkan atau memodifikasi Email Routing Manager.

## 📋 Daftar Isi

1. [Prerequisites](#prerequisites)
2. [Setup Development Environment](#setup-development-environment)
3. [Struktur Kode](#struktur-kode)
4. [Authentication System](#authentication-system)
5. [API Development](#api-development)
6. [Database Management](#database-management)
7. [Frontend Development](#frontend-development)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### Software yang Dibutuhkan
- **Node.js** v18+ 
- **npm** v9+
- **Git** v2+
- **VS Code** (recommended) dengan extensions:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Prisma
  - TypeScript Importer

### Akun yang Dibutuhkan
- **GitHub** untuk version control
- **Cloudflare** untuk API testing
- **Vercel** (optional) untuk deployment

## 🚀 Setup Development Environment

### 1. Clone Repository
```bash
git clone https://github.com/garword/EMAIL-ROUTING-FINAL.git
cd EMAIL-ROUTING-FINAL
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy .env.example ke .env
cp .env.example .env

# Edit .env file
DATABASE_URL="file:./db/custom.db"
```

### 4. Database Setup
```bash
# Push schema ke database
npm run db:push

# Generate Prisma client
npm run db:generate
```

### 5. Start Development Server
```bash
npm run dev
```

## 📁 Struktur Kode

### Core Files
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/          # Protected pages
│   ├── login/            # Authentication page
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
├── contexts/             # React contexts
├── lib/                 # Utility libraries
├── hooks/               # Custom hooks
└── prisma/              # Database schema
```

### Key Files Explanation

#### `src/contexts/auth-context.tsx`
```typescript
// Authentication context untuk state management
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Login logic dengan credentials check
  const login = (username: string, password: string) => {
    if (username === "windaa" && password === "cantik") {
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
      document.cookie = "isAuthenticated=true; path=/; max-age=86400";
      return true;
    }
    return false;
  };
}
```

#### `middleware.ts`
```typescript
// Middleware untuk route protection
export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get("isAuthenticated")?.value === "true";
  const protectedRoutes = ["/dashboard", "/dashboard/config"];
  
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
```

## 🔐 Authentication System

### Flow
1. **User visits `/`** → Check auth status → Redirect
2. **Not authenticated** → `/login`
3. **Authenticated** → `/dashboard`
4. **Login attempt** → Validate credentials → Set session
5. **Logout** → Clear session → Redirect to login

### Customization
```typescript
// Ubah credentials di src/contexts/auth-context.tsx
const CREDENTIALS = {
  username: "windaa",
  password: "cantik"
};
```

### Session Management
- **localStorage**: Untuk client-side persistence
- **Cookies**: Untuk middleware access
- **React Context**: Untuk state management

## 🌐 API Development

### API Routes Structure
```
src/app/api/
├── cloudflare/
│   ├── config/route.ts      # GET/POST Cloudflare config
│   └── zones/route.ts       # GET Cloudflare zones
└── email-routing/
    ├── route.ts              # GET/POST email routing
    └── [id]/route.ts        # DELETE email routing
```

### Creating New API Route
```typescript
// src/app/api/example/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const data = await db.example.findMany();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
```

### API Response Format
```typescript
// Success response
{
  "success": true,
  "data": { ... }
}

// Error response
{
  "success": false,
  "error": "Error message"
}
```

## 🗄️ Database Management

### Schema Design
```prisma
// prisma/schema.prisma
model CloudflareConfig {
  id                String   @id @default(cuid())
  apiToken          String
  accountId         String
  destinationEmails String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model EmailRouting {
  id          String   @id @default(cuid())
  zoneId      String
  zoneName    String
  aliasPart   String
  fullEmail   String
  ruleId      String   @unique
  destination String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Database Operations
```typescript
// Read operations
const configs = await db.cloudflareConfig.findMany();
const config = await db.cloudflareConfig.findFirst();
const emails = await db.emailRouting.findMany({
  orderBy: { createdAt: 'desc' }
});

// Create operations
const newEmail = await db.emailRouting.create({
  data: {
    zoneId: "zone123",
    aliasPart: "support",
    fullEmail: "support@domain.com",
    // ... other fields
  }
});

// Update operations
await db.cloudflareConfig.update({
  where: { id: "config123" },
  data: { apiToken: "new-token" }
});

// Delete operations
await db.emailRouting.delete({
  where: { id: "email123" }
});
```

### Database Migrations
```bash
# Push schema changes
npm run db:push

# Reset database
npm run db:reset

# Generate Prisma client
npm run db:generate
```

## 🎨 Frontend Development

### Component Structure
```typescript
// Example component dengan shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ExampleComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

### Using Custom Hooks
```typescript
// Authentication hook
import { useAuth } from "@/contexts/auth-context";

function MyComponent() {
  const { isAuthenticated, login, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <Button onClick={logout}>Logout</Button>
      ) : (
        <Button onClick={() => login("user", "pass")}>Login</Button>
      )}
    </div>
  );
}
```

### Language Support
```typescript
// Using translations
import { t } from "@/lib/translations";

function MyComponent() {
  return (
    <h1>{t("Email Routing Manager", "id")}</h1>
  );
}
```

### Styling with Tailwind
```typescript
// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Dark mode support
<div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">

// Custom components
<div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
```

## 🧪 Testing

### Manual Testing Checklist

#### Authentication
- [ ] Login dengan credentials benar
- [ ] Login dengan credentials salah
- [ ] Access protected route tanpa login
- [ ] Logout functionality
- [ ] Session persistence

#### Email Routing
- [ ] Create email routing (auto mode)
- [ ] Create email routing (manual mode)
- [ ] Delete email routing
- [ ] Copy email to clipboard
- [ ] Load email list

#### UI/UX
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Dark mode toggle
- [ ] Language switch
- [ ] Loading states
- [ ] Error messages
- [ ] Toast notifications

### Debug Tools
```typescript
// Enable console logging
console.log("Debug:", data);

// Network tab in browser dev tools
// Check API calls and responses

// Prisma query logging
const db = new PrismaClient({ log: ['query'] });
```

## 🚀 Deployment

### Build Process
```bash
# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Environment Variables
```env
# Production
DATABASE_URL="file:./db/custom.db"
NODE_ENV="production"

# Development
DATABASE_URL="file:./db/custom.db"
NODE_ENV="development"
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Authentication Not Working
```bash
# Check browser console for errors
# Verify localStorage and cookies
# Check AuthProvider in layout.tsx
```

#### 2. Database Connection Error
```bash
# Check DATABASE_URL in .env
# Run npm run db:push
# Check prisma/schema.prisma
```

#### 3. API Not Working
```bash
# Check API routes in src/app/api/
# Verify database operations
# Check network requests in browser
```

#### 4. Styling Issues
```bash
# Check Tailwind configuration
# Verify shadcn/ui components
# Check responsive classes
```

### Debug Commands
```bash
# Check database
npm run db:push

# Check types
npm run build

# Check linting
npm run lint

# Check dependencies
npm audit
```

## 📚 Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

### Useful Links
- [Cloudflare API Documentation](https://developers.cloudflare.com/api)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🔄 Development Workflow

### 1. Setup
```bash
git clone <repository>
cd EMAIL-ROUTING-FINAL
npm install
npm run db:push
npm run dev
```

### 2. Development
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# Test changes
# Commit changes
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/new-feature
```

### 3. Testing
```bash
# Run linting
npm run lint

# Build project
npm run build

# Test manually
npm run dev
```

### 4. Deployment
```bash
# Merge to main
git checkout main
git merge feature/new-feature

# Deploy
npm run build
npm start
```

## 🎯 Best Practices

### Code Quality
- Use TypeScript for type safety
- Follow ESLint rules
- Write clean, readable code
- Use meaningful variable names
- Add comments for complex logic

### Security
- Never commit sensitive data
- Use environment variables
- Validate user input
- Implement proper error handling
- Use HTTPS in production

### Performance
- Optimize images
- Use lazy loading
- Implement caching
- Minimize API calls
- Use efficient database queries

### UX/UI
- Follow responsive design principles
- Use consistent styling
- Provide loading states
- Handle errors gracefully
- Support accessibility

---

**Happy Coding!** 🚀

Untuk pertanyaan atau bantuan, silakan buka issue di GitHub repository.