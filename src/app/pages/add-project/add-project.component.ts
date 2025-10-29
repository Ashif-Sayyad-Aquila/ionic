import { Component } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-project',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.scss'],
})
export class AddProjectComponent {
  project = {
    projectName: '',
    team: '',
    company: '',
    latitude: '',
    longitude: '',
    wellName: '',
    padName: '',
  };

  constructor(private modalCtrl: ModalController) {}

  cancel() {
    this.modalCtrl.dismiss();
  }

  saveProject() {
    console.log('New Project:', this.project);
    this.modalCtrl.dismiss(this.project);
  }
}
