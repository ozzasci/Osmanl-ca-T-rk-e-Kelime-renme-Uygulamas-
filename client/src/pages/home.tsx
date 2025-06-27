import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BookOpen, Brain, Languages, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import StatsOverview from "@/components/stats-overview";
import WordBank from "@/components/word-bank";
import ActivityFeed from "@/components/activity-feed";
import FlashcardInterface from "@/components/flashcard";
import BottomNavigation from "@/components/bottom-navigation";
import FileUpload from "@/components/file-upload";
import AnalyticsDashboard from "@/components/analytics-dashboard";
import ProfileSettings from "@/components/profile-settings";
import QuizGames from "@/components/quiz-games";
import Translator from "@/components/translator";
import Copyright from "@/components/copyright";
import RecentUploads from "@/components/recent-uploads";
import { useState } from "react";
import type { DashboardStats, FlashcardSession } from "@shared/schema";

export default function Home() {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'flashcards' | 'wordbank' | 'upload' | 'analytics' | 'profile' | 'quiz' | 'translator' | 'copyright' | 'recent'>('dashboard');
  const [currentSession, setCurrentSession] = useState<FlashcardSession | null>(null);

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const startFlashcardSession = async (type: 'new' | 'review') => {
    try {
      const response = await fetch('/api/study/flashcard-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create session');
      }
      
      const session: FlashcardSession = await response.json();
      setCurrentSession(session);
      setActiveSection('flashcards');
    } catch (error) {
      console.error('Error starting flashcard session:', error);
    }
  };

  const endFlashcardSession = () => {
    setCurrentSession(null);
    setActiveSection('dashboard');
  };

  if (statsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Osmanlıca Sözlük</h1>
            </div>
            <div className="flex items-center space-x-4">
              {stats && (
                <>
                  <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                    <span className="text-orange-500">🔥</span>
                    <span>{stats.streak} gün</span>
                  </div>
                  <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                    <span className="text-yellow-500">🏆</span>
                    <span>{stats.learnedWords * 10} puan</span>
                  </div>
                </>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveSection('quiz')}
                className="hidden md:flex"
              >
                🧩 Quiz
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveSection('translator')}
                className="hidden md:flex"
              >
                🔄 Çeviri
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveSection('analytics')}
                className="hidden md:flex"
              >
                📊 Analiz
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveSection('profile')}
                className="hidden md:flex"
              >
                👤 Profil
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full p-2">
                <span className="text-xl">👤</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        
        {/* Dashboard Section */}
        {activeSection === 'dashboard' && (
          <>
            <StatsOverview stats={stats} isLoading={statsLoading} />
            
            {/* Quick Actions */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Çalışma</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Button
                  variant="outline"
                  className="bg-white material-shadow hover:material-shadow-lg p-6 h-auto flex-col items-start text-left transition-all duration-200"
                  onClick={() => startFlashcardSession('new')}
                >
                  <div className="flex items-center mb-3 w-full">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600">📚</span>
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900">Kelime Kartları</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">Yeni kelimeleri öğren ve mevcut bilgilerini pekiştir</p>
                  <div className="text-xs text-gray-500">
                    {stats ? `${stats.pendingFlashcards} kelime` : 'Yükleniyor...'} bekliyor
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="bg-white material-shadow hover:material-shadow-lg p-6 h-auto flex-col items-start text-left transition-all duration-200"
                  onClick={() => startFlashcardSession('review')}
                >
                  <div className="flex items-center mb-3 w-full">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600">🔄</span>
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900">Tekrar</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">Unutmaya başladığın kelimeleri tekrar et</p>
                  <div className="text-xs text-gray-500">
                    {stats ? `${stats.pendingReviews} kelime` : 'Yükleniyor...'} tekrar için hazır
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="bg-white material-shadow hover:material-shadow-lg p-6 h-auto flex-col items-start text-left transition-all duration-200"
                  onClick={() => setActiveSection('wordbank')}
                >
                  <div className="flex items-center mb-3 w-full">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600">🔍</span>
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900">Kelime Bankası</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">Tüm kelimeleri ara ve incele</p>
                  <div className="text-xs text-gray-500">
                    {stats ? `${stats.totalWords} kelime` : 'Yükleniyor...'} mevcut
                  </div>
                </Button>
              </div>
            </section>

            {/* Additional Features */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ek Özellikler</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="bg-white material-shadow hover:material-shadow-lg p-4 h-auto flex-col items-center text-center transition-all duration-200"
                  onClick={() => setActiveSection('quiz')}
                >
                  <Brain className="w-8 h-8 mb-2 text-purple-600" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Quiz & Oyunlar</h3>
                  <p className="text-xs text-gray-600">Eğlenceli testler</p>
                </Button>

                <Button
                  variant="outline"
                  className="bg-white material-shadow hover:material-shadow-lg p-4 h-auto flex-col items-center text-center transition-all duration-200"
                  onClick={() => setActiveSection('translator')}
                >
                  <Languages className="w-8 h-8 mb-2 text-green-600" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Çeviri</h3>
                  <p className="text-xs text-gray-600">Osmanlıca-Türkçe</p>
                </Button>

                <Button
                  variant="outline"
                  className="bg-white material-shadow hover:material-shadow-lg p-4 h-auto flex-col items-center text-center transition-all duration-200"
                  onClick={() => setActiveSection('recent')}
                >
                  <Clock className="w-8 h-8 mb-2 text-orange-600" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Son Yüklenenler</h3>
                  <p className="text-xs text-gray-600">Yeni kelimeler</p>
                </Button>

                <Button
                  variant="outline"
                  className="bg-white material-shadow hover:material-shadow-lg p-4 h-auto flex-col items-center text-center transition-all duration-200"
                  onClick={() => setActiveSection('upload')}
                >
                  <BookOpen className="w-8 h-8 mb-2 text-blue-600" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Kelime Yükle</h3>
                  <p className="text-xs text-gray-600">JSON dosyası</p>
                </Button>
              </div>
            </section>

            <ActivityFeed />
          </>
        )}

        {/* Flashcard Section */}
        {activeSection === 'flashcards' && currentSession && (
          <FlashcardInterface 
            session={currentSession} 
            onSessionEnd={endFlashcardSession}
          />
        )}

        {/* Word Bank Section */}
        {activeSection === 'wordbank' && (
          <WordBank onBackToDashboard={() => setActiveSection('dashboard')} />
        )}

        {/* File Upload Section */}
        {activeSection === 'upload' && (
          <div className="max-w-md mx-auto">
            <FileUpload onClose={() => setActiveSection('dashboard')} />
          </div>
        )}

        {/* Analytics Section */}
        {activeSection === 'analytics' && (
          <AnalyticsDashboard onBack={() => setActiveSection('dashboard')} />
        )}

        {/* Profile Section */}
        {activeSection === 'profile' && (
          <ProfileSettings onBack={() => setActiveSection('dashboard')} />
        )}

        {/* Quiz Games Section */}
        {activeSection === 'quiz' && (
          <QuizGames onBack={() => setActiveSection('dashboard')} />
        )}

        {/* Translator Section */}
        {activeSection === 'translator' && (
          <Translator onBack={() => setActiveSection('dashboard')} />
        )}

        {/* Copyright Section */}
        {activeSection === 'copyright' && (
          <Copyright onBack={() => setActiveSection('dashboard')} />
        )}

        {/* Recent Uploads Section */}
        {activeSection === 'recent' && (
          <RecentUploads onBack={() => setActiveSection('dashboard')} />
        )}

      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        onStartFlashcards={() => startFlashcardSession('new')}
      />
    </div>
  );
}
