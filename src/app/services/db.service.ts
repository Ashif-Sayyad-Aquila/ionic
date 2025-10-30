// src/app/services/db.service.ts
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { SchemaService } from './schema.service';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private sqlite: SQLiteConnection
  private db: SQLiteDBConnection | null = null;
  private readonly DB_NAME = 'taklogic';
  private readonly DB_VERSION = 1;

  constructor(private schemaService: SchemaService) {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  /**
   * Initialize DB: create connection, open it and ensure table exists.
   * Call this once on app start / page init.
   */
  async initDB(): Promise<void> {
    try {
      // Create connection & open
      this.db = await this.sqlite.createConnection(
        this.DB_NAME, false, 'no-encryption', 1, false);

      await this.db.open();

      // Create table if not exists
      await this.schemaService.createTables(this.db);
      console.log('✅ Database initialized');
    } catch (err) {
      console.error('initDB err', err);
      throw err;
    }
  }

  /** Insert a value (parameterized) */
  async addValue(value: string): Promise<number> {
    if (!this.db) throw new Error('DB not initialized');
    const insertSql = `INSERT INTO records (value,created_at) VALUES (?,?);`;
    const utcNow = new Date().toISOString();
    const res = await this.db.run(insertSql, [value, utcNow]);
    // res.changes?.lastId or res.changes?.changes depending on plugin version
    const lastId = (res as any)?.lastId ?? (res as any)?.changes?.lastId ?? 0;
    return lastId;
  }

  /** Get all rows */
  async getAll(): Promise<Array<{ id: number, value: string, created_at: string }>> {
    if (!this.db) throw new Error('DB not initialized');
    const query = `SELECT id, value, created_at FROM records ORDER BY id DESC;`;
    const result = await this.db.query(query);
    // result.values is an array of rows
    return (result as any).values ?? [];
  }


  /** Close connection (optional) */
  async close(): Promise<void> {
    if (this.db) {
      await this.sqlite.closeConnection(this.DB_NAME, true);
      this.db = null;
    }
  }

  async delete(id: number): Promise<void> {
    if (!this.db) throw new Error('DB not initialized');
    await this.db.run(`DELETE FROM records WHERE id = ?`, [id]);
  }


  async upsertRecord(record: { id?: number; value: string; created_at: string }) {
    if (!this.db) throw new Error('DB not initialized');

    const query = `
    INSERT INTO records (id, value, created_at)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      value = excluded.value,
      created_at = excluded.created_at;
  `;

    // If 'id' is undefined (new record), use NULL so SQLite auto-generates one
    const params = [record.id ?? null, record.value, record.created_at];
    const res = await this.db.run(query, params);

    console.log('✅ Upsert complete:', res);
    return res;
  }

  /** Get all projects */
  async getAllProjects(): Promise<any[]> {
    if (!this.db) throw new Error('DB not initialized');
    const query = `SELECT * FROM project ORDER BY created_at DESC;`;
    const result = await this.db.query(query);
    return result.values ?? [];
  }



}
