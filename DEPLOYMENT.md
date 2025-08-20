# Instrukcje Deploymentu - Family Budget

## 🚀 Deployment na Vercel (Zalecane)

### 1. Przygotowanie do deploymentu

1. **Upewnij się, że masz zainstalowany Node.js >= 18.18.0**
   ```bash
   node --version
   ```

2. **Zaktualizuj Node.js jeśli potrzeba:**
   ```bash
   # Używając nvm (Node Version Manager)
   nvm install 18.18.0
   nvm use 18.18.0

   # Lub pobierz z https://nodejs.org/
   ```

### 2. Deployment na Vercel

1. **Zainstaluj Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Zaloguj się do Vercel:**
   ```bash
   vercel login
   ```

3. **Wdróż aplikację:**
   ```bash
   cd family-budget
   vercel
   ```

4. **Postępuj zgodnie z instrukcjami:**
   - Wybierz "Link to existing project" lub "Create new project"
   - Wybierz domyślne ustawienia
   - Poczekaj na deployment

### 3. Konfiguracja zmiennych środowiskowych

W panelu Vercel dodaj następujące zmienne środowiskowe:

```env
# Database
DATABASE_URL=your_database_url_here

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://your-domain.vercel.app

# Google OAuth (opcjonalne)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OpenAI API (opcjonalne - dla funkcji AI)
OPENAI_API_KEY=your_openai_api_key_here

# Email Configuration (dla zaproszeń)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com

# Resend (Email) - alternatywa
RESEND_API_KEY=your_resend_api_key
```

## 🗄️ Konfiguracja bazy danych

### Opcja 1: Supabase (Zalecane)

1. **Utwórz konto na [supabase.com](https://supabase.com)**
2. **Utwórz nowy projekt**
3. **Skopiuj connection string**
4. **Dodaj do zmiennych środowiskowych:**
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

### Opcja 2: Neon (Alternatywa)

1. **Utwórz konto na [neon.tech](https://neon.tech)**
2. **Utwórz nowy projekt**
3. **Skopiuj connection string**
4. **Dodaj do zmiennych środowiskowych**

### Opcja 3: PlanetScale

1. **Utwórz konto na [planetscale.com](https://planetscale.com)**
2. **Utwórz nową bazę danych**
3. **Skopiuj connection string**
4. **Dodaj do zmiennych środowiskowych**

## 🔧 Konfiguracja Prisma (Faza 2)

Gdy będziesz gotowy na dodanie bazy danych:

1. **Zainstaluj Prisma:**
   ```bash
   npm install prisma @prisma/client
   ```

2. **Zainicjalizuj Prisma:**
   ```bash
   npx prisma init
   ```

3. **Skonfiguruj schema w `prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   generator client {
     provider = "prisma-client-js"
   }

   // Dodaj modele zgodnie z types/index.ts
   ```

4. **Wygeneruj i wdróż migracje:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## 🔐 Konfiguracja autoryzacji (Faza 2)

1. **Zainstaluj NextAuth.js:**
   ```bash
   npm install next-auth @auth/prisma-adapter
   ```

2. **Skonfiguruj NextAuth w `src/app/api/auth/[...nextauth]/route.ts`**

3. **Dodaj zmienne środowiskowe:**
   ```env
   NEXTAUTH_SECRET=your_random_secret_here
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

## 🤖 Konfiguracja OpenAI (Faza 3)

1. **Utwórz konto na [openai.com](https://openai.com)**
2. **Wygeneruj API key**
3. **Dodaj do zmiennych środowiskowych:**
   ```env
   OPENAI_API_KEY=sk-your_api_key_here
   ```

## 📊 Monitoring i Analytics

### Vercel Analytics

1. **Włącz Vercel Analytics w panelu Vercel**
2. **Dodaj do `src/app/layout.tsx`:**
   ```tsx
   import { Analytics } from '@vercel/analytics/react';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

### Google Analytics (Opcjonalne)

1. **Utwórz konto Google Analytics**
2. **Dodaj tracking ID do zmiennych środowiskowych:**
   ```env
   GA_TRACKING_ID=G-XXXXXXXXXX
   ```

## 🔄 CI/CD Pipeline

### GitHub Actions (Automatyczny deployment)

Utwórz plik `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🚀 Inne platformy deploymentu

### Netlify

1. **Połącz repozytorium z Netlify**
2. **Ustaw build command:**
   ```bash
   npm run build
   ```
3. **Ustaw publish directory:**
   ```
   .next
   ```

### Railway

1. **Połącz repozytorium z Railway**
2. **Dodaj zmienne środowiskowe**
3. **Railway automatycznie wykryje Next.js**

### DigitalOcean App Platform

1. **Utwórz nową aplikację**
2. **Połącz z repozytorium GitHub**
3. **Wybierz Node.js jako runtime**
4. **Ustaw build command:**
   ```bash
   npm run build
   ```

## 🔍 Testowanie przed deploymentem

1. **Uruchom testy lokalnie:**
   ```bash
   npm run build
   npm start
   ```

2. **Sprawdź czy wszystko działa:**
   - Dashboard ładuje się poprawnie
   - Wykresy wyświetlają się
   - Nawigacja działa
   - Responsywność na różnych urządzeniach

3. **Sprawdź konsolę przeglądarki pod kątem błędów**

## 📱 PWA (Progressive Web App)

Aby włączyć funkcje PWA:

1. **Zainstaluj next-pwa:**
   ```bash
   npm install next-pwa
   ```

2. **Skonfiguruj w `next.config.ts`:**
   ```typescript
   import withPWA from 'next-pwa';

   const nextConfig = withPWA({
     pwa: {
       dest: 'public',
       register: true,
       skipWaiting: true,
     },
   });

   export default nextConfig;
   ```

3. **Dodaj manifest w `public/manifest.json`**

## 🔒 Bezpieczeństwo

1. **Sprawdź zmienne środowiskowe:**
   - Nie commituj API keys do repozytorium
   - Używaj `.env.local` dla lokalnego rozwoju
   - Ustaw zmienne w panelu Vercel

2. **Włącz HTTPS:**
   - Vercel automatycznie obsługuje HTTPS
   - Sprawdź czy wszystkie zasoby ładują się przez HTTPS

3. **CORS (jeśli potrzebne):**
   ```typescript
   // next.config.ts
   const nextConfig = {
     async headers() {
       return [
         {
           source: '/api/:path*',
           headers: [
             { key: 'Access-Control-Allow-Origin', value: '*' },
           ],
         },
       ];
     },
   };
   ```

## 📈 Optymalizacja wydajności

1. **Obrazy:**
   - Używaj `next/image` dla optymalizacji
   - Ustaw odpowiednie rozmiary

2. **Fonty:**
   - Używaj `next/font` dla optymalizacji
   - Preload krytyczne fonty

3. **Bundle analysis:**
   ```bash
   npm install @next/bundle-analyzer
   ```

## 🆘 Rozwiązywanie problemów

### Błędy deploymentu

1. **Sprawdź logi w Vercel Dashboard**
2. **Upewnij się, że Node.js >= 18.18.0**
3. **Sprawdź czy wszystkie zależności są zainstalowane**

### Błędy runtime

1. **Sprawdź konsolę przeglądarki**
2. **Sprawdź logi serwera w Vercel Dashboard**
3. **Użyj try-catch dla obsługi błędów**

### Problemy z bazą danych

1. **Sprawdź connection string**
2. **Upewnij się, że baza danych jest dostępna**
3. **Sprawdź uprawnienia użytkownika bazy danych**

## 📞 Wsparcie

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **GitHub Issues:** Utwórz issue w repozytorium projektu
