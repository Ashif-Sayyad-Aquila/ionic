import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AddProjectComponent } from '../add-project/add-project.component';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent implements OnInit {
  projects: any[] = [];
  loading = true;

  constructor(
    private modalCtrl: ModalController,
    private dbService: DbService,
    private navCtrl: NavController
  ) { }

  async ngOnInit() {
    await this.loadProjects();
  }

  /** Load projects from SQLite DB */
  async loadProjects() {
    try {
      //await this.dbService.initDB();
      const data = await this.dbService.getAllProjects();

      // Map DB fields to UI model
      this.projects = data.map((p: any) => ({
        name: p.name,
        company: p.cid || '—',
        wellName: p.well || '—',
        padName: p.wellpad || '—',
        location: `${p.latitude || ''}, ${p.longitude || ''}`,
        progress: 0, // Default progress for now
      }));

      console.log('✅ Projects loaded:', this.projects);
    } catch (err) {
      console.error('❌ Error loading projects:', err);
    } finally {
      this.loading = false;
    }
  }

  async openAddProjectModal(existingProject?: any) {
    const modal = await this.modalCtrl.create({
      component: AddProjectComponent,
      componentProps: { existingProject }, // 👈 Pass project if editing
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      this.loadProjects(); // refresh list after add/update
    }
  }

  // 👇 New method for row click
  openProjectInfo(project: any) {
    this.dbService.setProject(project); // save project in service
    this.navCtrl.navigateForward('/information'); // navigate to info page
  }

}
