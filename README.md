# Email Routing Manager

Aplikasi web modern untuk mengelola Email Routing Cloudflare dengan antarmuka yang user-friendly dan responsif. Dibangun dengan Next.js 15, TypeScript, dan Tailwind CSS.

## 🚀 Fitur Utama

### ✅ Email Management
- **Buat Email Routing Baru**: Generate alamat email custom yang diteruskan ke email tujuan
- **Mode Otomatis**: Generator nama Indonesia acak (contoh: `budisantoso8x9@domain.com`)
- **Mode Manual**: Input alias email sesuai keinginan
- **Hapus Email**: Hapus routing rule dari Cloudflare dan database
- **Daftar Email**: Tampilkan semua email routing yang telah dibuat

### 🎨 User Interface
- **Modern Design**: Antarmuka yang bersih dan intuitif dengan shadcn/ui
- **Dark Mode**: Dukungan mode gelap untuk kenyamanan mata
- **Responsive**: Optimal di desktop dan mobile
- **Loading States**: Indikator loading saat proses API
- **Toast Notifications**: Notifikasi sukses/error yang elegan

### 🔐 Keamanan
- **API Token Management**: Token API Cloudflare yang aman
- **Environment Variables**: Tidak ada hardcoded credentials
- **Input Validation**: Validasi input otomatis
- **Error Handling**: Penanganan error yang komprehensif

### 📊 Dashboard
- **Statistics**: Total email, domain aktif, email aktif
- **Quick Actions**: Tombol refresh dan generate nama cepat
- **Real-time Updates**: Update otomatis setelah create/delete

## 🛠️ Teknologi

- **Frontend**: Next.js 15 dengan App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Prisma ORM dengan SQLite
- **API**: Cloudflare API v4 integration
- **Language**: TypeScript 5
- **State Management**: React Hooks
- **Notifications**: Sonner

## 📋 Prerequisites

Sebelum menggunakan aplikasi ini, pastikan:

1. **Akun Cloudflare** dengan Email Routing enabled
2. **Domain** yang sudah dikonfigurasi MX record ke Cloudflare
3. **API Token** Cloudflare dengan permissions:
   - `Zone:Read`
   - `Email Routing Rules:Edit`
4. **Destination Email** yang sudah diverifikasi di Cloudflare dashboard

## 🚀 Installation & Setup

### 1. Clone dan Install Dependencies
```bash
git clone <repository-url>
cd email-routing-manager
npm install
```

### 2. Environment Variables
Buat file `.env` di root project:
```env
DATABASE_URL="file:./db/custom.db"
```

### 3. Database Setup
```bash
npm run db:push
```

### 4. Jalankan Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📁 Struktur Project

```
src/
├── app/
│   ├── api/
│   │   ├── cloudflare/
│   │   │   └── zones/
│   │   │       └── route.ts          # API untuk fetch zones
│   │   └── email-routing/
│   │       ├── route.ts              # GET/POST email routing
│   │       └── [id]/
│   │           └── route.ts          # DELETE email routing
│   ├── layout.tsx                    # Root layout dengan toaster
│   ├── page.tsx                      # Main application page
│   └── globals.css                   # Global styles
├── components/
│   └── ui/                           # shadcn/ui components
├── lib/
│   ├── db.ts                         # Prisma database client
│   └── utils.ts                      # Utility functions
├── hooks/
│   └── use-toast.ts                  # Toast hook
└── prisma/
    └── schema.prisma                 # Database schema
```

## 🔗 API Endpoints

### Cloudflare Zones
- **GET** `/api/cloudflare/zones`
  - Fetch semua active zones dari akun Cloudflare
  - Response: `{ success: boolean, zones: Zone[] }`

### Email Routing
- **GET** `/api/email-routing`
  - Fetch semua email routing dari database
  - Response: `{ success: boolean, emails: EmailRouting[] }`

- **POST** `/api/email-routing`
  - Buat email routing baru
  - Body: `{ zoneId, aliasPart, destinationEmail }`
  - Response: `{ success: boolean, email: EmailRouting }`

- **DELETE** `/api/email-routing/[id]`
  - Hapus email routing
  - Body: `{ ruleId }`
  - Response: `{ success: boolean, message: string }`

## 📊 Database Schema

```sql
CREATE TABLE email_routing (
  id          TEXT PRIMARY KEY,
  zoneId      TEXT NOT NULL,
  zoneName    TEXT NOT NULL,
  aliasPart   TEXT NOT NULL,
  fullEmail   TEXT NOT NULL,
  ruleId      TEXT UNIQUE NOT NULL,    -- UUID dari Cloudflare API
  destination TEXT NOT NULL,
  isActive    BOOLEAN DEFAULT true,
  createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🎨 UI Components

### Main Features
1. **Header**: Logo, title, dan dark mode toggle
2. **Create Form**: 
   - Domain selector dropdown
   - Auto/Manual mode toggle
   - Destination email input
   - Create button dengan loading state
3. **Email List**: 
   - Card-based layout
   - Copy to clipboard functionality
   - Delete button dengan konfirmasi
   - Status badges
4. **Sidebar**: 
   - Statistics cards
   - Quick actions
   - Security info

### Indonesian Name Generator
```javascript
const indonesianFirstNames = [
  "budi", "siti", "agus", "dewi", "eko", "rina", 
  // ... 30+ nama Indonesia
];

const indonesianLastNames = [
  "santoso", "pratama", "wijaya", "kusuma", 
  // ... 24+ marga Indonesia
];
```

## 🔧 Configuration

### Cloudflare API Token
Token yang digunakan dalam aplikasi:
- **Permissions**: Zone:Read, Email Routing Rules:Edit
- **Account ID**: `6543986839c715461d19a855c7afa9d7`
- **Token**: `S8Use9zdidyGF7lg2FFbUU-mbfSMn2Qb9dHaX9ok`

### Database Configuration
- **Type**: SQLite
- **Location**: `./db/custom.db`
- **ORM**: Prisma
- **Migrations**: Otomatis dengan `npm run db:push`

## 🚀 Production Deployment

### Build Command
```bash
npm run build
```

### Environment Variables untuk Production
```env
DATABASE_URL="file:./db/custom.db"
NODE_ENV="production"
```

### Security Notes
- API Token disimpan sebagai environment variable
- Tidak ada hardcoded credentials
- HTTPS untuk production
- Input validation di backend dan frontend

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

Project ini menggunakan MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **API Error 401**: Check API token permissions
2. **Zone Not Found**: Pastikan zone status "active"
3. **Email Creation Failed**: Verifikasi MX record dan destination email
4. **Database Connection**: Check DATABASE_URL environment variable

### Debug Mode
Enable Prisma query logging:
```typescript
new PrismaClient({
  log: ['query'],
})
```

## 📞 Support

Jika mengalami masalah:
1. Check dev logs: `tail -f dev.log`
2. Verify Cloudflare configuration
3. Check database connection
4. Validate API token permissions

---

**Email Routing Manager** - Solusi modern untuk mengelola email Cloudflare dengan mudah dan aman.