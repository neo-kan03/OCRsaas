window.SubscriptionService = {
    async createSubscription(nameUser, subscriptionId, uid) {
        try {
            await db.collection("subscriptions").doc(subscriptionId).set({
                nameUser: nameUser,
                tipo: "gratis",
                maxUser: 1,
                maxFactPerDays: 10,
                usageToday: 0,
                dateUsageToday: new Date().toISOString().split('T')[0],
                ownerId: uid,
                users: [uid],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error("Error al crear la suscripción en Firestore:", error);
            throw error;
        }
    },
    async getSubscription(subscriptionId) {
        try {
            if (!subscriptionId) return null;
            const docSnap = await db.collection("subscriptions").doc(subscriptionId).get();
            if (docSnap.exists) {
                return docSnap.data();
            }
            return null;
        } catch (error) {
            console.error("Error al obtener la suscripción:", error);
            return null;
        }
    },
    async updateSubscription(subscription) {
        try {
            await db.collection("subscriptions").doc(subscription.subscriptionId).update({
                tipo: subscription.tipo,
                maxUser: subscription.maxUser,
                maxFactPerDays: subscription.maxFactPerDays
            });
        } catch (error) {
            console.error("Error al actualizar la suscripción:", error);
            throw error;
        }
    },
    async incrementUsage(subscriptionId, amount) {
        if (!subscriptionId || amount <= 0) return;
        try {
            const ref = db.collection("subscriptions").doc(subscriptionId);
            const doc = await ref.get();
            if (doc.exists) {
                const data = doc.data();
                const today = new Date().toISOString().split('T')[0];
                let currentUsage = (data.dateUsageToday === today) ? (data.usageToday || 0) : 0;
                await ref.update({
                    usageToday: currentUsage + amount,
                    dateUsageToday: today
                });
            }
        } catch (error) {
            console.error("Error al incrementar uso:", error);
        }
    },
    async syncGuestUsage(subscriptionId) {
        if (!subscriptionId) return;
        const today = new Date().toISOString().split('T')[0];
        const storedRaw = localStorage.getItem("guest_usage");
        if (!storedRaw) return;

        try {
            const stored = JSON.parse(storedRaw);
            if (stored.dateUsageToday === today && stored.usageToday > 0) {
                console.log(`Sincronizando ${stored.usageToday} usos de invitado a la cuenta...`);
                await this.incrementUsage(subscriptionId, stored.usageToday);
                localStorage.removeItem("guest_usage");
            }
        } catch (e) {
            console.error("Error síncronizando uso de invitado:", e);
        }
    }
}