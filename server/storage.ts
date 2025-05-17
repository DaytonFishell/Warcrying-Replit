import { 
  warbands, type Warband, type InsertWarband,
  fighters, type Fighter, type InsertFighter,
  battles, type Battle, type InsertBattle,
  battleFighterStats, type BattleFighterStat, type InsertBattleFighterStat
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private warbands: Map<number, Warband>;
  private fighters: Map<number, Fighter>;
  private battles: Map<number, Battle>;
  private battleFighterStats: Map<number, BattleFighterStat>;
  
  private warbandId: number;
  private fighterId: number;
  private battleId: number;
  private battleFighterStatId: number;
  
  constructor() {
    this.warbands = new Map();
    this.fighters = new Map();
    this.battles = new Map();
    this.battleFighterStats = new Map();
    
    this.warbandId = 1;
    this.fighterId = 1;
    this.battleId = 1;
    this.battleFighterStatId = 1;
  }
  
  // Warband operations
  async getWarbands(): Promise<Warband[]> {
    return Array.from(this.warbands.values());
  }
  
  async getWarband(id: number): Promise<Warband | undefined> {
    return this.warbands.get(id);
  }
  
  async createWarband(warband: InsertWarband): Promise<Warband> {
    const id = this.warbandId++;
    const now = new Date();
    const newWarband: Warband = { ...warband, id, createdAt: now };
    this.warbands.set(id, newWarband);
    return newWarband;
  }
  
  async updateWarband(id: number, warband: Partial<InsertWarband>): Promise<Warband | undefined> {
    const existingWarband = this.warbands.get(id);
    if (!existingWarband) return undefined;
    
    const updatedWarband: Warband = { ...existingWarband, ...warband };
    this.warbands.set(id, updatedWarband);
    return updatedWarband;
  }
  
  async deleteWarband(id: number): Promise<boolean> {
    return this.warbands.delete(id);
  }
  
  // Fighter operations
  async getFighters(): Promise<Fighter[]> {
    return Array.from(this.fighters.values());
  }
  
  async getFighter(id: number): Promise<Fighter | undefined> {
    return this.fighters.get(id);
  }
  
  async getFightersByWarband(warbandId: number): Promise<Fighter[]> {
    return Array.from(this.fighters.values()).filter(fighter => fighter.warbandId === warbandId);
  }
  
  async createFighter(fighter: InsertFighter): Promise<Fighter> {
    const id = this.fighterId++;
    const newFighter: Fighter = { ...fighter, id };
    this.fighters.set(id, newFighter);
    return newFighter;
  }
  
  async updateFighter(id: number, fighter: Partial<InsertFighter>): Promise<Fighter | undefined> {
    const existingFighter = this.fighters.get(id);
    if (!existingFighter) return undefined;
    
    const updatedFighter: Fighter = { ...existingFighter, ...fighter };
    this.fighters.set(id, updatedFighter);
    return updatedFighter;
  }
  
  async deleteFighter(id: number): Promise<boolean> {
    return this.fighters.delete(id);
  }
  
  // Battle operations
  async getBattles(): Promise<Battle[]> {
    return Array.from(this.battles.values());
  }
  
  async getBattle(id: number): Promise<Battle | undefined> {
    return this.battles.get(id);
  }
  
  async createBattle(battle: InsertBattle): Promise<Battle> {
    const id = this.battleId++;
    const newBattle: Battle = { ...battle, id };
    this.battles.set(id, newBattle);
    return newBattle;
  }
  
  async updateBattle(id: number, battle: Partial<InsertBattle>): Promise<Battle | undefined> {
    const existingBattle = this.battles.get(id);
    if (!existingBattle) return undefined;
    
    const updatedBattle: Battle = { ...existingBattle, ...battle };
    this.battles.set(id, updatedBattle);
    return updatedBattle;
  }
  
  async deleteBattle(id: number): Promise<boolean> {
    return this.battles.delete(id);
  }
  
  // Battle Fighter Stats operations
  async getBattleFighterStats(battleId: number): Promise<BattleFighterStat[]> {
    return Array.from(this.battleFighterStats.values())
      .filter(stat => stat.battleId === battleId);
  }
  
  async createBattleFighterStat(stat: InsertBattleFighterStat): Promise<BattleFighterStat> {
    const id = this.battleFighterStatId++;
    const newStat: BattleFighterStat = { ...stat, id };
    this.battleFighterStats.set(id, newStat);
    return newStat;
  }
}

export const storage = new MemStorage();
