import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ListComponent } from './components/list/list.component';
import { RoomComponent } from './components/room/room.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
    },
    {
        path: 'list',
        component: ListComponent,
    },
    {
        path: 'room/:uuid',
        component: RoomComponent,
    },
    {
        path: '**',
        redirectTo: '',
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
