import { 
  words, 
  userProgress, 
  studySessions,
  type Word, 
  type InsertWord,
  type UserProgress,
  type InsertUserProgress,
  type StudySession,
  type InsertStudySession,
  type WordWithProgress,
  type DashboardStats,
  type FlashcardSession
} from "@shared/schema";
import fs from 'fs';
import path from 'path';

export interface IStorage {
  // Word management
  getAllWords(): Promise<Word[]>;
  getWordById(id: number): Promise<Word | undefined>;
  searchWords(query: string): Promise<Word[]>;
  filterWordsByCategory(category: string): Promise<Word[]>;
  createWord(word: InsertWord): Promise<Word>;
  importWordsFromJSON(jsonData: any[]): Promise<number>;
  
  // User progress
  getUserProgress(wordId: number): Promise<UserProgress | undefined>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getWordsForReview(): Promise<WordWithProgress[]>;
  getNewWords(limit: number): Promise<WordWithProgress[]>;
  
  // Study sessions
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  getRecentSessions(limit: number): Promise<StudySession[]>;
  
  // Dashboard stats
  getDashboardStats(): Promise<DashboardStats>;
  
  // Flashcard sessions
  createFlashcardSession(wordIds: number[]): Promise<FlashcardSession>;
  getFlashcardSession(sessionId: string): Promise<FlashcardSession | undefined>;
}

export class MemStorage implements IStorage {
  private words: Map<number, Word>;
  private userProgress: Map<number, UserProgress>;
  private studySessions: Map<number, StudySession>;
  private flashcardSessions: Map<string, FlashcardSession>;
  private currentWordId: number;
  private currentProgressId: number;
  private currentSessionId: number;

  constructor() {
    this.words = new Map();
    this.userProgress = new Map();
    this.studySessions = new Map();
    this.flashcardSessions = new Map();
    this.currentWordId = 1;
    this.currentProgressId = 1;
    this.currentSessionId = 1;
    
    this.loadWordsFromJSON();
  }

  private loadWordsFromJSON() {
    try {
      const wordsPath = path.join(process.cwd(), 'server', 'data', 'words.json');
      const wordsData = JSON.parse(fs.readFileSync(wordsPath, 'utf-8'));
      
      wordsData.forEach((wordData: any) => {
        const word: Word = {
          id: this.currentWordId++,
          ottoman: wordData.ottoman || wordData.word,
          pronunciation: wordData.pronunciation || wordData.transliteration,
          turkish: wordData.turkish || wordData.meaning,
          example: wordData.example || null,
          category: wordData.category || null,
          additionalMeanings: wordData.additional_meanings || wordData.additionalMeanings || [],
        };
        this.words.set(word.id, word);
      });
    } catch (error) {
      console.error('Error loading words from JSON:', error);
    }
  }

  async getAllWords(): Promise<Word[]> {
    return Array.from(this.words.values());
  }

  async getWordById(id: number): Promise<Word | undefined> {
    return this.words.get(id);
  }

  async searchWords(query: string): Promise<Word[]> {
    const words = Array.from(this.words.values());
    const lowerQuery = query.toLowerCase();
    
    return words.filter(word => 
      word.ottoman.toLowerCase().includes(lowerQuery) ||
      word.pronunciation.toLowerCase().includes(lowerQuery) ||
      word.turkish.toLowerCase().includes(lowerQuery)
    );
  }

  async filterWordsByCategory(category: string): Promise<Word[]> {
    const words = Array.from(this.words.values());
    return words.filter(word => word.category === category);
  }

  async createWord(insertWord: InsertWord): Promise<Word> {
    const word: Word = {
      id: this.currentWordId++,
      ottoman: insertWord.ottoman,
      pronunciation: insertWord.pronunciation,
      turkish: insertWord.turkish,
      example: insertWord.example || null,
      category: insertWord.category || null,
      additionalMeanings: insertWord.additionalMeanings || [],
    };
    this.words.set(word.id, word);
    return word;
  }

  async getUserProgress(wordId: number): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values()).find(p => p.wordId === wordId);
  }

  async updateUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const existingProgress = await this.getUserProgress(insertProgress.wordId);
    
    if (existingProgress) {
      const updatedProgress: UserProgress = {
        id: existingProgress.id,
        wordId: insertProgress.wordId,
        difficulty: insertProgress.difficulty ?? existingProgress.difficulty,
        repetitions: insertProgress.repetitions ?? existingProgress.repetitions,
        interval: insertProgress.interval ?? existingProgress.interval,
        easeFactor: insertProgress.easeFactor ?? existingProgress.easeFactor,
        nextReviewDate: insertProgress.nextReviewDate ?? existingProgress.nextReviewDate,
        lastStudied: insertProgress.lastStudied ?? existingProgress.lastStudied,
        correctAnswers: insertProgress.correctAnswers ?? existingProgress.correctAnswers,
        totalAnswers: insertProgress.totalAnswers ?? existingProgress.totalAnswers,
      };
      this.userProgress.set(existingProgress.id, updatedProgress);
      return updatedProgress;
    } else {
      const newProgress: UserProgress = {
        id: this.currentProgressId++,
        wordId: insertProgress.wordId,
        difficulty: insertProgress.difficulty ?? 0,
        repetitions: insertProgress.repetitions ?? 0,
        interval: insertProgress.interval ?? 1,
        easeFactor: insertProgress.easeFactor ?? 2.5,
        nextReviewDate: insertProgress.nextReviewDate ?? new Date(),
        lastStudied: insertProgress.lastStudied ?? null,
        correctAnswers: insertProgress.correctAnswers ?? 0,
        totalAnswers: insertProgress.totalAnswers ?? 0,
      };
      this.userProgress.set(newProgress.id, newProgress);
      return newProgress;
    }
  }

  async getWordsForReview(): Promise<WordWithProgress[]> {
    const now = new Date();
    const wordsWithProgress: WordWithProgress[] = [];
    
    for (const progress of Array.from(this.userProgress.values())) {
      if (progress.nextReviewDate <= now) {
        const word = this.words.get(progress.wordId);
        if (word) {
          wordsWithProgress.push({
            ...word,
            progress,
            nextReview: progress.nextReviewDate,
            isNew: false,
          });
        }
      }
    }
    
    return wordsWithProgress;
  }

  async getNewWords(limit: number): Promise<WordWithProgress[]> {
    const studiedWordIds = new Set(Array.from(this.userProgress.values()).map(p => p.wordId));
    const newWords: WordWithProgress[] = [];
    
    // Get all words, prioritizing newly imported ones (higher IDs)
    const allWords = Array.from(this.words.values()).sort((a, b) => b.id - a.id);
    
    for (const word of allWords) {
      if (!studiedWordIds.has(word.id)) {
        newWords.push({
          ...word,
          isNew: true,
        });
        
        // Remove limit check to return all available new words
        // if (newWords.length >= limit) break;
      }
    }
    
    return newWords;
  }

  async createStudySession(insertSession: InsertStudySession): Promise<StudySession> {
    const session: StudySession = {
      id: this.currentSessionId++,
      ...insertSession,
    };
    this.studySessions.set(session.id, session);
    return session;
  }

  async getRecentSessions(limit: number): Promise<StudySession[]> {
    const sessions = Array.from(this.studySessions.values());
    return sessions
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const allWords = Array.from(this.words.values());
    const allProgress = Array.from(this.userProgress.values());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const learnedWords = allProgress.filter(p => p.repetitions > 0).length;
    
    const todaySessions = Array.from(this.studySessions.values())
      .filter(s => s.date >= today);
    const todayStudyTime = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    
    const totalAnswers = allProgress.reduce((sum, p) => sum + p.totalAnswers, 0);
    const correctAnswers = allProgress.reduce((sum, p) => sum + p.correctAnswers, 0);
    const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
    
    // Calculate streak (simplified)
    const recentSessions = await this.getRecentSessions(30);
    let streak = 0;
    const oneDayMs = 24 * 60 * 60 * 1000;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
      const hasSessionThisDay = recentSessions.some(s => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === currentDate.getTime();
      });
      
      if (hasSessionThisDay) {
        streak++;
      } else {
        break;
      }
      
      currentDate = new Date(currentDate.getTime() - oneDayMs);
    }
    
    const pendingReviews = await this.getWordsForReview();
    const pendingFlashcards = await this.getNewWords(20);
    
    return {
      learnedWords,
      todayStudyTime,
      accuracy,
      streak,
      pendingFlashcards: pendingFlashcards.length,
      pendingReviews: pendingReviews.length,
      totalWords: allWords.length,
    };
  }

  async createFlashcardSession(wordIds: number[]): Promise<FlashcardSession> {
    const sessionId = Math.random().toString(36).substring(2, 15);
    const words: WordWithProgress[] = [];
    
    for (const wordId of wordIds) {
      const word = this.words.get(wordId);
      if (word) {
        const progress = await this.getUserProgress(wordId);
        words.push({
          ...word,
          progress,
          isNew: !progress,
        });
      }
    }
    
    const session: FlashcardSession = {
      words,
      currentIndex: 0,
      totalWords: words.length,
      sessionId,
    };
    
    this.flashcardSessions.set(sessionId, session);
    return session;
  }

  async getFlashcardSession(sessionId: string): Promise<FlashcardSession | undefined> {
    return this.flashcardSessions.get(sessionId);
  }

  async importWordsFromJSON(jsonData: any[]): Promise<number> {
    let importedCount = 0;
    
    jsonData.forEach((wordData: any) => {
      try {
        // Support both formats: new format (word, transliteration, meaning) and old format (ottoman, pronunciation, turkish)
        const word: Word = {
          id: this.currentWordId++,
          ottoman: wordData.word || wordData.ottoman || '',
          pronunciation: wordData.transliteration || wordData.pronunciation || '',
          turkish: wordData.meaning || wordData.turkish || '',
          example: wordData.example || null,
          category: wordData.category || null,
          additionalMeanings: wordData.additional_meanings || wordData.additionalMeanings || [],
        };
        
        if (word.ottoman && word.pronunciation && word.turkish) {
          this.words.set(word.id, word);
          importedCount++;
        }
      } catch (error) {
        console.error('Error importing word:', wordData, error);
      }
    });
    
    return importedCount;
  }
}

export const storage = new MemStorage();
