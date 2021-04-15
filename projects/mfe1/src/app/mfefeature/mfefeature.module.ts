import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MfefeatureRoutingModule } from './mfefeature-routing.module';
import { MfefeatureComponent } from './mfefeature.component';



@NgModule({
  declarations: [MfefeatureComponent],
  imports: [
    CommonModule,
    MfefeatureRoutingModule
  ]
})
export class MfefeatureModule { }
