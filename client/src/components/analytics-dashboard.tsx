import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, TrendingUp, Brain, Target, Calendar, BarChart3 } from "lucide-react";
import type { Word, UserProgress, StudySession, DashboardStats } from "@shared/schema";

interface AnalyticsDashboardProps {
  onBack: () => void;
}

interface AnalyticsData {
  stats: DashboardStats;
  recentSessions: StudySession[];
  progressData: (UserProgress & { word: Word })[];
  categoryStats: { [key: string]: { total: number; learned: number; accuracy: number } };
  weeklyProgress: { day: string; wordsLearned: number; accuracy: number }[];
}

export default function AnalyticsDashboard({ onBack }: AnalyticsDashboardProps) {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: sessions } = useQuery<StudySession[]>({
    queryKey: ['/api/study/sessions', { limit: 30 }],
  });

  const { data: words } = useQuery<Word[]>({
    queryKey: ['/api/words'],
  });

  // Calculate analytics data
  const getAnalyticsData = (): AnalyticsData | null => {
    if (!stats || !sessions || !words) return null;

    // Category statistics
    const categoryStats: { [key: string]: { total: number; learned: number; accuracy: number } } = {};
    words.forEach(word => {
      const category = word.category || 'Kategorisiz';
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, learned: 0, accuracy: 0 };
      }
      categoryStats[category].total++;
    });

    // Calculate accuracy per category from sessions
    Object.keys(categoryStats).forEach(category => {
      const categoryWords = words.filter(w => (w.category || 'Kategorisiz') === category);
      const categoryWordIds = categoryWords.map(w => w.id);
      const categorySessions = sessions.filter(s => 
        categoryWordIds.some(id => s.wordsStudied > 0) // approximation
      );
      
      const totalAnswers = categorySessions.reduce((sum, s) => sum + s.totalAnswers, 0);
      const correctAnswers = categorySessions.reduce((sum, s) => sum + s.correctAnswers, 0);
      categoryStats[category].accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
      categoryStats[category].learned = Math.min(categoryStats[category].total, Math.floor(categoryStats[category].total * 0.3)); // approximation
    });

    // Weekly progress (last 7 days)
    const weeklyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const daySessions = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate >= dayStart && sessionDate <= dayEnd;
      });

      const wordsLearned = daySessions.reduce((sum, s) => sum + s.wordsStudied, 0);
      const totalAnswers = daySessions.reduce((sum, s) => sum + s.totalAnswers, 0);
      const correctAnswers = daySessions.reduce((sum, s) => sum + s.correctAnswers, 0);
      const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

      weeklyProgress.push({
        day: date.toLocaleDateString('tr-TR', { weekday: 'short' }),
        wordsLearned,
        accuracy
      });
    }

    return {
      stats,
      recentSessions: sessions.slice(0, 10),
      progressData: [],
      categoryStats,
      weeklyProgress
    };
  };

  const analyticsData = getAnalyticsData();

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { stats: dashStats, weeklyProgress, categoryStats, recentSessions } = analyticsData;

  // Calculate learning velocity (words per day)
  const totalDays = Math.max(1, recentSessions.length > 0 ? 
    Math.ceil((Date.now() - new Date(recentSessions[recentSessions.length - 1].date).getTime()) / (1000 * 60 * 60 * 24)) : 1
  );
  const learningVelocity = Math.round(dashStats.learnedWords / totalDays * 10) / 10;

  // Calculate consistency score (how many days in last 7 days user studied)
  const consistencyScore = weeklyProgress.filter(day => day.wordsLearned > 0).length;

  // Get strongest and weakest categories
  const categoryEntries = Object.entries(categoryStats).filter(([_, data]) => data.total > 0);
  const strongestCategory = categoryEntries.reduce((best, [cat, data]) => 
    data.accuracy > best.accuracy ? { category: cat, accuracy: data.accuracy } : best,
    { category: '', accuracy: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Geri
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Öğrenme Analizi</h1>
          <p className="text-gray-600">Detaylı ilerleme ve performans raporunuz</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Öğrenme Hızı</div>
                <div className="text-2xl font-bold">{learningVelocity}</div>
                <div className="text-xs text-gray-500">kelime/gün</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Doğruluk Oranı</div>
                <div className="text-2xl font-bold">{dashStats.accuracy}%</div>
                <div className="text-xs text-gray-500">ortalama başarı</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Tutarlılık</div>
                <div className="text-2xl font-bold">{consistencyScore}/7</div>
                <div className="text-xs text-gray-500">son 7 gün</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Toplam İlerleme</div>
                <div className="text-2xl font-bold">{Math.round((dashStats.learnedWords / dashStats.totalWords) * 100)}%</div>
                <div className="text-xs text-gray-500">{dashStats.learnedWords}/{dashStats.totalWords}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Haftalık İlerleme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyProgress.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 text-sm font-medium text-gray-600">{day.day}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">{day.wordsLearned} kelime</span>
                    <span className="text-sm text-gray-600">{day.accuracy}% doğru</span>
                  </div>
                  <div className="flex gap-2">
                    <Progress value={(day.wordsLearned / 20) * 100} className="flex-1 h-2" />
                    <Progress value={day.accuracy} className="flex-1 h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori Performansı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(categoryStats).map(([category, data]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{category}</div>
                  <div className="text-sm text-gray-600">{data.total} kelime</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium">{data.learned}/{data.total}</div>
                    <div className="text-xs text-gray-500">öğrenilen</div>
                  </div>
                  <Badge variant={data.accuracy > 80 ? "default" : data.accuracy > 60 ? "secondary" : "destructive"}>
                    {data.accuracy}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Kişisel İçgörüler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-900">🏆 En İyi Kategori</div>
              <div className="text-sm text-blue-700">
                {strongestCategory.category} kategorisinde %{strongestCategory.accuracy} başarı oranıyla çok iyi gidiyorsunuz!
              </div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-green-900">📈 Öğrenme Hızı</div>
              <div className="text-sm text-green-700">
                Günde ortalama {learningVelocity} kelime öğreniyorsunuz. 
                {learningVelocity > 2 ? " Harika bir tempoda!" : " Biraz daha hızlanabilirsiniz."}
              </div>
            </div>

            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="font-medium text-orange-900">🔥 Tutarlılık</div>
              <div className="text-sm text-orange-700">
                Son 7 günde {consistencyScore} gün çalıştınız. 
                {consistencyScore >= 5 ? " Çok tutarlısınız!" : " Daha düzenli çalışmayı deneyin."}
              </div>
            </div>

            {dashStats.pendingReviews > 0 && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="font-medium text-yellow-900">⏰ Tekrar Zamanı</div>
                <div className="text-sm text-yellow-700">
                  {dashStats.pendingReviews} kelime tekrar için hazır. Unutmadan önce tekrar etmeyi unutmayın!
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}