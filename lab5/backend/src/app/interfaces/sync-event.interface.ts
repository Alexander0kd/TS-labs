export interface ISyncEvent {
    action: 'sync' | 'play' | 'pause' | 'speed' | 'change';
    isPlaying: boolean;
    payload: {
        currentTime: number;
        speed: number;
        videoUrl: string;
        toAdmin: boolean;
    };
}
