// src/app/services/schema.service.ts
import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';


@Injectable({
  providedIn: 'root'
})
export class SchemaService {
  static readonly svgfiles = [
    { id: 1, name: "Annular 1", group: "Annulars", path: "assets/buildersvg/annular1.svg" },
    { id: 2, name: "Annular 2", group: "Annulars", path: "assets/buildersvg/annular2.svg" },
    { id: 3, name: "Annular 3", group: "Annulars", path: "assets/buildersvg/annular3.svg" },
    { id: 4, name: "Annular 4", group: "Annulars", path: "assets/buildersvg/annular4.svg" },
    { id: 5, name: "BOP 1", group: "BOPs", path: "assets/buildersvg/bop1.svg" },
    { id: 6, name: "BOP 2", group: "BOPs", path: "assets/buildersvg/bop2.svg" },
    { id: 7, name: "Valves 1", group: "BOP Valves", path: "assets/buildersvg/valves1.svg" },
    { id: 8, name: "Valves 2", group: "BOP Valves", path: "assets/buildersvg/valves2.svg" },
    { id: 9, name: "Valves 3", group: "BOP Valves", path: "assets/buildersvg/valves3.svg" },
    { id: 10, name: "Valves 4", group: "BOP Valves", path: "assets/buildersvg/valves4.svg" },
    { id: 11, name: "Valves 5", group: "BOP Valves", path: "assets/buildersvg/valves5.svg" },
    { id: 12, name: "Valves 6", group: "BOP Valves", path: "assets/buildersvg/valves6.svg" }
  ];

  constructor() { }

  /**
   * Ensure all required tables exist
   */
  async createTables(db: SQLiteDBConnection): Promise<void> {

    try {
      if (!db) { throw new Error('DB not initialized') }
      else {

        await this.createUsertbl(db);
        await this.createCompanytbl(db);
        await this.createTeamstbl(db);
        await this.createProjecttbl(db);
        await this.createProjectUserMappingtbl(db);
        await this.createSvgMappingtbl(db);

        console.log('✅ Tables created successfully');
      }
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

  async createUsertbl(db: SQLiteDBConnection): Promise<void> {
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

  async createCompanytbl(db: SQLiteDBConnection): Promise<void> {
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

  async createTeamstbl(db: SQLiteDBConnection): Promise<void> {
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

  async createProjectUserMappingtbl(db: SQLiteDBConnection): Promise<void> {
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

  async createSvgMappingtbl(db: SQLiteDBConnection): Promise<void> {
    try {
      const createSvgMappingTable = `
        CREATE TABLE IF NOT EXISTS svgmapping (
        id INT PRIMARY KEY,
        name TEXT ,
        type TEXT NOT NULL,
        path TEXT NOT NULL
        );
      `;

      await db.execute(createSvgMappingTable);
      await this.insertSvgMapping(db);
      console.log('✅ SvgMapping Table created successfully');

    } catch (err) {
      console.error('❌ Error creating SvgMapping table:', err);
      throw err;
    }
  }

  async insertSvgMapping(db: SQLiteDBConnection): Promise<void> {
    const svgs = SchemaService.svgfiles;
    if (!db) throw new Error('DB not initialized');

    try {

      for (const svg of svgs) {
        const sql = `INSERT OR IGNORE INTO svgmapping (id, name, type, path) VALUES (?, ?, ?, ?);`;
        await db.run(sql, [svg.id, svg.name, svg.group, svg.path]);
      }

      console.log('✅ SVG insert successful');
    } catch (err) {
      console.error('❌ SVG insert error', err);
    }
  }
}
