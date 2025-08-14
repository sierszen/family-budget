# Family Budget - Inteligentne zarządzanie budżetem rodzinnym

Nowoczesna aplikacja webowa do zarządzania budżetem rodzinnym z wykorzystaniem sztucznej inteligencji, wykresów i zaawansowanych analiz.

## 🚀 Funkcjonalności

### Podstawowe funkcje
- ✅ **Dashboard** - Przegląd budżetu z kartami statystyk
- ✅ **Transakcje** - Dodawanie i zarządzanie przychodami/wydatkami
- ✅ **Kategorie** - Organizacja transakcji według kategorii
- ✅ **Członkowie rodziny** - Zarządzanie użytkownikami w rodzinie
- ✅ **Wykresy** - Wizualizacja wydatków i trendów
- ✅ **Limity miesięczne** - Ustawianie i monitorowanie limitów
- ✅ **Alerty** - Powiadomienia o przekroczeniu limitów

### AI Funkcjonalności
- 🤖 **AI Analiza** - Automatyczne analizy wydatków
- 💡 **Inteligentne podpowiedzi** - Sposoby oszczędzania
- 📊 **Predykcje** - Prognozy przyszłych wydatków
- 🎯 **Rekomendacje** - Personalizowane wskazówki

### Design i UX
- 🎨 **Nowoczesny design** - Gradient backgrounds, glassmorphism
- 📱 **Responsywny** - Działa na wszystkich urządzeniach
- ⚡ **Szybki** - Zoptymalizowana wydajność
- 🌙 **Dark mode ready** - Przygotowany na tryb ciemny

## 🛠️ Technologie

### Frontend
- **Next.js 14** - React framework z App Router
- **TypeScript** - Typowanie statyczne
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Biblioteka wykresów
- **Lucide React** - Ikony
- **Framer Motion** - Animacje

### Backend (planowany)
- **Next.js API Routes** - Backend w tym samym projekcie
- **Prisma** - ORM do bazy danych
- **PostgreSQL** - Baza danych
- **NextAuth.js** - Autoryzacja

### AI & Analytics
- **OpenAI API** - Analizy i podpowiedzi
- **Vercel Analytics** - Monitoring

## 🚀 Uruchomienie

### Wymagania
- Node.js >= 18.18.0
- npm lub yarn

### Instalacja

1. **Sklonuj repozytorium**
```bash
git clone <repository-url>
cd family-budget
```

2. **Zainstaluj zależności**
```bash
npm install
```

3. **Uruchom serwer deweloperski**
```bash
npm run dev
```

4. **Otwórz w przeglądarce**
```
http://localhost:3000
```

## 📁 Struktura projektu

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Główny layout
│   ├── page.tsx        # Strona główna
│   └── globals.css     # Globalne style
├── components/         # Komponenty React
│   ├── Header.tsx      # Nagłówek aplikacji
│   ├── Sidebar.tsx     # Boczne menu
│   ├── Dashboard.tsx   # Główny dashboard
│   ├── BudgetCard.tsx  # Karty statystyk
│   ├── ExpenseChart.tsx # Wykresy wydatków
│   ├── RecentTransactions.tsx # Ostatnie transakcje
│   └── AIInsights.tsx  # Podpowiedzi AI
├── lib/               # Funkcje pomocnicze
├── types/             # Definicje TypeScript
└── styles/            # Dodatkowe style
```

## 🎯 Plan rozwoju

### Faza 1 - Podstawowa funkcjonalność ✅
- [x] Dashboard z statystykami
- [x] Wykresy wydatków
- [x] Lista transakcji
- [x] Podpowiedzi AI (mock)

### Faza 2 - Backend i baza danych
- [ ] Konfiguracja Prisma
- [ ] Modele bazy danych
- [ ] API endpoints
- [ ] Autoryzacja

### Faza 3 - AI Integracja
- [ ] OpenAI API integration
- [ ] Analizy wydatków
- [ ] Predykcje
- [ ] Personalizowane rekomendacje

### Faza 4 - Zaawansowane funkcje
- [ ] Limity miesięczne
- [ ] Alerty i powiadomienia
- [ ] Eksport danych
- [ ] Backup i synchronizacja

### Faza 5 - Deployment
- [ ] Konfiguracja Vercel
- [ ] Baza danych w chmurze
- [ ] Monitoring i analytics
- [ ] CI/CD pipeline

## 🤝 Współpraca

1. Fork projektu
2. Stwórz branch dla nowej funkcjonalności (`git checkout -b feature/AmazingFeature`)
3. Commit zmian (`git commit -m 'Add some AmazingFeature'`)
4. Push do brancha (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

## 📄 Licencja

Ten projekt jest dostępny na licencji MIT. Zobacz plik `LICENSE` dla szczegółów.

## 🙏 Podziękowania

- [Next.js](https://nextjs.org/) - Za wspaniały framework
- [Tailwind CSS](https://tailwindcss.com/) - Za utility-first CSS
- [Recharts](https://recharts.org/) - Za bibliotekę wykresów
- [OpenAI](https://openai.com/) - Za API AI
