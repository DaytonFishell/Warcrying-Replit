import { 
  warbands, type Warband, type InsertWarband,
  fighters, type Fighter, type InsertFighter,
  battles, type Battle, type InsertBattle,
  battleFighterStats, type BattleFighterStat, type InsertBattleFighterStat,
  warbandLikes, type WarbandLike, type InsertWarbandLike,
  users, type User, type UpsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Warband operations
  getWarbands(userId?: string): Promise<Warband[]>;
  getPublicWarbands(limit?: number): Promise<Warband[]>;
  getWarband(id: number, userId?: string): Promise<Warband | undefined>;
  createWarband(warband: InsertWarband): Promise<Warband>;
  updateWarband(id: number, warband: Partial<InsertWarband>, userId?: string): Promise<Warband | undefined>;
  deleteWarband(id: number, userId?: string): Promise<boolean>;
  duplicateWarband(id: number, userId?: string, name?: string): Promise<Warband | undefined>;
  incrementWarbandViews(id: number): Promise<void>;
  
  // Warband likes operations
  likeWarband(userId: string, warbandId: number): Promise<WarbandLike>;
  unlikeWarband(userId: string, warbandId: number): Promise<boolean>;
  isWarbandLiked(userId: string, warbandId: number): Promise<boolean>;
  getWarbandLikes(warbandId: number): Promise<number>;
  
  // Fighter operations
  getFighters(userId?: string): Promise<Fighter[]>;
  getFighter(id: number, userId?: string): Promise<Fighter | undefined>;
  getFightersByWarband(warbandId: number, userId?: string): Promise<Fighter[]>;
  createFighter(fighter: InsertFighter): Promise<Fighter>;
  updateFighter(id: number, fighter: Partial<InsertFighter>, userId?: string): Promise<Fighter | undefined>;
  deleteFighter(id: number, userId?: string): Promise<boolean>;
  
  // Battle operations
  getBattles(userId?: string): Promise<Battle[]>;
  getBattle(id: number, userId?: string): Promise<Battle | undefined>;
  createBattle(battle: InsertBattle): Promise<Battle>;
  updateBattle(id: number, battle: Partial<InsertBattle>, userId?: string): Promise<Battle | undefined>;
  deleteBattle(id: number, userId?: string): Promise<boolean>;
  
  // Battle Fighter Stats operations
  getBattleFighterStats(battleId: number): Promise<BattleFighterStat[]>;
  createBattleFighterStat(stat: InsertBattleFighterStat): Promise<BattleFighterStat>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  // Warband operations
  async getWarbands(userId?: string): Promise<Warband[]> {
    if (userId) {
      return await db.select().from(warbands).where(eq(warbands.userId, userId));
    }
    return await db.select().from(warbands);
  }
  
  async getPublicWarbands(limit: number = 20): Promise<Warband[]> {
    return await db
      .select()
      .from(warbands)
      .where(eq(warbands.isPublic, true))
      .orderBy(desc(warbands.likes), desc(warbands.createdAt))
      .limit(limit);
  }
  
  async getWarband(id: number, userId?: string): Promise<Warband | undefined> {
    if (userId) {
      const results = await db.select().from(warbands).where(and(eq(warbands.id, id), eq(warbands.userId, userId)));
      return results.length > 0 ? results[0] : undefined;
    }
    const results = await db.select().from(warbands).where(eq(warbands.id, id));
    return results.length > 0 ? results[0] : undefined;
  }
  
  async createWarband(warband: InsertWarband): Promise<Warband> {
    const now = new Date();
    const result = await db.insert(warbands).values({...warband, createdAt: now}).returning();
    return result[0];
  }
  
  async updateWarband(id: number, warband: Partial<InsertWarband>, userId?: string): Promise<Warband | undefined> {
    if (userId) {
      const result = await db.update(warbands)
        .set(warband)
        .where(and(eq(warbands.id, id), eq(warbands.userId, userId)))
        .returning();
      return result.length > 0 ? result[0] : undefined;
    }
    const result = await db.update(warbands)
      .set(warband)
      .where(eq(warbands.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteWarband(id: number, userId?: string): Promise<boolean> {
    if (userId) {
      const result = await db.delete(warbands).where(and(eq(warbands.id, id), eq(warbands.userId, userId))).returning();
      return result.length > 0;
    }
    const result = await db.delete(warbands).where(eq(warbands.id, id)).returning();
    return result.length > 0;
  }

  async duplicateWarband(id: number, userId?: string, name?: string): Promise<Warband | undefined> {
    // Get the original warband
    const [originalWarband] = await db.select().from(warbands).where(eq(warbands.id, id));
    if (!originalWarband) return undefined;

    // Get all fighters for this warband
    const originalFighters = await db.select().from(fighters).where(eq(fighters.warbandId, id));

    // Create new warband
    const newWarbandData: InsertWarband = {
      userId: userId || null,
      name: name || `${originalWarband.name} (Copy)`,
      faction: originalWarband.faction,
      pointsLimit: originalWarband.pointsLimit,
      currentPoints: originalWarband.currentPoints,
      description: originalWarband.description,
      isTemplate: !userId, // Templates for guest users
      templateSourceId: originalWarband.id,
    };

    const [newWarband] = await db.insert(warbands).values(newWarbandData).returning();

    // Copy all fighters
    if (originalFighters.length > 0) {
      const newFighters = originalFighters.map(fighter => ({
        warbandId: newWarband.id,
        name: fighter.name,
        type: fighter.type,
        pointsCost: fighter.pointsCost,
        move: fighter.move,
        toughness: fighter.toughness,
        wounds: fighter.wounds,
        strength: fighter.strength,
        attacks: fighter.attacks,
        damage: fighter.damage,
        criticalDamage: fighter.criticalDamage,
        range: fighter.range,
        abilities: fighter.abilities,
        imageUrl: fighter.imageUrl,
        battles: 0, // Reset battle stats
        kills: 0,
        deaths: 0,
      }));

      await db.insert(fighters).values(newFighters);
    }

    return newWarband;
  }

  async incrementWarbandViews(id: number): Promise<void> {
    await db
      .update(warbands)
      .set({ views: sql`${warbands.views} + 1` })
      .where(eq(warbands.id, id));
  }

  // Warband likes operations
  async likeWarband(userId: string, warbandId: number): Promise<WarbandLike> {
    // First create the like
    const [like] = await db
      .insert(warbandLikes)
      .values({ userId, warbandId })
      .onConflictDoNothing()
      .returning();

    // Update the warband likes count
    await db
      .update(warbands)
      .set({ likes: sql`${warbands.likes} + 1` })
      .where(eq(warbands.id, warbandId));

    return like;
  }

  async unlikeWarband(userId: string, warbandId: number): Promise<boolean> {
    const result = await db
      .delete(warbandLikes)
      .where(and(eq(warbandLikes.userId, userId), eq(warbandLikes.warbandId, warbandId)))
      .returning();

    if (result.length > 0) {
      // Update the warband likes count
      await db
        .update(warbands)
        .set({ likes: sql`${warbands.likes} - 1` })
        .where(eq(warbands.id, warbandId));
      return true;
    }
    return false;
  }

  async isWarbandLiked(userId: string, warbandId: number): Promise<boolean> {
    const [like] = await db
      .select()
      .from(warbandLikes)
      .where(and(eq(warbandLikes.userId, userId), eq(warbandLikes.warbandId, warbandId)));
    return !!like;
  }

  async getWarbandLikes(warbandId: number): Promise<number> {
    const [warband] = await db
      .select({ likes: warbands.likes })
      .from(warbands)
      .where(eq(warbands.id, warbandId));
    return warband?.likes || 0;
  }
  
  // Fighter operations
  async getFighters(userId?: string): Promise<Fighter[]> {
    if (userId) {
      return await db.select({
        id: fighters.id,
        warbandId: fighters.warbandId,
        name: fighters.name,
        type: fighters.type,
        pointsCost: fighters.pointsCost,
        move: fighters.move,
        toughness: fighters.toughness,
        wounds: fighters.wounds,
        strength: fighters.strength,
        attacks: fighters.attacks,
        damage: fighters.damage,
        criticalDamage: fighters.criticalDamage,
        range: fighters.range,
        abilities: fighters.abilities,
        imageUrl: fighters.imageUrl,
        battles: fighters.battles,
        kills: fighters.kills,
        deaths: fighters.deaths,
      })
      .from(fighters)
      .innerJoin(warbands, eq(fighters.warbandId, warbands.id))
      .where(eq(warbands.userId, userId));
    }
    return await db.select().from(fighters);
  }
  
  async getFighter(id: number, userId?: string): Promise<Fighter | undefined> {
    if (userId) {
      const results = await db.select({
        id: fighters.id,
        warbandId: fighters.warbandId,
        name: fighters.name,
        type: fighters.type,
        pointsCost: fighters.pointsCost,
        move: fighters.move,
        toughness: fighters.toughness,
        wounds: fighters.wounds,
        strength: fighters.strength,
        attacks: fighters.attacks,
        damage: fighters.damage,
        criticalDamage: fighters.criticalDamage,
        range: fighters.range,
        abilities: fighters.abilities,
        imageUrl: fighters.imageUrl,
        battles: fighters.battles,
        kills: fighters.kills,
        deaths: fighters.deaths,
      })
      .from(fighters)
      .innerJoin(warbands, eq(fighters.warbandId, warbands.id))
      .where(and(eq(fighters.id, id), eq(warbands.userId, userId)));
      return results.length > 0 ? results[0] : undefined;
    }
    const results = await db.select().from(fighters).where(eq(fighters.id, id));
    return results.length > 0 ? results[0] : undefined;
  }
  
  async getFightersByWarband(warbandId: number, userId?: string): Promise<Fighter[]> {
    if (userId) {
      return await db.select({
        id: fighters.id,
        warbandId: fighters.warbandId,
        name: fighters.name,
        type: fighters.type,
        pointsCost: fighters.pointsCost,
        move: fighters.move,
        toughness: fighters.toughness,
        wounds: fighters.wounds,
        strength: fighters.strength,
        attacks: fighters.attacks,
        damage: fighters.damage,
        criticalDamage: fighters.criticalDamage,
        range: fighters.range,
        abilities: fighters.abilities,
        imageUrl: fighters.imageUrl,
        battles: fighters.battles,
        kills: fighters.kills,
        deaths: fighters.deaths,
      })
      .from(fighters)
      .innerJoin(warbands, eq(fighters.warbandId, warbands.id))
      .where(and(eq(fighters.warbandId, warbandId), eq(warbands.userId, userId)));
    }
    return await db.select().from(fighters).where(eq(fighters.warbandId, warbandId));
  }
  
  async createFighter(fighter: InsertFighter): Promise<Fighter> {
    const result = await db.insert(fighters).values(fighter).returning();
    return result[0];
  }
  
  async updateFighter(id: number, fighter: Partial<InsertFighter>, userId?: string): Promise<Fighter | undefined> {
    if (userId) {
      // Need to ensure the fighter belongs to a warband owned by the user
      const existingFighter = await this.getFighter(id, userId);
      if (!existingFighter) return undefined;
      
      const result = await db.update(fighters)
        .set(fighter)
        .where(eq(fighters.id, id))
        .returning();
      return result.length > 0 ? result[0] : undefined;
    }
    const result = await db.update(fighters)
      .set(fighter)
      .where(eq(fighters.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteFighter(id: number, userId?: string): Promise<boolean> {
    if (userId) {
      // Need to ensure the fighter belongs to a warband owned by the user
      const existingFighter = await this.getFighter(id, userId);
      if (!existingFighter) return false;
      
      const result = await db.delete(fighters).where(eq(fighters.id, id)).returning();
      return result.length > 0;
    }
    const result = await db.delete(fighters).where(eq(fighters.id, id)).returning();
    return result.length > 0;
  }
  
  // Battle operations
  async getBattles(userId?: string): Promise<Battle[]> {
    if (userId) {
      // Get battles where either winner or loser warband belongs to the user
      return await db.select({
        id: battles.id,
        name: battles.name,
        scenario: battles.scenario,
        date: battles.date,
        mapType: battles.mapType,
        winnerId: battles.winnerId,
        loserId: battles.loserId,
        winnerScore: battles.winnerScore,
        loserScore: battles.loserScore,
        notes: battles.notes,
      })
      .from(battles)
      .innerJoin(warbands, eq(battles.winnerId, warbands.id))
      .where(eq(warbands.userId, userId))
      .union(
        db.select({
          id: battles.id,
          name: battles.name,
          scenario: battles.scenario,
          date: battles.date,
          mapType: battles.mapType,
          winnerId: battles.winnerId,
          loserId: battles.loserId,
          winnerScore: battles.winnerScore,
          loserScore: battles.loserScore,
          notes: battles.notes,
        })
        .from(battles)
        .innerJoin(warbands, eq(battles.loserId, warbands.id))
        .where(eq(warbands.userId, userId))
      );
    }
    return await db.select().from(battles);
  }
  
  async getBattle(id: number, userId?: string): Promise<Battle | undefined> {
    if (userId) {
      // Check if user owns either warband in the battle
      const results = await db.select({
        id: battles.id,
        name: battles.name,
        scenario: battles.scenario,
        date: battles.date,
        mapType: battles.mapType,
        winnerId: battles.winnerId,
        loserId: battles.loserId,
        winnerScore: battles.winnerScore,
        loserScore: battles.loserScore,
        notes: battles.notes,
      })
      .from(battles)
      .innerJoin(warbands, eq(battles.winnerId, warbands.id))
      .where(and(eq(battles.id, id), eq(warbands.userId, userId)))
      .union(
        db.select({
          id: battles.id,
          name: battles.name,
          scenario: battles.scenario,
          date: battles.date,
          mapType: battles.mapType,
          winnerId: battles.winnerId,
          loserId: battles.loserId,
          winnerScore: battles.winnerScore,
          loserScore: battles.loserScore,
          notes: battles.notes,
        })
        .from(battles)
        .innerJoin(warbands, eq(battles.loserId, warbands.id))
        .where(and(eq(battles.id, id), eq(warbands.userId, userId)))
      );
      return results.length > 0 ? results[0] : undefined;
    }
    const results = await db.select().from(battles).where(eq(battles.id, id));
    return results.length > 0 ? results[0] : undefined;
  }
  
  async createBattle(battle: InsertBattle): Promise<Battle> {
    const result = await db.insert(battles).values(battle).returning();
    return result[0];
  }
  
  async updateBattle(id: number, battle: Partial<InsertBattle>, userId?: string): Promise<Battle | undefined> {
    if (userId) {
      // Need to ensure the user owns one of the warbands in the battle
      const existingBattle = await this.getBattle(id, userId);
      if (!existingBattle) return undefined;
      
      const result = await db.update(battles)
        .set(battle)
        .where(eq(battles.id, id))
        .returning();
      return result.length > 0 ? result[0] : undefined;
    }
    const result = await db.update(battles)
      .set(battle)
      .where(eq(battles.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteBattle(id: number, userId?: string): Promise<boolean> {
    if (userId) {
      // Need to ensure the user owns one of the warbands in the battle
      const existingBattle = await this.getBattle(id, userId);
      if (!existingBattle) return false;
      
      const result = await db.delete(battles).where(eq(battles.id, id)).returning();
      return result.length > 0;
    }
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
