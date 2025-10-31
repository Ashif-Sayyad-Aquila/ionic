import { Component, OnInit } from '@angular/core';
import { BreadcrumbComponent } from "src/app/components/breadcrumb/breadcrumb.component";

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  imports: [BreadcrumbComponent],
})
export class ReportComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
