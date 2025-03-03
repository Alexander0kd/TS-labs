import { Component, Input } from '@angular/core';
import { IRoom } from '@app/interfaces/room.interface';

@Component({
    selector: 'app-video',
    templateUrl: './video.component.html',
    styleUrl: './video.component.scss',
})
export class VideoComponent {
    @Input() room!: IRoom;
}
