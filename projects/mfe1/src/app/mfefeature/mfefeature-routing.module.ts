import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MfefeatureComponent } from './mfefeature.component';

const routes: Routes = [
  {
    path: '',
    component: MfefeatureComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MfefeatureRoutingModule { }
