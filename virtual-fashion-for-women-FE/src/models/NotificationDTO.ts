export interface ResponseNotification {
    notificationId: number;
    receiverId: number;
    createdAt: string;
    readAt?: string | null;
    isRead?: boolean | null;
    title: string;
    content: string;
}