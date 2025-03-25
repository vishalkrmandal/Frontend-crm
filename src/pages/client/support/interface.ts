// src/interfaces/User.ts
export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'client' | 'admin' | 'agent';
    createdAt: Date;
}

// src/interfaces/Ticket.ts
export interface Ticket {
    _id: string;
    ticketNumber: string;
    subject: string;
    description: string;
    status: 'new' | 'open' | 'inProgress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    category: string;
    createdBy: string | User;
    assignedTo?: string | User;
    attachments: Attachment[];
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
    closedAt?: Date;
}

// src/interfaces/Message.ts
export interface Message {
    _id: string;
    ticketId: string;
    sender: string | User;
    content: string;
    attachments: Attachment[];
    createdAt: Date;
}

// src/interfaces/Attachment.ts
export interface Attachment {
    _id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    filePath: string;
    uploadedBy: string | User;
    createdAt: Date;
}

// src/interfaces/Dashboard.ts
export interface TicketStats {
    newTickets: number;
    openTickets: number;
    solvedTickets: number;
    pendingTickets: number;
    totalTickets: number;
}

export interface TicketTrend {
    date: string;
    count: number;
}