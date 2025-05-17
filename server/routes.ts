import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertWarbandSchema, 
  insertFighterSchema, 
  insertBattleSchema, 
  insertBattleFighterStatsSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Warband routes
  app.get("/api/warbands", async (req, res) => {
    const warbands = await storage.getWarbands();
    res.json(warbands);
  });
  
  app.get("/api/warbands/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid warband ID" });
    }
    
    const warband = await storage.getWarband(id);
    if (!warband) {
      return res.status(404).json({ message: "Warband not found" });
    }
    
    res.json(warband);
  });
  
  app.post("/api/warbands", async (req, res) => {
    try {
      const validatedData = insertWarbandSchema.parse(req.body);
      const warband = await storage.createWarband(validatedData);
      res.status(201).json(warband);
    } catch (error) {
      res.status(400).json({ message: "Invalid warband data", error });
    }
  });
  
  app.patch("/api/warbands/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid warband ID" });
    }
    
    try {
      const validatedData = insertWarbandSchema.partial().parse(req.body);
      const warband = await storage.updateWarband(id, validatedData);
      
      if (!warband) {
        return res.status(404).json({ message: "Warband not found" });
      }
      
      res.json(warband);
    } catch (error) {
      res.status(400).json({ message: "Invalid warband data", error });
    }
  });
  
  app.delete("/api/warbands/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid warband ID" });
    }
    
    const success = await storage.deleteWarband(id);
    if (!success) {
      return res.status(404).json({ message: "Warband not found" });
    }
    
    res.status(204).end();
  });
  
  // Fighter routes
  app.get("/api/fighters", async (req, res) => {
    const warbandId = req.query.warbandId ? parseInt(req.query.warbandId as string, 10) : undefined;
    
    if (warbandId) {
      if (isNaN(warbandId)) {
        return res.status(400).json({ message: "Invalid warband ID" });
      }
      
      const fighters = await storage.getFightersByWarband(warbandId);
      return res.json(fighters);
    }
    
    const fighters = await storage.getFighters();
    res.json(fighters);
  });
  
  app.get("/api/fighters/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid fighter ID" });
    }
    
    const fighter = await storage.getFighter(id);
    if (!fighter) {
      return res.status(404).json({ message: "Fighter not found" });
    }
    
    res.json(fighter);
  });
  
  app.post("/api/fighters", async (req, res) => {
    try {
      const validatedData = insertFighterSchema.parse(req.body);
      const fighter = await storage.createFighter(validatedData);
      res.status(201).json(fighter);
    } catch (error) {
      res.status(400).json({ message: "Invalid fighter data", error });
    }
  });
  
  app.patch("/api/fighters/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid fighter ID" });
    }
    
    try {
      const validatedData = insertFighterSchema.partial().parse(req.body);
      const fighter = await storage.updateFighter(id, validatedData);
      
      if (!fighter) {
        return res.status(404).json({ message: "Fighter not found" });
      }
      
      res.json(fighter);
    } catch (error) {
      res.status(400).json({ message: "Invalid fighter data", error });
    }
  });
  
  app.delete("/api/fighters/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid fighter ID" });
    }
    
    const success = await storage.deleteFighter(id);
    if (!success) {
      return res.status(404).json({ message: "Fighter not found" });
    }
    
    res.status(204).end();
  });
  
  // Battle routes
  app.get("/api/battles", async (req, res) => {
    const battles = await storage.getBattles();
    res.json(battles);
  });
  
  app.get("/api/battles/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid battle ID" });
    }
    
    const battle = await storage.getBattle(id);
    if (!battle) {
      return res.status(404).json({ message: "Battle not found" });
    }
    
    res.json(battle);
  });
  
  app.post("/api/battles", async (req, res) => {
    try {
      const validatedData = insertBattleSchema.parse(req.body);
      const battle = await storage.createBattle(validatedData);
      res.status(201).json(battle);
    } catch (error) {
      res.status(400).json({ message: "Invalid battle data", error });
    }
  });
  
  app.patch("/api/battles/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid battle ID" });
    }
    
    try {
      const validatedData = insertBattleSchema.partial().parse(req.body);
      const battle = await storage.updateBattle(id, validatedData);
      
      if (!battle) {
        return res.status(404).json({ message: "Battle not found" });
      }
      
      res.json(battle);
    } catch (error) {
      res.status(400).json({ message: "Invalid battle data", error });
    }
  });
  
  app.delete("/api/battles/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid battle ID" });
    }
    
    const success = await storage.deleteBattle(id);
    if (!success) {
      return res.status(404).json({ message: "Battle not found" });
    }
    
    res.status(204).end();
  });
  
  // Battle Fighter Stats routes
  app.get("/api/battles/:battleId/stats", async (req, res) => {
    const battleId = parseInt(req.params.battleId, 10);
    if (isNaN(battleId)) {
      return res.status(400).json({ message: "Invalid battle ID" });
    }
    
    const stats = await storage.getBattleFighterStats(battleId);
    res.json(stats);
  });
  
  app.post("/api/battle-fighter-stats", async (req, res) => {
    try {
      const validatedData = insertBattleFighterStatsSchema.parse(req.body);
      const stat = await storage.createBattleFighterStat(validatedData);
      res.status(201).json(stat);
    } catch (error) {
      res.status(400).json({ message: "Invalid battle fighter stat data", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
