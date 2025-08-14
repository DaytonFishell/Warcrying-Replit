import { pgTable, text, serial, integer, boolean, json, timestamp, foreignKey, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { sql } from 'drizzle-orm';

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Warbands table
export const warbands = pgTable("warbands", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  faction: text("faction").notNull(),
  pointsLimit: integer("points_limit").notNull().default(1000),
  currentPoints: integer("current_points").notNull().default(0),
  description: text("description"),
  isPublic: boolean("is_public").notNull().default(false),
  isTemplate: boolean("is_template").notNull().default(false),
  templateSourceId: integer("template_source_id").references(() => warbands.id),
  likes: integer("likes").notNull().default(0),
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Fighters table
export const fighters = pgTable("fighters", {
  id: serial("id").primaryKey(),
  warbandId: integer("warband_id").notNull().references(() => warbands.id, { onDelete: 'cascade' }),
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
  winnerId: integer("winner_id").notNull().references(() => warbands.id),
  loserId: integer("loser_id").notNull().references(() => warbands.id),
  winnerScore: integer("winner_score").notNull().default(0),
  loserScore: integer("loser_score").notNull().default(0),
  notes: text("notes"),
});

// Battle Fighter Stats for tracking individual fighter performance
export const battleFighterStats = pgTable("battle_fighter_stats", {
  id: serial("id").primaryKey(),
  battleId: integer("battle_id").notNull().references(() => battles.id, { onDelete: 'cascade' }),
  fighterId: integer("fighter_id").notNull().references(() => fighters.id, { onDelete: 'cascade' }),
  kills: integer("kills").notNull().default(0),
  wasKilled: boolean("was_killed").notNull().default(false),
  notes: text("notes"),
});

// Warband likes table
export const warbandLikes = pgTable("warband_likes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  warbandId: integer("warband_id").notNull().references(() => warbands.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  // Unique constraint to prevent duplicate likes
  index("unique_user_warband_like").on(table.userId, table.warbandId),
]);

// Create insertion schemas
export const insertWarbandSchema = createInsertSchema(warbands).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  likes: true,
  views: true,
});

export const insertWarbandLikeSchema = createInsertSchema(warbandLikes).omit({
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

// User schemas
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  warbands: many(warbands),
}));

export const warbandsRelations = relations(warbands, ({ one, many }) => ({
  user: one(users, {
    fields: [warbands.userId],
    references: [users.id],
  }),
  fighters: many(fighters),
  likes: many(warbandLikes),
  templateSource: one(warbands, {
    fields: [warbands.templateSourceId],
    references: [warbands.id],
  }),
  battleWins: many(battles, { relationName: "winnerWarband" }),
  battleLosses: many(battles, { relationName: "loserWarband" }),
}));

export const fightersRelations = relations(fighters, ({ one, many }) => ({
  warband: one(warbands, {
    fields: [fighters.warbandId],
    references: [warbands.id],
  }),
  battleStats: many(battleFighterStats),
}));

export const battlesRelations = relations(battles, ({ one, many }) => ({
  winner: one(warbands, {
    fields: [battles.winnerId],
    references: [warbands.id],
    relationName: "winnerWarband",
  }),
  loser: one(warbands, {
    fields: [battles.loserId],
    references: [warbands.id],
    relationName: "loserWarband",
  }),
  fighterStats: many(battleFighterStats),
}));

export const battleFighterStatsRelations = relations(battleFighterStats, ({ one }) => ({
  battle: one(battles, {
    fields: [battleFighterStats.battleId],
    references: [battles.id],
  }),
  fighter: one(fighters, {
    fields: [battleFighterStats.fighterId],
    references: [fighters.id],
  }),
}));

export const warbandLikesRelations = relations(warbandLikes, ({ one }) => ({
  user: one(users, {
    fields: [warbandLikes.userId],
    references: [users.id],
  }),
  warband: one(warbands, {
    fields: [warbandLikes.warbandId],
    references: [warbands.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = z.infer<typeof upsertUserSchema>;

export type Warband = typeof warbands.$inferSelect;
export type InsertWarband = z.infer<typeof insertWarbandSchema>;

export type Fighter = typeof fighters.$inferSelect;
export type InsertFighter = z.infer<typeof insertFighterSchema>;

export type Battle = typeof battles.$inferSelect;
export type InsertBattle = z.infer<typeof insertBattleSchema>;

export type BattleFighterStat = typeof battleFighterStats.$inferSelect;
export type InsertBattleFighterStat = z.infer<typeof insertBattleFighterStatsSchema>;

export type WarbandLike = typeof warbandLikes.$inferSelect;
export type InsertWarbandLike = z.infer<typeof insertWarbandLikeSchema>;
