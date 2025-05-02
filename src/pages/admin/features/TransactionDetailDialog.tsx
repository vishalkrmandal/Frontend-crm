import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Add these state variables to the top of your component
const [isViewingDetails, setIsViewingDetails] = useState(false);
const [selectedTransaction, setSelectedTransaction] = useState(null);
const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

// Define the formatDate function
const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

// Define the formatAmount function
const formatAmount = (amount: number, type: string) => {
    const formattedAmount = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
    }).format(amount);

    return type === 'Withdrawal' ? `-${formattedAmount}` : formattedAmount;
};

// Define the getTypeBadge function
const getTypeBadge = (type: string) => {
    switch (type) {
        case 'Deposit':
            return '💰 Deposit';
        case 'Withdrawal':
            return '🏧 Withdrawal';
        case 'Transfer':
            return '🔄 Transfer';
        default:
            return '❓ Unknown';
    }
};

// Replace your viewTransactionDetails function with this:
const viewTransactionDetails = (transaction) => {
    setIsViewingDetails(true);
    // Use setTimeout to prevent UI blocking
    setTimeout(() => {
        setSelectedTransaction(transaction);
        setDetailsDialogOpen(true);
        setIsViewingDetails(false);
    }, 0);
};

// Create a separate component for the dialog
const TransactionDetailsDialog = ({ transaction, open, onOpenChange }) => {
    if (!transaction) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                {transaction && (
                    <>
                        <DialogHeader>
                            <DialogTitle>
                                {transaction.type} Details
                            </DialogTitle>
                        </DialogHeader>

                        <Tabs defaultValue="details" className="mt-4">
                            <TabsList className="grid w-full grid-cols-1">
                                <TabsTrigger value="details">Transaction Details</TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">User Name</p>
                                        <p className="font-medium">{transaction.user.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                                        <p>{transaction.user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Amount</p>
                                        <p className="font-medium">{formatAmount(transaction.amount, transaction.type)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Type</p>
                                        <p>{getTypeBadge(transaction.type)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Payment Method</p>
                                        <p>{transaction.paymentMethod}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Plan Type</p>
                                        <p>{transaction.planType}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                                        <p>{transaction.status}</p>
                                    </div>
                                    {transaction.type === 'Transfer' ? (
                                        <>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-1">From Account</p>
                                                <p>{transaction.fromAccountNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-1">To Account</p>
                                                <p>{transaction.toAccountNumber}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">Account Number</p>
                                            <p>{transaction.accountNumber}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Requested On</p>
                                        <p>{formatDate(transaction.requestedOn)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Completed On</p>
                                        <p>{transaction.completedOn ? formatDate(transaction.completedOn) : 'Pending'}</p>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};