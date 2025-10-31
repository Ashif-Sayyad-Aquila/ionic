import { Component, OnInit } from '@angular/core';
import { BreadcrumbComponent } from "src/app/components/breadcrumb/breadcrumb.component";

@Component({
  selector: 'app-execute-job',
  templateUrl: './execute-job.component.html',
  styleUrls: ['./execute-job.component.scss'],
  imports: [BreadcrumbComponent],
})
export class ExecuteJobComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
