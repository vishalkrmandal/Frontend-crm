
const NotificationCard = () => {
    // Mock notification data
    const notifications = [
        {
            id: 1,
            title: "Account Update",
            message: "Your profile has been updated successfully",
            time: "5 minutes ago",
            read: false
        },
        {
            id: 2,
            title: "New Feature",
            message: "Check out our new wallet management features",
            time: "1 hour ago",
            read: false
        }
    ];

    return (
        <div className="absolute right-0 mt-1 w-80 rounded-md border bg-background shadow-lg">
            <div className="flex items-center justify-between border-b p-3">
                <h3 className="font-semibold">Notifications</h3>
                <span className="text-xs text-muted-foreground">{notifications.length} new</span>
            </div>

            <div className="max-h-96 overflow-auto">
                {notifications.length > 0 ? (
                    <div>
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`border-b p-3 hover:bg-accent cursor-pointer ${notification.read ? '' : 'bg-accent/20'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <h4 className="font-medium">{notification.title}</h4>
                                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-4 text-center text-muted-foreground">
                        No new notifications
                    </div>
                )}
            </div>

            <div className="p-3 border-t">
                <button className="text-xs text-center w-full text-primary hover:underline">
                    Mark all as read
                </button>
            </div>
        </div>
    );
};

export default NotificationCard;