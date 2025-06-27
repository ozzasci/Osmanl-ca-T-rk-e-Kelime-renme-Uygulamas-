import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Brain, Zap, Target, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Word } from "@shared/schema";

interface QuizGamesProps {
  onBack: () => void;
}

interface QuizQuestion {
  word: Word;
  options: string[];
  correctAnswer: string;
  type: 'ottoman-to-turkish' | 'turkish-to-ottoman';
}

interface GameResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
}

type GameMode = 'multiple-choice' | 'matching' | 'typing' | 'speed-round';

export default function QuizGames({ onBack }: QuizGamesProps) {
  const { toast } = useToast();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [userInput, setUserInput] = useState("");

  const { data: words } = useQuery<Word[]>({
    queryKey: ['/api/words'],
  });

  const saveResultMutation = useMutation({
    mutationFn: async (result: GameResult) => {
      return apiRequest("/api/study/quiz-result", "POST", result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    }
  });

  const generateQuiz = (mode: GameMode, wordCount: number = 10) => {
    if (!words || words.length < 4) return [];

    const selectedWords = words.sort(() => Math.random() - 0.5).slice(0, wordCount);
    const questions: QuizQuestion[] = [];

    for (const word of selectedWords) {
      const questionType = Math.random() > 0.5 ? 'ottoman-to-turkish' : 'turkish-to-ottoman';
      
      if (mode === 'multiple-choice') {
        const incorrectOptions = words
          .filter(w => w.id !== word.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(w => questionType === 'ottoman-to-turkish' ? w.turkish : w.ottoman);

        const correctAnswer = questionType === 'ottoman-to-turkish' ? word.turkish : word.ottoman;
        const options = [correctAnswer, ...incorrectOptions].sort(() => Math.random() - 0.5);

        questions.push({
          word,
          options,
          correctAnswer,
          type: questionType
        });
      }
    }

    return questions;
  };

  const startGame = (mode: GameMode) => {
    setSelectedMode(mode);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setGameStartTime(new Date());
    
    const quiz = generateQuiz(mode);
    setCurrentQuiz(quiz);
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const submitAnswer = () => {
    const currentQuestion = currentQuiz[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer || 
                     (selectedMode === 'typing' && userInput.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim());

    if (isCorrect) {
      setScore(score + 1);
      toast({
        title: "Doğru!",
        description: "Tebrikler, doğru cevap!",
      });
    } else {
      toast({
        title: "Yanlış",
        description: `Doğru cevap: ${currentQuestion.correctAnswer}`,
        variant: "destructive",
      });
    }

    // Next question or end game
    if (currentQuestionIndex + 1 < currentQuiz.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer("");
      setUserInput("");
    } else {
      endGame();
    }
  };

  const endGame = () => {
    const timeSpent = gameStartTime ? Math.floor((Date.now() - gameStartTime.getTime()) / 1000) : 0;
    const result: GameResult = {
      score: Math.round((score / currentQuiz.length) * 100),
      totalQuestions: currentQuiz.length,
      correctAnswers: score,
      timeSpent
    };

    saveResultMutation.mutate(result);
    setShowResult(true);
  };

  const resetGame = () => {
    setSelectedMode(null);
    setCurrentQuiz([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer("");
    setUserInput("");
  };

  if (!words || words.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Geri
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Quiz ve Oyunlar</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Quiz oyunları için önce kelime yüklemeniz gerekiyor.</p>
            <Button onClick={onBack} className="mt-4">
              Kelime Yükle
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / currentQuiz.length) * 100);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Geri
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Sonucu</h1>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <CardTitle className="text-2xl">Tebrikler!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="text-4xl font-bold text-blue-600">{percentage}%</div>
            <p className="text-gray-600">
              {score} / {currentQuiz.length} doğru cevap
            </p>
            
            <div className="space-y-2">
              <Badge variant={percentage >= 80 ? "default" : percentage >= 60 ? "secondary" : "destructive"}>
                {percentage >= 80 ? "Mükemmel!" : percentage >= 60 ? "İyi!" : "Daha çok çalışmalısın"}
              </Badge>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={resetGame} className="flex-1">
                Yeni Oyun
              </Button>
              <Button variant="outline" onClick={onBack} className="flex-1">
                Ana Sayfa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedMode && currentQuiz.length > 0) {
    const currentQuestion = currentQuiz[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuiz.length) * 100;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={resetGame} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Geri
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Quiz</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-gray-600">
                Soru {currentQuestionIndex + 1} / {currentQuiz.length}
              </span>
              <div className="flex-1 max-w-xs">
                <Progress value={progress} className="h-2" />
              </div>
              <span className="text-sm font-medium text-blue-600">
                Skor: {score}
              </span>
            </div>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                  {currentQuestion.type === 'ottoman-to-turkish' ? 'Bu Osmanlıca kelimenin Türkçe karşılığı nedir?' : 'Bu Türkçe kelimenin Osmanlıca karşılığı nedir?'}
                </div>
                <div className="text-3xl font-light text-gray-900 mb-6">
                  {currentQuestion.type === 'ottoman-to-turkish' ? currentQuestion.word.ottoman : currentQuestion.word.turkish}
                </div>
                {currentQuestion.type === 'ottoman-to-turkish' && (
                  <div className="text-lg text-gray-600 mb-6">
                    {currentQuestion.word.pronunciation}
                  </div>
                )}
              </div>

              {selectedMode === 'multiple-choice' && (
                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      variant={selectedAnswer === option ? "default" : "outline"}
                      onClick={() => handleAnswerSelect(option)}
                      className="p-4 h-auto text-left justify-start"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}

              {selectedMode === 'typing' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Cevabınızı yazın..."
                    className="w-full p-3 border border-gray-300 rounded-lg text-center text-lg"
                    onKeyPress={(e) => e.key === 'Enter' && userInput.trim() && submitAnswer()}
                  />
                </div>
              )}

              <Button 
                onClick={submitAnswer}
                disabled={!selectedAnswer && !userInput.trim()}
                className="px-8 py-3"
              >
                {currentQuestionIndex + 1 === currentQuiz.length ? 'Bitir' : 'Sonraki'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Geri
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz ve Oyunlar</h1>
          <p className="text-gray-600">Osmanlıca kelimelerinizi eğlenceli oyunlarla test edin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => startGame('multiple-choice')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Target className="w-6 h-6 text-blue-600" />
              Çoktan Seçmeli Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Osmanlıca kelimelerin Türkçe karşılıklarını 4 seçenekten bulun.
            </p>
            <Badge variant="secondary">10 Soru</Badge>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => startGame('typing')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-green-600" />
              Yazarak Cevapla
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Osmanlıca kelimelerin karşılığını yazarak bulun.
            </p>
            <Badge variant="secondary">Zorlu Mod</Badge>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => startGame('multiple-choice')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-yellow-600" />
              Hızlı Tur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Süreye karşı kelime bilginizi test edin.
            </p>
            <Badge variant="secondary">20 Soru - 2 Dakika</Badge>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-purple-600" />
              Eşleştirme Oyunu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Osmanlıca ve Türkçe kelimeleri eşleştirin.
            </p>
            <Badge variant="outline">Yakında</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">💡 İpucu</h3>
        <p className="text-blue-800 text-sm">
          Quiz oyunları öğrenme ilerlemenizi hızlandırır ve kelime bilginizi pekiştirir. 
          Düzenli olarak quiz çözerek Osmanlıca kelime dağarcığınızı genişletebilirsiniz.
        </p>
      </div>
    </div>
  );
}