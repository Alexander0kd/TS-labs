import { Injectable } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class WebSocketService {
    private socket$: WebSocketSubject<unknown> | null = null;
    private userId: string;

    private isConnected$ = new BehaviorSubject<boolean>(false);

    constructor() {
        this.userId = this.generateUserId();
    }

    connect(): void {
        if (!this.socket$ || this.socket$.closed) {
            this.socket$ = webSocket(`${environment.WS_URL}?userId=${this.userId}`);

            this.socket$.subscribe({
                next: () => this.isConnected$.next(true),
                error: (err) => {
                    console.error('WebSocket error:', err);
                    this.isConnected$.next(false);
                },
                complete: () => this.isConnected$.next(false),
            });
        }
    }

    disconnect(): void {
        if (this.socket$ && !this.socket$.closed) {
            this.socket$.complete();
        }
    }

    send(event: string, data: unknown): void {
        if (this.socket$ && !this.socket$.closed) {
            this.socket$.next({ event, data, userId: this.userId });
        } else {
            console.warn('WebSocket is not connected. Reconnecting...');
            this.connect();
            setTimeout(() => this.send(event, data), 500);
        }
    }

    listen<T>(event: string): Observable<T> {
        const subject = new Subject<T>();

        if (this.socket$ && !this.socket$.closed) {
            this.socket$.subscribe((message: unknown) => {
                if (
                    message &&
                    typeof message === 'object' &&
                    message !== null &&
                    'event' in message &&
                    message.event === event
                ) {
                    if ('data' in message) {
                        subject.next(message.data as T);
                    }
                }
            });
        }

        return subject.asObservable();
    }

    isConnected(): Observable<boolean> {
        return this.isConnected$.asObservable();
    }

    getUserId(): string {
        return this.userId;
    }

    private generateUserId(): string {
        if (!localStorage.getItem('userId')) {
            const id = uuid();
            localStorage.setItem('userId', id);
            return id;
        }

        return String(localStorage.getItem('userId'));
    }
}
