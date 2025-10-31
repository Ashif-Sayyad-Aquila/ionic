import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DbService } from 'src/app/services/db.service';
import { BreadcrumbComponent } from "src/app/components/breadcrumb/breadcrumb.component";
import { IonicModule, NavController } from "@ionic/angular";

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss'],
  imports: [BreadcrumbComponent, IonicModule],
})
export class InformationComponent implements OnInit {
  project = {
    id: 1,
    name: 'ExampleProjectName',
    team: 'Rockies',
    company: 'Shell',
    startDate: 'MM/DD/YYYY',
    latitude: '29.7604',
    longitude: '-95.3698',
    wellName: 'ExampleWellName',
    padName: 'ExamplePadName'
  };

  constructor(private router: Router, private dbService: DbService, private navCtrl: NavController) { }

  ngOnInit() {
    this.project = this.dbService.getCurrentProject();
  }

  proceedToBuild() {
    this.navCtrl.navigateForward('/build-stack');
  }

  editInformation() {
    console.log('Editing project information...');
  }

  goBack() {
    this.navCtrl.back();
  }
}
