import { Routes } from '@angular/router';
import { AddProjectComponent } from './pages/add-project/add-project.component';
import { LoginComponent } from './pages/login/login.component';
import { ProjectListComponent } from './pages/project-list/project-list.component';
import { BuildStackComponent } from './pages/build-stack/build-stack.component';
import { ExecuteJobComponent } from './pages/execute-job/execute-job.component';
import { InformationComponent } from './pages/information/information.component';
import { ReportComponent } from './pages/report/report.component';

export const routes: Routes = [
  { path: '', redirectTo: 'information', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'projects', component: ProjectListComponent },
  { path: 'add-project', component: AddProjectComponent },
  { path: 'information', component: InformationComponent },
  { path: 'build-stack', component: BuildStackComponent },
  { path: 'execute-job', component: ExecuteJobComponent },
  { path: 'report', component: ReportComponent },
];
