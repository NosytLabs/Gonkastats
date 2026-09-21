import {pgTable,timestamp,jsonb,text} from 'drizzle-orm/pg-core';
import type {Snapshot} from '../core/types';
export const snapshots=pgTable('gonkastats_snapshots',{slot:timestamp('slot',{withTimezone:true}).primaryKey(),collectedAt:timestamp('collected_at',{withTimezone:true}).notNull(),checksum:text('checksum').notNull(),data:jsonb('data').$type<Snapshot>().notNull()});
