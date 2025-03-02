import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ListComponent } from './components/list/list.component';
import { RoomComponent } from './components/room/room.component';
import { HomeComponent } from './components/home/home.component';

@NgModule({
    declarations: [AppComponent, HomeComponent, ListComponent, RoomComponent],
    imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule],
    bootstrap: [AppComponent],
})
export class AppModule {}
