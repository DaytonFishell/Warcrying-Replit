import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Warbands table
export const warbands = pgTable("warbands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  faction: text("faction").notNull(),
  pointsLimit: integer("points_limit").notNull().default(1000),
  currentPoints: integer("current_points").notNull().default(0),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Fighters table
export const fighters = pgTable("fighters", {
  id: serial("id").primaryKey(),
  warbandId: integer("warband_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  pointsCost: integer("points_cost").notNull(),
  move: integer("move").notNull(),
  toughness: integer("toughness").notNull(),
  wounds: integer("wounds").notNull(),
  strength: integer("strength").notNull(),
  attacks: integer("attacks").notNull(),
  damage: text("damage").notNull(),
  criticalDamage: text("critical_damage").notNull(),
  range: integer("range").notNull().default(1),
  abilities: json("abilities").notNull().default([]),
  imageUrl: text("image_url"),
  battles: integer("battles").notNull().default(0),
  kills: integer("kills").notNull().default(0),
  deaths: integer("deaths").notNull().default(0),
});

// Battle table
export const battles = pgTable("battles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  scenario: text("scenario").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  mapType: text("map_type"),
  winnerId: integer("winner_id").notNull(),
  loserId: integer("loser_id").notNull(),
  winnerScore: integer("winner_score").notNull().default(0),
  loserScore: integer("loser_score").notNull().default(0),
  notes: text("notes"),
});

// Battle Fighter Stats for tracking individual fighter performance
export const battleFighterStats = pgTable("battle_fighter_stats", {
  id: serial("id").primaryKey(),
  battleId: integer("battle_id").notNull(),
  fighterId: integer("fighter_id").notNull(),
  kills: integer("kills").notNull().default(0),
  wasKilled: boolean("was_killed").notNull().default(false),
  notes: text("notes"),
});

// Create insertion schemas
export const insertWarbandSchema = createInsertSchema(warbands).omit({
  id: true,
  createdAt: true,
});

export const insertFighterSchema = createInsertSchema(fighters).omit({
  id: true,
});

export const insertBattleSchema = createInsertSchema(battles).omit({
  id: true,
});

export const insertBattleFighterStatsSchema = createInsertSchema(battleFighterStats).omit({
  id: true,
});

// Types
export type Warband = typeof warbands.$inferSelect;
export type InsertWarband = z.infer<typeof insertWarbandSchema>;

export type Fighter = typeof fighters.$inferSelect;
export type InsertFighter = z.infer<typeof insertFighterSchema>;

export type Battle = typeof battles.$inferSelect;
export type InsertBattle = z.infer<typeof insertBattleSchema>;

export type BattleFighterStat = typeof battleFighterStats.$inferSelect;
export type InsertBattleFighterStat = z.infer<typeof insertBattleFighterStatsSchema>;
