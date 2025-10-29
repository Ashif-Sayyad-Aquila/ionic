import { Injectable } from '@angular/core';
import { isPlatform } from '@ionic/angular';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {
  private sqliteConnection: SQLiteConnection;
  private db: any;

  constructor() {
    // ✅ Initialize the connection here
    this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
  }

  public async initDB() {
    try {
      if (isPlatform('mobileweb')) {
        console.log('Platform: web');

        if (!customElements.get('jeep-sqlite')) {
          const jeep = document.createElement('jeep-sqlite');
          document.body.appendChild(jeep);
          console.log('jeep-sqlite element added to DOM');
        }

        await customElements.whenDefined('jeep-sqlite');
        console.log('jeep-sqlite defined, now initializing WebStore...');

        // ✅ Fix: sqliteConnection must exist before this line
        await this.sqliteConnection.initWebStore();
        console.log('WebStore initialized');
      }

      // ✅ Create or retrieve DB connection
      this.db = await this.sqliteConnection.createConnection(
        'todo_db', false, 'no-encryption', 1, false
      );

      await this.db.open();
      await this.db.execute(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT
      );`);

      console.log('✅ DB initialized successfully');
    } catch (err) {
      console.error('initDB error:', err);
    }
  }
  // Add a todo
  public async add(title: string) {
    if (!this.db) 
    {console.log("Add error");
return;
    }
      
   
      
    await this.db.run(`INSERT INTO todos (title) VALUES (?);`, [title]);
  }

  // Get all todos
  public async getAll(): Promise<{ id: number; title: string }[]> {
    if (!this.db) return [];
    const res = await this.db.query(`SELECT * FROM todos;`);
    return res.values as { id: number; title: string }[];
  }

  // Clear all todos
  public async clearAll() {
    if (!this.db) return;
    await this.db.run(`DELETE FROM todos;`);
  }
}