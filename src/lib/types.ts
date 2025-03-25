export interface Ticket {
    id: string
    subject: string
    description: string
    status: "Open" | "In Progress" | "Pending" | "Solved" | "Closed"
    category: string
    createdAt: string
    updatedAt: string
    customerId: string
    assignedTo?: string
    attachments?: Attachment[]
    messages: Message[]
}

export interface Message {
    id: string
    ticketId: string
    content: string
    senderId: string
    senderType: "customer" | "agent"
    createdAt: string
    attachments?: Attachment[]
}

export interface Attachment {
    id: string
    filename: string
    path: string
    size: number
    mimeType: string
    uploadedAt: string
}

export interface Customer {
    id: string
    name: string
    email: string
    phone?: string
    createdAt: string
    totalTickets: number
}

export interface Agent {
    id: string
    name: string
    email: string
    role: "admin" | "agent"
    department?: string
    avatar?: string
    createdAt: string
}

export interface TicketStats {
    newTickets: number
    openTickets: number
    solvedTickets: number
    pendingTickets: number
    averageResponseTime: number
    ticketsPerDay: { date: string; count: number }[]
}

