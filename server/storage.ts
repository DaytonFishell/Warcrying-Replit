import { 
  warbands, type Warband, type InsertWarband,
  fighters, type Fighter, type InsertFighter,
  battles, type Battle, type InsertBattle,
  battleFighterStats, type BattleFighterStat, type InsertBattleFighterStat
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Warband operations
  getWarbands(): Promise<Warband[]>;
  getWarband(id: number): Promise<Warband | undefined>;
  createWarband(warband: InsertWarband): Promise<Warband>;
  updateWarband(id: number, warband: Partial<InsertWarband>): Promise<Warband | undefined>;
  deleteWarband(id: number): Promise<boolean>;
  
  // Fighter operations
  getFighters(): Promise<Fighter[]>;
  getFighter(id: number): Promise<Fighter | undefined>;
  getFightersByWarband(warbandId: number): Promise<Fighter[]>;
  createFighter(fighter: InsertFighter): Promise<Fighter>;
  updateFighter(id: number, fighter: Partial<InsertFighter>): Promise<Fighter | undefined>;
  deleteFighter(id: number): Promise<boolean>;
  
  // Battle operations
  getBattles(): Promise<Battle[]>;
  getBattle(id: number): Promise<Battle | undefined>;
  createBattle(battle: InsertBattle): Promise<Battle>;
  updateBattle(id: number, battle: Partial<InsertBattle>): Promise<Battle | undefined>;
  deleteBattle(id: number): Promise<boolean>;
  
  // Battle Fighter Stats operations
  getBattleFighterStats(battleId: number): Promise<BattleFighterStat[]>;
  createBattleFighterStat(stat: InsertBattleFighterStat): Promise<BattleFighterStat>;
}

export class DatabaseStorage implements IStorage {
  // Warband operations
  async getWarbands(): Promise<Warband[]> {
    return await db.select().from(warbands);
  }
  
  async getWarband(id: number): Promise<Warband | undefined> {
    const results = await db.select().from(warbands).where(eq(warbands.id, id));
    return results.length > 0 ? results[0] : undefined;
  }
  
  async createWarband(warband: InsertWarband): Promise<Warband> {
    const now = new Date();
    const result = await db.insert(warbands).values({...warband, createdAt: now}).returning();
    return result[0];
  }
  
  async updateWarband(id: number, warband: Partial<InsertWarband>): Promise<Warband | undefined> {
    const result = await db.update(warbands)
      .set(warband)
      .where(eq(warbands.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteWarband(id: number): Promise<boolean> {
    const result = await db.delete(warbands).where(eq(warbands.id, id)).returning();
    return result.length > 0;
  }
  
  // Fighter operations
  async getFighters(): Promise<Fighter[]> {
    return await db.select().from(fighters);
  }
  
  async getFighter(id: number): Promise<Fighter | undefined> {
    const results = await db.select().from(fighters).where(eq(fighters.id, id));
    return results.length > 0 ? results[0] : undefined;
  }
  
  async getFightersByWarband(warbandId: number): Promise<Fighter[]> {
    return await db.select().from(fighters).where(eq(fighters.warbandId, warbandId));
  }
  
  async createFighter(fighter: InsertFighter): Promise<Fighter> {
    const result = await db.insert(fighters).values(fighter).returning();
    return result[0];
  }
  
  async updateFighter(id: number, fighter: Partial<InsertFighter>): Promise<Fighter | undefined> {
    const result = await db.update(fighters)
      .set(fighter)
      .where(eq(fighters.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteFighter(id: number): Promise<boolean> {
    const result = await db.delete(fighters).where(eq(fighters.id, id)).returning();
    return result.length > 0;
  }
  
  // Battle operations
  async getBattles(): Promise<Battle[]> {
    return await db.select().from(battles);
  }
  
  async getBattle(id: number): Promise<Battle | undefined> {
    const results = await db.select().from(battles).where(eq(battles.id, id));
    return results.length > 0 ? results[0] : undefined;
  }
  
  async createBattle(battle: InsertBattle): Promise<Battle> {
    const result = await db.insert(battles).values(battle).returning();
    return result[0];
  }
  
  async updateBattle(id: number, battle: Partial<InsertBattle>): Promise<Battle | undefined> {
    const result = await db.update(battles)
      .set(battle)
      .where(eq(battles.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteBattle(id: number): Promise<boolean> {
    const result = await db.delete(battles).where(eq(battles.id, id)).returning();
    return result.length > 0;
  }
  
  // Battle Fighter Stats operations
  async getBattleFighterStats(battleId: number): Promise<BattleFighterStat[]> {
    return await db.select().from(battleFighterStats).where(eq(battleFighterStats.battleId, battleId));
  }
  
  async createBattleFighterStat(stat: InsertBattleFighterStat): Promise<BattleFighterStat> {
    const result = await db.insert(battleFighterStats).values(stat).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
