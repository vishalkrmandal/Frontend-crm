import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

const transactions = [
    {
        id: "TX12457",
        user: {
            name: "John Smith",
            email: "john@example.com",
            avatar: "/placeholder.svg",
        },
        amount: "+$245",
        type: "Deposit",
        date: "14 Jan 2025",
        status: "Completed",
        plan: "Basic (Monthly)",
    },
    {
        id: "TX59774",
        user: {
            name: "Emily Johnson",
            email: "emily@example.com",
            avatar: "/placeholder.svg",
        },
        amount: "+$395",
        type: "Deposit",
        date: "14 Jan 2025",
        status: "Completed",
        plan: "Enterprise (Yearly)",
    },
    {
        id: "TX22457",
        user: {
            name: "Michael Chen",
            email: "michael@example.com",
            avatar: "/placeholder.svg",
        },
        amount: "+$145",
        type: "Deposit",
        date: "14 Jan 2025",
        status: "Completed",
        plan: "Advanced (Monthly)",
    },
]

export function RecentTransactionsTable() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Latest financial activities</CardDescription>
                </div>
                <Link to="/transactions">
                    <Button variant="ghost" size="sm" className="text-xs">
                        View All
                        <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Avatar>
                                    <AvatarImage src={transaction.user.avatar} alt={transaction.user.name} />
                                    <AvatarFallback>{transaction.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{transaction.user.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {transaction.id} • {transaction.date}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-medium">{transaction.amount}</div>
                                <Badge variant="outline" className="text-xs">
                                    {transaction.type}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-3">
                <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                    <div>Showing 3 of 25 transactions</div>
                    <div>Updated just now</div>
                </div>
            </CardFooter>
        </Card>
    )
}

