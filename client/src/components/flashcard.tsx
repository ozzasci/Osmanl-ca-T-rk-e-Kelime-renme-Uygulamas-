import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { calculateNextReview } from "@/lib/spaced-repetition";
import type { FlashcardSession, WordWithProgress } from "@shared/schema";

interface FlashcardInterfaceProps {
  session: FlashcardSession;
  onSessionEnd: () => void;
}

export default function FlashcardInterface({ session, onSessionEnd }: FlashcardInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionData, setSessionData] = useState(session);
  const { toast } = useToast();

  const currentWord = sessionData.words[currentIndex];
  const progress = (currentIndex / sessionData.totalWords) * 100;

  const handleRevealAnswer = () => {
    setShowAnswer(true);
  };

  const handleAnswer = async (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!currentWord) return;

    // Move to next card immediately for better UX
    const moveToNext = () => {
      if (currentIndex < sessionData.totalWords - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        // Session completed
        toast({
          title: "Tebrikler! 🎉",
          description: `${sessionData.totalWords} kelimeyi tamamladınız!`,
        });
        onSessionEnd();
      }
    };

    // Update UI first
    moveToNext();

    // Then update progress in background
    try {
      const currentProgress = currentWord.progress;
      const nextReview = calculateNextReview(difficulty, currentProgress);

      // Update progress
      const progressResponse = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: currentWord.id,
          difficulty: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
          repetitions: (currentProgress?.repetitions || 0) + 1,
          interval: nextReview.interval,
          easeFactor: nextReview.easeFactor,
          nextReviewDate: nextReview.nextReviewDate.toISOString(),
          lastStudied: new Date().toISOString(),
          correctAnswers: (currentProgress?.correctAnswers || 0) + (difficulty === 'easy' ? 1 : 0),
          totalAnswers: (currentProgress?.totalAnswers || 0) + 1,
        }),
        credentials: 'include',
      });

      if (!progressResponse.ok) {
        console.error('Progress update failed:', progressResponse.status);
      }

      // Create study session record if this was the last card
      if (currentIndex >= sessionData.totalWords - 1) {
        await fetch('/api/study/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: new Date(),
            wordsStudied: sessionData.totalWords,
            correctAnswers: sessionData.totalWords, // Simplified
            totalAnswers: sessionData.totalWords,
            duration: 10, // Simplified - 10 minutes
          }),
          credentials: 'include',
        });

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      // Don't show error to user as card already moved
    }
  };

  if (!currentWord) {
    return (
      <div className="text-center">
        <p>Çalışılacak kelime bulunamadı.</p>
        <Button onClick={onSessionEnd} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri Dön
        </Button>
      </div>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onSessionEnd} className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri Dön
        </Button>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {currentIndex + 1} / {sessionData.totalWords}
          </div>
          <div className="w-32">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Flashcard Container */}
      <div className="max-w-2xl mx-auto">
        <Card className="material-shadow-lg min-h-[300px] relative">
          <CardContent className="p-8 flex flex-col justify-center items-center text-center h-full">
            {!showAnswer ? (
              // Front of card - Ottoman word
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Osmanlıca
                  </div>
                  <div className="text-4xl font-light text-gray-900 mb-4">
                    {currentWord.ottoman}
                  </div>
                  <div className="text-lg text-gray-600">
                    {currentWord.pronunciation}
                  </div>
                </div>
                
                <Button 
                  onClick={handleRevealAnswer}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                >
                  Cevabı Göster
                </Button>
              </div>
            ) : (
              // Back of card - Turkish meaning
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Türkçe Anlamı
                  </div>
                  <div className="text-3xl font-medium text-gray-900 mb-4">
                    {currentWord.turkish}
                  </div>
                  
                  {currentWord.additionalMeanings && currentWord.additionalMeanings.length > 0 && (
                    <div className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3 mb-3">
                      <strong>Diğer Anlamlar:</strong>
                      <ul className="mt-1 list-disc list-inside">
                        {currentWord.additionalMeanings.map((meaning, index) => (
                          <li key={index}>{meaning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {currentWord.example && (
                    <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      <strong>Örnek:</strong> {currentWord.example}
                    </div>
                  )}
                </div>

                {/* Answer Buttons */}
                <div className="flex space-x-4 justify-center">
                  <Button 
                    onClick={() => handleAnswer('hard')}
                    variant="destructive"
                    className="flex items-center space-x-2"
                  >
                    <span>❌</span>
                    <span>Zor</span>
                  </Button>
                  <Button 
                    onClick={() => handleAnswer('medium')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center space-x-2"
                  >
                    <span>⚠️</span>
                    <span>Orta</span>
                  </Button>
                  <Button 
                    onClick={() => handleAnswer('easy')}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
                  >
                    <span>✅</span>
                    <span>Kolay</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: sessionData.totalWords }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index < currentIndex 
                  ? 'bg-blue-600' 
                  : index === currentIndex 
                    ? 'bg-blue-400' 
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
