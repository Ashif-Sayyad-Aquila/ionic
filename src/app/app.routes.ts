import { Routes } from '@angular/router';
import { AddProjectComponent } from './pages/add-project/add-project.component';
import { LoginComponent } from './pages/login/login.component';
import { ProjectListComponent } from './pages/project-list/project-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'projects', component: ProjectListComponent },
  { path: 'add-project', component: AddProjectComponent },
];
