'use client';

import { Search, Bell, User, Settings, LogOut, LogIn } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { PaymentReminders } from './CreditReminders';

export function Header() {
  const { data: session, status } = useSession();
  const [showPaymentReminders, setShowPaymentReminders] = useState(false);
  const [reminderCount, setReminderCount] = useState(0);

  const handleAuth = () => {
    if (session) {
      signOut();
    } else {
      signIn('google');
    }
  };

  // Pobierz liczbę przypomnień o kredytach
  const fetchReminderCount = async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/notifications/credit-reminders');
      if (response.ok) {
        const data = await response.json();
        setReminderCount(data.totalReminders || 0);
      }
    } catch (error) {
      console.error('Błąd pobierania liczby przypomnień:', error);
    }
  };

  useEffect(() => {
    fetchReminderCount();
    // Sprawdzaj raz dziennie o 9:00
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const timeUntilNextCheck = tomorrow.getTime() - now.getTime();

    const interval = setInterval(fetchReminderCount, 24 * 60 * 60 * 1000); // 24 godziny
    const initialTimeout = setTimeout(() => {
      fetchReminderCount();
      // Po pierwszym sprawdzeniu o 9:00, ustaw regularny interwał
      const regularInterval = setInterval(fetchReminderCount, 24 * 60 * 60 * 1000);
      return () => clearInterval(regularInterval);
    }, timeUntilNextCheck);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [session]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo i tytuł */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Family Budget</h1>
          </div>

          {/* Wyszukiwanie */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Szukaj transakcji..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Prawa strona */}
          <div className="flex items-center space-x-4">
            {/* Powiadomienia o kredytach */}
            {session && (
              <button
                onClick={() => setShowPaymentReminders(true)}
                className="p-2 text-gray-400 hover:text-gray-600 relative"
                title="Przypomnienia o płatnościach"
              >
                <Bell className="h-5 w-5" />
                {reminderCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {reminderCount}
                  </span>
                )}
              </button>
            )}

            {/* Ustawienia */}
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Settings className="h-5 w-5" />
            </button>

            {/* Profil użytkownika */}
            <div className="flex items-center space-x-3">
              {session ? (
                <>
                  <div className="flex items-center space-x-2">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {session.user?.name || 'Użytkownik'}
                    </span>
                  </div>
                  <button
                    onClick={handleAuth}
                    className="flex items-center space-x-1 text-gray-400 hover:text-gray-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Wyloguj</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAuth}
                  className="flex items-center space-x-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="text-sm">Zaloguj</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal z przypomnieniami o płatnościach */}
      <PaymentReminders
        isOpen={showPaymentReminders}
        onClose={() => setShowPaymentReminders(false)}
      />
    </header>
  );
}
