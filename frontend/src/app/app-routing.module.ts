// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InstitutionManagerComponent } from './institution-manager/institution-manager.component';
import { InstitutionListComponent } from './institution-list/institution-list.component';
import { PaymentFormComponent } from './payment-form/payment-form.component';

const routes: Routes = [
  { path: '', redirectTo: '/manage', pathMatch: 'full' },
  { path: 'manage', component: InstitutionManagerComponent },
  { path: 'view', component: InstitutionListComponent },
  { path: 'payments', component: PaymentFormComponent },
  { path: '**', redirectTo: '/manage' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }