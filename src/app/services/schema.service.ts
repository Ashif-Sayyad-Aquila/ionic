// src/app/services/schema.service.ts
import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';


@Injectable({
  providedIn: 'root'
})
export class SchemaService {

  constructor() { }

  /**
   * Ensure all required tables exist
   */
  async createTables(db: SQLiteDBConnection): Promise<void> {

    try {
      await this.createProjecttbl(db);
      console.log('✅ Tables created successfully');
    } catch (err) {
      console.error('❌ Error creating tables:', err);
      throw err;
    }
  }

  async createProjecttbl(db: SQLiteDBConnection): Promise<void> {
    try {
      const createProjectTable = `
        CREATE TABLE IF NOT EXISTS project (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        tid INTEGER,
        cid INTEGER,
        well TEXT,
        wellpad TEXT,
        latitude TEXT,
        longitude TEXT,
        deviceinfo TEXT,
        created_at TEXT NOT NULL
      );
      `;

      await db.execute(createProjectTable);
      console.log('✅ Project table created successfully');
    } catch (err) {
      console.error('❌ Error creating Project table:', err);
      throw err;
    }
  }
}
