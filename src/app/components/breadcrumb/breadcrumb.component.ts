import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-breadcrumb',
  standalone: true, // allows this to be used anywhere without module declaration
  imports: [CommonModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent {
 steps = ['Information', 'Build Stack', 'Execute Job', 'Report'];
  @Input() currentStep: number = 1;
}
