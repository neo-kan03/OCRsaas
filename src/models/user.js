export default class User {
    constructor({ uid, subscriptionId, email, name, role, subscription }) {
        this.uid = uid || null;
        this.subscriptionId = subscriptionId || null;
        this.email = email || "";
        this.name = name || "";
        this.role = role || "";
        this.subscription = subscription || { usageToday: 0, maxFactPerDays: 10, tipo: "gratis" };
        this.isGuest = false;
    }
}

window.User = User;