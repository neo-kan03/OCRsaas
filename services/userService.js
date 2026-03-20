window.UserService = {
    subscriptionId: "", presetsId: "",


    async createUser(user, name) {
        // Determinamos el nombre final de forma segura
        const displayName = user.displayName || name || "Usuario";
        const finalName = displayName.toUpperCase();

        this.subscriptionId = (typeof crypto.randomUUID === 'function')
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 15);

        this.presetsId = (typeof crypto.randomUUID === 'function')
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 15);

        await db.collection("users").doc(user.uid).set({
            email: user.email,
            name: finalName,
            subscriptionId: this.subscriptionId,
            presetsId: this.presetsId,
            role: "Empleado/a",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await SubscriptionService.createSubscription(finalName, this.subscriptionId, user.uid);
    },

    async ensureUserExists(user) {
        const docSnap = await db.collection("users").doc(user.uid).get();
        if (!docSnap.exists) {
            await this.createUser(user, user.displayName)
            return await this.getUser(user.uid);
        } else {
            return docSnap.data();
        }
    },

    async getUser(uid) {
        const docSnap = await db.collection("users").doc(uid).get();

        if (docSnap.exists) {
            return docSnap.data();
        }

        return null;
    },

    async savePreset(uid, name, fields) {
        if (!uid) return;

        const user = await this.getUser(uid);
        if (!user) {
            console.error("UserService: User not found for uid", uid);
            return;
        }

        let userPresetsDocId = user.presetsId;

        // Si el usuario no tiene presetsId (legacy), se lo creamos al vuelo
        if (!userPresetsDocId) {
            userPresetsDocId = (typeof crypto.randomUUID === 'function')
                ? crypto.randomUUID()
                : Math.random().toString(36).substring(2, 15);

            user.presetsId = userPresetsDocId; // Actualizamos localmente para el resto de la función
        }

        const presetDocRef = db.collection("presets").doc(userPresetsDocId);
        const presetDoc = await presetDocRef.get();

        let allFields = {};
        if (presetDoc.exists) {
            const data = presetDoc.data();
            // Aseguramos que fields sea un objeto por si se grabó como array antes
            allFields = (data.fields && !Array.isArray(data.fields)) ? data.fields : {};
        }

        allFields[name] = fields;

        await presetDocRef.set({
            userId: uid,
            fields: allFields,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    },

    async getPresets(uid) {
        if (!uid) return {};
        const user = await this.getUser(uid);
        if (!user || !user.presetsId) return {};

        const doc = await db.collection("presets").doc(user.presetsId).get();
        if (doc.exists) {
            return doc.data().fields || {};
        }
        return {};
    },

    async deletePreset(uid, name) {
        try {
            if (!uid || !name) return;
            const user = await this.getUser(uid);
            if (!user || !user.presetsId) return;

            const docRef = db.collection("presets").doc(user.presetsId);
            const doc = await docRef.get();
            if (doc.exists) {
                const fields = doc.data().fields || {};
                delete fields[name];
                await docRef.update({ fields: fields });
            }
        } catch (error) {
            console.error("UserService: Error in deletePreset", error);
            throw error;
        }
    }

};