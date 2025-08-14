import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertWarbandSchema, 
  insertFighterSchema, 
  insertBattleSchema, 
  insertBattleFighterStatsSchema,
  insertWarbandLikeSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Warband routes (protected)
  app.get("/api/warbands", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const warbands = await storage.getWarbands(userId);
    res.json(warbands);
  });
  
  app.get("/api/warbands/:id", isAuthenticated, async (req: any, res) => {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.claims.sub;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid warband ID" });
    }
    
    const warband = await storage.getWarband(id, userId);
    if (!warband) {
      return res.status(404).json({ message: "Warband not found" });
    }
    
    res.json(warband);
  });
  
  app.post("/api/warbands", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertWarbandSchema.parse({ ...req.body, userId });
      const warband = await storage.createWarband(validatedData);
      res.status(201).json(warband);
    } catch (error) {
      res.status(400).json({ message: "Invalid warband data", error });
    }
  });
  
  app.patch("/api/warbands/:id", isAuthenticated, async (req: any, res) => {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.claims.sub;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid warband ID" });
    }
    
    try {
      const validatedData = insertWarbandSchema.partial().omit({ userId: true }).parse(req.body);
      const warband = await storage.updateWarband(id, validatedData, userId);
      
      if (!warband) {
        return res.status(404).json({ message: "Warband not found" });
      }
      
      res.json(warband);
    } catch (error) {
      res.status(400).json({ message: "Invalid warband data", error });
    }
  });
  
  app.delete("/api/warbands/:id", isAuthenticated, async (req: any, res) => {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.claims.sub;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid warband ID" });
    }
    
    const success = await storage.deleteWarband(id, userId);
    if (!success) {
      return res.status(404).json({ message: "Warband not found" });
    }
    
    res.status(204).end();
  });

  // Public warband routes (no auth required)
  app.get("/api/public/warbands", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const warbands = await storage.getPublicWarbands(limit);
      res.json(warbands);
    } catch (error) {
      console.error("Error fetching public warbands:", error);
      res.status(500).json({ message: "Failed to fetch public warbands" });
    }
  });

  app.get("/api/public/warbands/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid warband ID" });
      }

      const warband = await storage.getWarband(id);
      if (!warband || !warband.isPublic) {
        return res.status(404).json({ message: "Public warband not found" });
      }

      // Increment view count
      await storage.incrementWarbandViews(id);
      
      res.json(warband);
    } catch (error) {
      console.error("Error fetching public warband:", error);
      res.status(500).json({ message: "Failed to fetch public warband" });
    }
  });

  app.get("/api/public/warbands/:id/fighters", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid warband ID" });
      }

      // First check if the warband exists and is public
      const warband = await storage.getWarband(id);
      if (!warband || !warband.isPublic) {
        return res.status(404).json({ message: "Public warband not found" });
      }

      const fighters = await storage.getFightersByWarbandId(id);
      res.json(fighters);
    } catch (error) {
      console.error("Error fetching public warband fighters:", error);
      res.status(500).json({ message: "Failed to fetch fighters" });
    }
  });

  app.post("/api/public/warbands/:id/duplicate", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { name } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid warband ID" });
      }

      // Check if user is authenticated for permanent save
      let userId = null;
      if (req.user && (req.user as any).claims) {
        userId = (req.user as any).claims.sub;
      }

      const duplicatedWarband = await storage.duplicateWarband(id, userId, name);
      if (!duplicatedWarband) {
        return res.status(404).json({ message: "Warband not found" });
      }

      res.status(201).json(duplicatedWarband);
    } catch (error) {
      console.error("Error duplicating warband:", error);
      res.status(500).json({ message: "Failed to duplicate warband" });
    }
  });

  // Warband likes routes (protected)
  app.post("/api/warbands/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user.claims.sub;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid warband ID" });
      }

      const like = await storage.likeWarband(userId, id);
      res.status(201).json(like);
    } catch (error) {
      console.error("Error liking warband:", error);
      res.status(500).json({ message: "Failed to like warband" });
    }
  });

  app.delete("/api/warbands/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user.claims.sub;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid warband ID" });
      }

      const success = await storage.unlikeWarband(userId, id);
      if (!success) {
        return res.status(404).json({ message: "Like not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error unliking warband:", error);
      res.status(500).json({ message: "Failed to unlike warband" });
    }
  });

  app.get("/api/warbands/:id/liked", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user.claims.sub;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid warband ID" });
      }

      const isLiked = await storage.isWarbandLiked(userId, id);
      res.json({ isLiked });
    } catch (error) {
      console.error("Error checking warband like status:", error);
      res.status(500).json({ message: "Failed to check like status" });
    }
  });
  
  // Fighter routes (protected)
  app.get("/api/fighters", isAuthenticated, async (req: any, res) => {
    const warbandId = req.query.warbandId ? parseInt(req.query.warbandId as string, 10) : undefined;
    const userId = req.user.claims.sub;
    
    if (warbandId) {
      if (isNaN(warbandId)) {
        return res.status(400).json({ message: "Invalid warband ID" });
      }
      
      const fighters = await storage.getFightersByWarband(warbandId, userId);
      return res.json(fighters);
    }
    
    const fighters = await storage.getFighters(userId);
    res.json(fighters);
  });
  
  app.get("/api/fighters/:id", isAuthenticated, async (req: any, res) => {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.claims.sub;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid fighter ID" });
    }
    
    const fighter = await storage.getFighter(id, userId);
    if (!fighter) {
      return res.status(404).json({ message: "Fighter not found" });
    }
    
    res.json(fighter);
  });
  
  app.post("/api/fighters", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify that the warband belongs to the user
      const warbandId = req.body.warbandId;
      if (warbandId) {
        const warband = await storage.getWarband(warbandId, userId);
        if (!warband) {
          return res.status(403).json({ message: "Cannot add fighter to warband you don't own" });
        }
      }
      
      const validatedData = insertFighterSchema.parse(req.body);
      const fighter = await storage.createFighter(validatedData);
      res.status(201).json(fighter);
    } catch (error) {
      res.status(400).json({ message: "Invalid fighter data", error });
    }
  });
  
  app.patch("/api/fighters/:id", isAuthenticated, async (req: any, res) => {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.claims.sub;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid fighter ID" });
    }
    
    try {
      const validatedData = insertFighterSchema.partial().parse(req.body);
      const fighter = await storage.updateFighter(id, validatedData, userId);
      
      if (!fighter) {
        return res.status(404).json({ message: "Fighter not found" });
      }
      
      res.json(fighter);
    } catch (error) {
      res.status(400).json({ message: "Invalid fighter data", error });
    }
  });
  
  app.delete("/api/fighters/:id", isAuthenticated, async (req: any, res) => {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.claims.sub;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid fighter ID" });
    }
    
    const success = await storage.deleteFighter(id, userId);
    if (!success) {
      return res.status(404).json({ message: "Fighter not found" });
    }
    
    res.status(204).end();
  });
  
  // Battle routes (protected)
  app.get("/api/battles", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const battles = await storage.getBattles(userId);
    res.json(battles);
  });
  
  app.get("/api/battles/:id", isAuthenticated, async (req: any, res) => {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.claims.sub;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid battle ID" });
    }
    
    const battle = await storage.getBattle(id, userId);
    if (!battle) {
      return res.status(404).json({ message: "Battle not found" });
    }
    
    res.json(battle);
  });
  
  app.post("/api/battles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify that both warbands belong to the user
      const { winnerId, loserId } = req.body;
      
      if (winnerId) {
        const winnerWarband = await storage.getWarband(winnerId, userId);
        if (!winnerWarband) {
          return res.status(403).json({ message: "Winner warband not found or not owned by you" });
        }
      }
      
      if (loserId) {
        const loserWarband = await storage.getWarband(loserId, userId);
        if (!loserWarband) {
          return res.status(403).json({ message: "Loser warband not found or not owned by you" });
        }
      }
      
      const validatedData = insertBattleSchema.parse(req.body);
      const battle = await storage.createBattle(validatedData);
      res.status(201).json(battle);
    } catch (error) {
      res.status(400).json({ message: "Invalid battle data", error });
    }
  });
  
  app.patch("/api/battles/:id", isAuthenticated, async (req: any, res) => {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.claims.sub;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid battle ID" });
    }
    
    try {
      const validatedData = insertBattleSchema.partial().parse(req.body);
      const battle = await storage.updateBattle(id, validatedData, userId);
      
      if (!battle) {
        return res.status(404).json({ message: "Battle not found" });
      }
      
      res.json(battle);
    } catch (error) {
      res.status(400).json({ message: "Invalid battle data", error });
    }
  });
  
  app.delete("/api/battles/:id", isAuthenticated, async (req: any, res) => {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.claims.sub;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid battle ID" });
    }
    
    const success = await storage.deleteBattle(id, userId);
    if (!success) {
      return res.status(404).json({ message: "Battle not found" });
    }
    
    res.status(204).end();
  });
  
  // Battle Fighter Stats routes (protected)
  app.get("/api/battles/:battleId/stats", isAuthenticated, async (req: any, res) => {
    const battleId = parseInt(req.params.battleId, 10);
    const userId = req.user.claims.sub;
    
    if (isNaN(battleId)) {
      return res.status(400).json({ message: "Invalid battle ID" });
    }
    
    // Verify user owns the battle before getting stats
    const battle = await storage.getBattle(battleId, userId);
    if (!battle) {
      return res.status(404).json({ message: "Battle not found" });
    }
    
    const stats = await storage.getBattleFighterStats(battleId);
    res.json(stats);
  });
  
  app.post("/api/battle-fighter-stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { battleId } = req.body;
      
      // Verify user owns the battle
      if (battleId) {
        const battle = await storage.getBattle(battleId, userId);
        if (!battle) {
          return res.status(403).json({ message: "Battle not found or not owned by you" });
        }
      }
      
      const validatedData = insertBattleFighterStatsSchema.parse(req.body);
      const stat = await storage.createBattleFighterStat(validatedData);
      res.status(201).json(stat);
    } catch (error) {
      res.status(400).json({ message: "Invalid battle fighter stat data", error });
    }
  });

  // Export route - get all user data
  app.get("/api/export", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get all user data
      const warbands = await storage.getWarbands(userId);
      const fighters = await storage.getFighters(userId);
      const battles = await storage.getBattles(userId);
      
      // Create export data structure
      const exportData = {
        exportDate: new Date().toISOString(),
        userId: userId,
        warbands: warbands,
        fighters: fighters,
        battles: battles,
        metadata: {
          totalWarbands: warbands.length,
          totalFighters: fighters.length,
          totalBattles: battles.length,
          appVersion: "1.0.0"
        }
      };
      
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting user data:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
