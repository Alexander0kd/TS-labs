import { Component, Input } from '@angular/core';
import { IRoom } from '@app/interfaces/room.interface';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
    @Input() room!: IRoom;
}
