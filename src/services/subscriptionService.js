import { db } from '../config/firebase';
import firebase from '../config/firebase';

const SubscriptionService = {
    async createSubscription(userName, subscriptionId, uid) {
        await db.collection("subscriptions").doc(subscriptionId).set({
            owner: uid,
            userName: userName,
            tipo: "gratis",
            maxUser: 1,
            maxFactPerDays: 10,
            usageToday: 0,
            dateUsageToday: this.getLocalToday(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    },

    async getSubscription(subscriptionId) {
        if (!subscriptionId) return null;
        const docSnap = await db.collection("subscriptions").doc(subscriptionId).get();
        if (docSnap.exists) {
            return docSnap.data();
        }
        return null;
    },

    async updateSubscription(subscriptionId, data) {
        await db.collection("subscriptions").doc(subscriptionId).update(data);
    },

    async incrementUsage(subscriptionId) {
        const sub = await this.getSubscription(subscriptionId);
        if (!sub) return;

        const today = this.getLocalToday();
        let newUsage = (sub.dateUsageToday === today) ? (sub.usageToday + 1) : 1;

        await this.updateSubscription(subscriptionId, {
            usageToday: newUsage,
            dateUsageToday: today
        });
    },

    async syncGuestUsage(subscriptionId) {
        const storedRaw = localStorage.getItem("guest_usage");
        if (!storedRaw) return;

        const stored = JSON.parse(storedRaw);
        const today = this.getLocalToday();

        if (stored.dateUsageToday === today && stored.usageToday > 0) {
            const sub = await this.getSubscription(subscriptionId);
            if (sub) {
                let currentUsage = (sub.dateUsageToday === today) ? sub.usageToday : 0;
                await this.updateSubscription(subscriptionId, {
                    usageToday: currentUsage + stored.usageToday,
                    dateUsageToday: today
                });
            }
            localStorage.removeItem("guest_usage");
        }
    },

    getLocalToday() {
        const d = new Date();
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().split('T')[0];
    }
};

window.SubscriptionService = SubscriptionService;
export default SubscriptionService;