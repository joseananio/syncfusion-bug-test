import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./devices/devices.module').then((m) => m.DevicesModule),
    data: { label: _('APP.DEVICES') },
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
