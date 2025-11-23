// src/app/core/domain/entities/notification.entity.ts
export class Notification {
    constructor(
        public readonly id: string,
        public type: string,
        public message: string,
        public timestamp: Date,
        public isRead: boolean,
        public evaluationId?: string
    ) { }
}
