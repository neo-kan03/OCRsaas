window.User = class User {
    constructor({ uid, subscriptionId, email, name, role, subscriptionData }) {
        this.uid = uid;
        this.subscriptionId = subscriptionId;
        this.email = email;
        this.name = name;
        this.role = role || "Empleado/a";
        this.subscription = new window.Subscription(subscriptionData || {});
    }

    isOwner() {
        return this.role === "Jefe/a" || this.subscription.isOwner(this.uid);
    }

    canPerformAction() {
        return this.subscription.usageToday < this.subscription.maxFactPerDays;
    }

    addUsage() {
        this.subscription.incrementUsage();
    }
};