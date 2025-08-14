# 🏠 Family Budget - Inteligentne zarządzanie budżetem rodzinnym

Nowoczesna aplikacja webowa do zarządzania budżetem rodzinnym z integracją AI, automatycznymi analizami i inteligentnymi podpowiedziami.

## 🚀 Funkcjonalności

### Podstawowe
- ✅ **Zarządzanie użytkownikami** - Podział na członków rodziny
- ✅ **Transakcje** - Dodawanie przychodów i wydatków z kategoriami
- ✅ **Analizy** - Wykresy i raporty finansowe
- ✅ **Limity budżetowe** - Ustawianie i monitorowanie limitów
- ✅ **Historia transakcji** - Pełna historia z filtrowaniem

### AI i Automatyzacja
- 🤖 **OpenAI Integration** - Inteligentne podpowiedzi finansowe
- 📊 **Predykcje wydatków** - Analiza trendów i prognozy
- 🎯 **Personalizowane rekomendacje** - Dostosowane do stylu życia
- ⚠️ **Automatyczne alerty** - Powiadomienia o przekroczeniu limitów

### Bezpieczeństwo i Autoryzacja
- 🔐 **NextAuth.js** - Bezpieczna autoryzacja przez Google
- 👥 **Zarządzanie rodziną** - Kontrola dostępu i uprawnień
- 🔒 **Szyfrowanie danych** - Bezpieczne przechowywanie informacji

### Powiadomienia
- 📧 **Email notifications** - Raporty tygodniowe i alerty
- 🔔 **Push notifications** - Natychmiastowe powiadomienia
- 📊 **Automatyczne raporty** - Tygodniowe podsumowania

## 🛠️ Technologie

### Frontend
- **Next.js 15** - React framework z App Router
- **TypeScript** - Typowanie statyczne
- **Tailwind CSS** - Stylowanie utility-first
- **Shadcn/ui** - Komponenty UI
- **Recharts** - Wykresy i wizualizacje
- **Framer Motion** - Animacje
- **Lucide React** - Ikony

### Backend
- **Next.js API Routes** - Serverless API
- **Prisma** - ORM dla bazy danych
- **PostgreSQL** - Baza danych (Supabase/Neon)
- **NextAuth.js** - Autoryzacja i sesje

### AI i Analytics
- **OpenAI API** - Inteligentne podpowiedzi
- **Vercel Analytics** - Monitoring wydajności

### Deployment
- **Vercel** - Hosting i deployment
- **Supabase/Neon** - Cloud database

## 🚀 Uruchomienie

### 1. Klonowanie i instalacja
```bash
git clone https://github.com/your-username/family-budget.git
cd family-budget
npm install
```

### 2. Konfiguracja bazy danych

#### Opcja A: Supabase (Zalecane)
1. Utwórz konto na [supabase.com](https://supabase.com)
2. Utwórz nowy projekt
3. Skopiuj connection string z Settings > Database
4. Dodaj do `.env`:
```env
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
```

#### Opcja B: Neon
1. Utwórz konto na [neon.tech](https://neon.tech)
2. Utwórz nowy projekt
3. Skopiuj connection string
4. Dodaj do `.env`

### 3. Konfiguracja autoryzacji (Google OAuth)
1. Idź do [Google Cloud Console](https://console.cloud.google.com)
2. Utwórz nowy projekt
3. Włącz Google+ API
4. Utwórz OAuth 2.0 credentials
5. Dodaj do `.env`:
```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### 4. Konfiguracja OpenAI
1. Utwórz konto na [openai.com](https://openai.com)
2. Wygeneruj API key
3. Dodaj do `.env`:
```env
OPENAI_API_KEY="your-openai-api-key"
```

### 5. Konfiguracja email (Resend)
1. Utwórz konto na [resend.com](https://resend.com)
2. Wygeneruj API key
3. Dodaj do `.env`:
```env
RESEND_API_KEY="your-resend-api-key"
```

### 6. Zmienne środowiskowe
Skopiuj `env.example` do `.env` i wypełnij wszystkie wartości:
```bash
cp env.example .env
```

### 7. Migracja bazy danych
```bash
npx prisma generate
npx prisma db push
```

### 8. Uruchomienie aplikacji
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: http://localhost:3000

## 📁 Struktura projektu

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── auth/          # NextAuth.js routes
│   │   ├── transactions/  # Transakcje API
│   │   └── insights/      # AI insights API
│   ├── analytics/         # Strona analiz
│   ├── members/           # Zarządzanie członkami
│   ├── reports/           # Raporty
│   ├── settings/          # Ustawienia
│   └── transactions/      # Transakcje
├── components/            # Komponenty React
│   ├── ui/               # Komponenty UI
│   ├── charts/           # Komponenty wykresów
│   └── forms/            # Formularze
├── lib/                  # Biblioteki i konfiguracje
│   ├── prisma.ts         # Prisma client
│   ├── openai.ts         # OpenAI integration
│   └── notifications.ts  # System powiadomień
└── types/                # Definicje TypeScript
```

## 🎯 Plan rozwoju

### Faza 1: Podstawy ✅
- [x] Setup projektu Next.js
- [x] Podstawowe komponenty UI
- [x] Routing i nawigacja
- [x] Mock data i layout

### Faza 2: Backend i baza danych ✅
- [x] Konfiguracja Prisma
- [x] Modele bazy danych
- [x] API endpoints
- [x] Autoryzacja NextAuth.js

### Faza 3: AI i Analytics ✅
- [x] Integracja OpenAI
- [x] Generowanie insights
- [x] Predykcje wydatków
- [x] Inteligentne podpowiedzi

### Faza 4: Powiadomienia ✅
- [x] System email (Resend)
- [x] Powiadomienia w aplikacji
- [x] Automatyczne raporty
- [x] Alerty budżetowe

### Faza 5: Zaawansowane funkcje 🚧
- [ ] Import/export danych
- [ ] Zaawansowane wykresy
- [ ] Integracja z bankami
- [ ] Mobile app (React Native)

## 🤝 Współpraca

1. **Fork** projektu
2. Utwórz **feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit** zmian (`git commit -m 'Add some AmazingFeature'`)
4. **Push** do branch (`git push origin feature/AmazingFeature`)
5. Otwórz **Pull Request**

## 📄 Licencja

Ten projekt jest licencjonowany pod MIT License - zobacz plik [LICENSE](LICENSE) dla szczegółów.

## 🙏 Podziękowania

- [Next.js](https://nextjs.org/) - Framework React
- [Prisma](https://prisma.io/) - ORM
- [OpenAI](https://openai.com/) - AI API
- [Vercel](https://vercel.com/) - Deployment
- [Supabase](https://supabase.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - Styling
