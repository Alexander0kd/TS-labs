import { Component, Input, OnInit } from '@angular/core';
import { IRoom } from '@app/interfaces/room.interface';

@Component({
    selector: 'app-video',
    templateUrl: './video.component.html',
    styleUrl: './video.component.scss',
})
export class VideoComponent implements OnInit {
    @Input() isAdmin: boolean = false;
    @Input() room!: IRoom;

    // Player
    playerUrl: string = 'dQw4w9WgXcQ';
    player: YT.Player | null = null;
    playerVars: YT.PlayerVars = {
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        controls: 1,
        fs: 1,
        iv_load_policy: 3,
        disablekb: 0,
        playsinline: 1,
        autoplay: 0,
        origin: window.location.origin,
    };

    ngOnInit(): void {
        if (!this.playerUrl) {
            this.updateVideo(this.room.contentUrl);
        }
    }

    updateVideo(url: string): void {
        let parsedUrl = '';

        try {
            const urlObj = new URL(url);
            const videoId = urlObj.searchParams.get('v');
            if (videoId) {
                parsedUrl = videoId;
            }
        } catch (e) {
            if (url) {
                parsedUrl = url;
            }
        }

        this.playerUrl = parsedUrl;
    }

    onPlayerReady(player: YT.PlayerEvent): void {
        this.player = player.target;
    }
}
