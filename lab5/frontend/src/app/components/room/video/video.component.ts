import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IRoom } from '@app/interfaces/room.interface';
import { ISyncEvent } from '@app/interfaces/sync-event.interface';
import { RoomService } from '@app/services/room/room.service';
import { interval, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-video',
    templateUrl: './video.component.html',
    styleUrl: './video.component.scss',
})
export class VideoComponent implements OnInit, OnDestroy {
    @Input() isAdmin: boolean = false;
    @Input() room!: IRoom;

    private destroy$: Subject<void> = new Subject<void>();

    // Constants
    private readonly SYNC_INTERVAL_MS: number = 2000; // 2 seconds
    private skipNextUpdate: boolean = false;

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

    constructor(private roomService: RoomService) {}

    ngOnInit(): void {
        if (!this.playerUrl) {
            this.updateVideo(this.room.contentUrl);
        }

        interval(this.SYNC_INTERVAL_MS)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.syncVideoState();
                },
            });

        this.roomService
            .subscribeToVideoEvents()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (event) => {
                    this.handleVideoSyncEvent(event);
                },
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
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

        if ((this.isAdmin || this.room.settings.allowChangeUrl) && this.room.uuid && parsedUrl) {
            this.roomService.broadcastVideoChange(this.room.uuid, parsedUrl);
        }

        this.playerUrl = parsedUrl;
    }

    onPlayerReady(player: YT.PlayerEvent): void {
        this.player = player.target;
    }

    onPlaybackRateChange(event: YT.OnPlaybackRateChangeEvent): void {
        if (this.isAdmin && this.skipNextUpdate) {
            return;
        }

        if (!this.player || (!this.isAdmin && !this.room.settings.allowVideoChange)) return;

        const isPlaying = this.player.getPlayerState() === YT.PlayerState.PLAYING;
        const currentTime = this.player.getCurrentTime();
        const speed = event.data;

        this.roomService.broadcastVideoSync(this.room.uuid, {
            action: 'speed',
            isPlaying: isPlaying,
            payload: {
                speed: speed,
                currentTime: currentTime,
                videoUrl: this.playerUrl,
                toAdmin: this.room.settings.allowVideoChange && !this.isAdmin,
            },
        });
    }

    onPlayerStateChange(event: YT.OnStateChangeEvent): void {
        if (this.isAdmin && this.skipNextUpdate) {
            return;
        }

        if (!this.player || (!this.isAdmin && !this.room.settings.allowVideoChange)) return;

        const speed = this.player.getPlaybackRate();
        const currentTime = this.player.getCurrentTime();

        switch (event.data) {
            case YT.PlayerState.PLAYING:
                this.roomService.broadcastVideoSync(this.room.uuid, {
                    action: 'play',
                    isPlaying: true,
                    payload: {
                        speed: speed,
                        currentTime: currentTime,
                        videoUrl: this.playerUrl,
                        toAdmin: this.room.settings.allowVideoChange && !this.isAdmin,
                    },
                });
                break;
            case YT.PlayerState.PAUSED:
                this.roomService.broadcastVideoSync(this.room.uuid, {
                    action: 'pause',
                    isPlaying: false,
                    payload: {
                        speed: speed,
                        currentTime: currentTime,
                        videoUrl: this.playerUrl,
                        toAdmin: this.room.settings.allowVideoChange && !this.isAdmin,
                    },
                });
                break;
        }
    }

    private syncVideoState(): void {
        if (this.skipNextUpdate) {
            this.skipNextUpdate = false;
        }

        if (!this.player || !this.isAdmin) return;

        const speed = this.player.getPlaybackRate();
        const currentTime = this.player.getCurrentTime();
        const isPlaying = this.player.getPlayerState() === YT.PlayerState.PLAYING;

        this.roomService.broadcastVideoSync(this.room.uuid, {
            action: 'sync',
            isPlaying: isPlaying,
            payload: {
                speed: speed,
                currentTime: currentTime,
                videoUrl: this.playerUrl,
                toAdmin: false,
            },
        });
    }

    private handleVideoSyncEvent(event: ISyncEvent): void {
        if (!this.player || !event || (this.isAdmin && !event.payload.toAdmin)) {
            if (event.action === 'change') {
                this.updateVideo(event.payload.videoUrl);
            }

            return;
        }

        // Handle different sync events
        switch (event.action) {
            case 'play':
                this.player.seekTo(event.payload.currentTime, true);
                this.player.playVideo();

                break;
            case 'pause':
                this.player.seekTo(event.payload.currentTime, true);
                this.player.pauseVideo();

                break;
            case 'sync':
                // Only adjust if drift is significant
                if (
                    Math.abs(this.player.getCurrentTime() - event.payload.currentTime) >
                    (this.SYNC_INTERVAL_MS * 2) / 1000
                ) {
                    // Sync TIME
                    this.player.seekTo(event.payload.currentTime, true);
                }

                // Match play/pause state
                if (event.isPlaying && this.player.getPlayerState() === YT.PlayerState.PAUSED) {
                    // Sync Play
                    this.player.playVideo();
                } else if (!event.isPlaying && this.player.getPlayerState() === YT.PlayerState.PLAYING) {
                    // Sync Pause
                    this.player.pauseVideo();
                }

                if (this.player.getPlaybackRate() !== event.payload.speed) {
                    // Sync Speed
                    this.player.setPlaybackRate(event.payload.speed);
                }

                try {
                    const urlObj = new URL(event.payload.videoUrl);
                    const videoId = urlObj.searchParams.get('v');
                    if (videoId && this.playerUrl !== videoId) {
                        this.updateVideo(event.payload.videoUrl);
                    }
                } catch (e) {
                    if (event.payload.videoUrl && this.playerUrl !== event.payload.videoUrl) {
                        this.updateVideo(event.payload.videoUrl);
                    }
                }
                break;
            case 'speed':
                this.player.setPlaybackRate(event.payload.speed);
                break;
            case 'change':
                this.updateVideo(event.payload.videoUrl);
                break;
        }

        if (event.payload.toAdmin) {
            this.skipNextUpdate = true; // Skip the next update to prevent duplicate video changes
        }
    }
}
