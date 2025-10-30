// src/app/services/schema.service.ts
import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';


@Injectable({
  providedIn: 'root'
})
export class SchemaService {

  constructor() {}

  /**
   * Ensure all required tables exist
   */
  async createTables(db: SQLiteDBConnection): Promise<void> {

    try {
      await this.createUsertbl(db);
      await this.createCompanytbl(db);
      await this.createTeamstbl(db);
      await this.createProjecttbl(db);
      await this.createProjectUserMappingtbl(db)

      console.log('✅ Tables created successfully');
    } catch (err) {
      console.error('❌ Error creating tables:', err);
      throw err;
    }
  }

  async createProjecttbl(db: SQLiteDBConnection): Promise<void>
  {
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
        startdate TEXT,
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

  async createUsertbl(db: SQLiteDBConnection): Promise<void>
  {
     try {
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        fname TEXT NOT NULL,
        lname TEXT ,
        email TEXT NOT NULL,
        role INTEGER NOT NULL,
        cid INTEGER NOT NULL,
        tid INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );
      `;

      await db.execute(createUsersTable);
      console.log('✅ Users table created successfully');
    } catch (err) {
      console.error('❌ Error creating Users table:', err);
      throw err;
    }
  }

  async createCompanytbl(db: SQLiteDBConnection): Promise<void>
  {
     try {
      const createCompanyTable = `
        CREATE TABLE IF NOT EXISTS company (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      `;

      await db.execute(createCompanyTable);
      console.log('✅ Company table created successfully');
    } catch (err) {
      console.error('❌ Error creating Company table:', err);
      throw err;
    }
  }

  async createTeamstbl(db: SQLiteDBConnection): Promise<void>
  {
     try {
      const createTeamsTable = `
        CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL
        );
      `;

      await db.execute(createTeamsTable);
      console.log('✅ Teams created successfully');
    } catch (err) {
      console.error('❌ Error creating Teams table:', err);
      throw err;
    }
  }

  async createProjectUserMappingtbl(db: SQLiteDBConnection): Promise<void>
  {
     try {
      const createProjUserTable = `
        CREATE TABLE IF NOT EXISTS projectusermapping (
        projectid TEXT NOT NULL,
        userid TEXT NOT NULL
        );
      `;

      await db.execute(createProjUserTable);
      console.log('✅ ProjectUserMapping Table created successfully');
    } catch (err) {
      console.error('❌ Error creating ProjectUserMapping table:', err);
      throw err;
    }
  }

}
