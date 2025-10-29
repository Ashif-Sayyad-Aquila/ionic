import { Component } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AddProjectComponent } from '../add-project/add-project.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent {
  projects = [
    { name: 'Project #1', company: 'ExxonMobil', wellName: 'ExampleWellName', location: '29.7604, -95.3698', progress: 0 },
    { name: 'Project #2', company: 'ExxonMobil', wellName: 'ExampleWellName', location: '29.7604, -95.3698', progress: 50 },
    { name: 'Project #3', company: 'ExxonMobil', wellName: 'ExampleWellName', location: '29.7604, -95.3698', progress: 50 },
    { name: 'Project #4', company: 'ExxonMobil', wellName: 'ExampleWellName', location: '29.7604, -95.3698', progress: 50 },
  ];

  constructor(private modalCtrl: ModalController) {}

  async openAddProjectModal() {
    const modal = await this.modalCtrl.create({
      component: AddProjectComponent,
      cssClass: 'add-project-modal',
    });
    await modal.present();
  }
}
