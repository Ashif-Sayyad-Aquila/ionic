import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Device } from '@capacitor/device';
import { Geolocation } from '@capacitor/geolocation';
import { DbService } from 'src/app/services/db.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-add-project',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.scss'],
})
export class AddProjectComponent implements OnInit {
  project = {
    projectName: '',
    team: '',
    company: '',
    latitude: '',
    longitude: '',
    wellName: '',
    padName: '',
    deviceUUID: '',
  };

  isEdit = false; // default value

  constructor(
    private dbService: DbService,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController
  ) {}

  async ngOnInit() {
    // Show loading spinner
    const loading = await this.loadingCtrl.create({
      message: 'Fetching location and device info...',
      spinner: 'circles',
    });
    await loading.present();

    try {
      await this.getDeviceInfo();
      await this.getCoordinates();
    } catch (err) {
      console.error('Error while initializing:', err);
    } finally {
      loading.dismiss();
    }
  }

  cancel() {
    this.modalCtrl.dismiss();
  }

  async saveProject() {
    try {
      if (!this.project.projectName) {
        console.warn('⚠️ Project name is required');
        return;
      }

      await this.dbService.initDB();

      const insertSQL = `
        INSERT INTO project (
          id, name, tid, cid, well, wellpad, latitude, longitude, deviceinfo, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        uuidv4(),
        this.project.projectName,
        this.project.team || '',
        this.project.company || '',
        this.project.wellName || '',
        this.project.padName || '',
        this.project.latitude || '',
        this.project.longitude || '',
        this.project.deviceUUID || 'Unknown Device',
        new Date().toISOString(),
      ];

      await this.dbService['db']?.run(insertSQL, params);
      console.log('✅ Project saved:', this.project);

      this.modalCtrl.dismiss(true);
    } catch (err) {
      console.error('❌ Error saving project:', err);
    }
  }

  async getDeviceInfo() {
    try {
      const idInfo = await Device.getId();
      const modelInfo = await Device.getInfo();
      this.project.deviceUUID = `${idInfo.identifier}/${modelInfo.model}/${modelInfo.platform}`;
      console.log('📟 Device Info:', this.project.deviceUUID);
    } catch (err) {
      console.error('Error fetching device info:', err);
    }
  }

  async getCoordinates() {
    try {
      await Geolocation.requestPermissions();

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      });

      this.project.latitude = position.coords.latitude.toString();
      this.project.longitude = position.coords.longitude.toString();

      console.log('📍 Coordinates:', this.project.latitude, this.project.longitude);
    } catch (err) {
      console.error('Error fetching location:', err);
    }
  }
}
