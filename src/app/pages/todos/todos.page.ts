import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonList,
  IonLabel,
  IonRow,
} from '@ionic/angular/standalone';
import { SqliteService } from '../../services/sqlite.service';

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonList,
    IonLabel
],
  templateUrl: './todos.page.html',
})
export class TodosPage implements OnInit {
  newTodo: string = '';
  todos: { id: number; title: string }[] = [];

  constructor(private sqliteService: SqliteService) {}

  async ngOnInit() {
    console.log('Staryting connection');
    await this.sqliteService.initDB();
    //await this.loadTodos();
  }

  async addTodo() {
    if (!this.newTodo.trim()) return;
    await this.sqliteService.add(this.newTodo);
    this.newTodo = '';

    //await this.loadTodos();
  }

  async loadTodos() {
    this.todos = await this.sqliteService.getAll();
  }

  async clearAll() {
    await this.sqliteService.clearAll();
    this.todos = [];
  }
}



