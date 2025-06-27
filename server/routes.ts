import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserProgressSchema, insertStudySessionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all words
  app.get("/api/words", async (req, res) => {
    try {
      const words = await storage.getAllWords();
      res.json(words);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch words" });
    }
  });

  // Search words
  app.get("/api/words/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      const words = await storage.searchWords(q);
      res.json(words);
    } catch (error) {
      res.status(500).json({ error: "Failed to search words" });
    }
  });

  // Get words by category
  app.get("/api/words/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const words = await storage.filterWordsByCategory(category);
      res.json(words);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch words by category" });
    }
  });

  // Get dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Get words for review
  app.get("/api/study/review", async (req, res) => {
    try {
      const words = await storage.getWordsForReview();
      res.json(words);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch review words" });
    }
  });

  // Get new words for study
  app.get("/api/study/new", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const words = await storage.getNewWords(limit);
      res.json(words);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch new words" });
    }
  });

  // Create flashcard session
  app.post("/api/study/flashcard-session", async (req, res) => {
    try {
      const { type } = req.body;
      let words;
      
      if (type === "new") {
        words = await storage.getNewWords(1000); // Increased limit to get all available words
      } else if (type === "review") {
        words = await storage.getWordsForReview();
      } else {
        return res.status(400).json({ error: "Invalid session type" });
      }
      
      const wordIds = words.map(w => w.id);
      const session = await storage.createFlashcardSession(wordIds);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to create flashcard session" });
    }
  });

  // Get flashcard session
  app.get("/api/study/flashcard-session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getFlashcardSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch flashcard session" });
    }
  });

  // Update user progress
  app.post("/api/progress", async (req, res) => {
    try {
      const progressData = insertUserProgressSchema.parse(req.body);
      const progress = await storage.updateUserProgress(progressData);
      res.json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid progress data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update progress" });
      }
    }
  });

  // Create study session
  app.post("/api/study/session", async (req, res) => {
    try {
      const sessionData = insertStudySessionSchema.parse(req.body);
      const session = await storage.createStudySession(sessionData);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid session data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create study session" });
      }
    }
  });

  // Get recent study sessions
  app.get("/api/study/sessions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const sessions = await storage.getRecentSessions(limit);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch study sessions" });
    }
  });

  // Import words from JSON
  app.post("/api/words/import", async (req, res) => {
    try {
      const { words } = req.body;
      
      if (!Array.isArray(words)) {
        return res.status(400).json({ error: "Words must be an array" });
      }
      
      const importedCount = await storage.importWordsFromJSON(words);
      res.json({ 
        success: true, 
        imported: importedCount,
        message: `${importedCount} kelime başarıyla yüklendi`
      });
    } catch (error) {
      console.error('Import error:', error);
      res.status(500).json({ error: "Failed to import words" });
    }
  });

  // Save quiz result
  app.post("/api/study/quiz-result", async (req, res) => {
    try {
      const { score, totalQuestions, correctAnswers, timeSpent } = req.body;
      
      const session = await storage.createStudySession({
        date: new Date(),
        wordsStudied: totalQuestions,
        totalAnswers: totalQuestions,
        correctAnswers: correctAnswers,
        duration: Math.round(timeSpent / 60) // Convert seconds to minutes
      });

      res.json(session);
    } catch (error) {
      console.error('Quiz result error:', error);
      res.status(500).json({ error: "Failed to save quiz result" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
