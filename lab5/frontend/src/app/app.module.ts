import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ListComponent } from './components/list/list.component';
import { RoomComponent } from './components/room/room.component';
import { HomeComponent } from './components/home/home.component';
import { WebSocketService } from './services/web-socket/web-socket.service';
import { RoomService } from './services/room/room.service';
import { ConnectionService } from './services/connection/connection.service';

import { SettingsComponent } from './components/room/settings/settings.component';
import { VideoComponent } from './components/room/video/video.component';
import { SidebarComponent } from './components/room/sidebar/sidebar.component';

import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        ListComponent,
        RoomComponent,
        VideoComponent,
        SidebarComponent,
        SettingsComponent,
    ],
    imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule, MatDialogModule, MatButtonModule],
    bootstrap: [AppComponent],
    providers: [WebSocketService, RoomService, ConnectionService],
})
export class AppModule {}
