/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { environment } from '@env/environment';
import { Observable, Subject, Subscriber } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class WebSocketService {
    private socket: Socket | undefined;
    private userId: string;

    constructor() {
        this.userId = this.generateUserId();
    }

    connect(): void {
        if (!this.socket || !this.socket.connected) {
            this.socket = io(environment.API_URL, {
                query: { userId: this.userId },
                transports: ['websocket'],
            });
        }
    }

    disconnect(): void {
        if (this.socket && this.socket.connected) {
            this.socket.disconnect();
            this.socket = undefined;
        }
    }

    send<T>(event: string, data: T): void {
        if (this.socket && this.socket.connected) {
            this.socket.emit(event, { userId: this.userId, data });
        } else {
            console.warn('WebSocket is not connected. Reconnecting...');
            this.connect();
            setTimeout(() => this.send(event, data), 500);
        }
    }

    listen<T>(event: string): Observable<T> {
        console.log(`New Sub! \n 🎯 ${event}`);

        const subject = new Subject<T>();

        if (this.socket) {
            this.socket.on(event, (message: T) => {
                subject.next(message);
            });
        }

        return subject.asObservable();
    }

    stopListening(event: string): void {
        if (this.socket) {
            console.log(`Sub Destroyed! \n ❌ ${event}`);
            this.socket.off(event);
        } else {
            console.error('WebSocket is not connected.');
        }
    }

    getUserId(): string {
        return this.userId;
    }

    createTwoSideWSConnection<T, U>(event: string, data: U, listenEvent: string, take: 'ONE' | 'IDENTITY'): Observable<T> {
        return new Observable<T>((observer: Subscriber<T>) => {
            this.send<U>(event, data);

            const subscription = this.listen<T>(listenEvent).subscribe({
                next: (response: T) => {
                    observer.next(response);

                    if (take === 'ONE') {
                        // в цьому контексті complete спрацює у того, хто підписався
                        // оскільки він ще не успів відписатись
                        observer.complete();

                        subscription.unsubscribe();
                        this.stopListening(listenEvent);
                    }
                },
                error: (error) => {
                    observer.error(error);
                },
            });

            // Виконується перед відпискою
            // complete - не спрацює, оскільки ми уже відписались
            return () => {
                subscription.unsubscribe();
                this.stopListening(listenEvent);
            };
        });
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
