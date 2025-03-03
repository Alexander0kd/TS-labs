import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserRole } from '@app/enums/user-role.enum';
import { IMessage } from '@app/interfaces/message.interface';
import { IRoom } from '@app/interfaces/room.interface';
import { RoomService } from '@app/services/room/room.service';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil } from 'rxjs';
import { v4 as uuid } from 'uuid';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit, OnDestroy {
    @Input() room!: IRoom;
    @Input() userId: string = '';
    @Input() showChat: boolean = false;

    faPaperPlane = faPaperPlane;

    private destroy$: Subject<void> = new Subject<void>();

    chatMessages: IMessage[] = [];
    chatForm: FormGroup;
    UserRole = UserRole;

    constructor(
        private roomService: RoomService,
        private fb: FormBuilder
    ) {
        this.chatForm = this.fb.group({
            message: ['', [Validators.required]],
        });
    }

    getUserRoleClass(role: UserRole): string {
        switch (role) {
            case UserRole.ADMIN:
                return 'user-admin';
            default:
                return 'user-regular';
        }
    }

    getUserRoleLabel(role: UserRole): string {
        switch (role) {
            case UserRole.ADMIN:
                return 'Адмін';
            default:
                return 'Користувач';
        }
    }

    ngOnInit(): void {
        this.roomService
            .subscribeToMessageEvents()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.chatMessages.push(data);
                },
            });
    }

    sendMessage(): void {
        if (this.chatForm.valid) {
            const message: IMessage = {
                uuid: uuid(),
                senderName: this.name,
                content: this.chatForm.get('message')?.value,
                timestamp: new Date(),
            };

            this.chatMessages.push(message);
            this.chatForm.reset({ message: '' });

            this.roomService.sendMessage(this.room.uuid, message);
        }
    }

    get name(): string {
        return `User-${this.userId.substring(0, 5)}`;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
