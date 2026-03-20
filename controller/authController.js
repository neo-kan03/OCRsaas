const provider = new firebase.auth.GoogleAuthProvider();
const AuthController = {
    login: async (email, password, remember) => {
        try {
            await auth.setPersistence(remember ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION);
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Sincronizamos con Firestore si no existe
            const profile = await UserService.ensureUserExists(user);
            
            // Sincronizar uso previo de invitado
            if (profile && profile.subscriptionId) {
                await SubscriptionService.syncGuestUsage(profile.subscriptionId);
            }
            
            return { success: true, user };
        } catch (error) {
            throw new FirebaseError(error.code);
        }
    },
    loginWithGoogle: async (remember = true) => {
        try {
            await auth.setPersistence(remember ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION);
            
            const result = await auth.signInWithPopup(provider);
            const user = result.user;

            // También sincronizamos Google
            const profile = await UserService.ensureUserExists(user);

            // Sincronizar uso previo de invitado
            if (profile && profile.subscriptionId) {
                await SubscriptionService.syncGuestUsage(profile.subscriptionId);
            }

            return { success: true, user };
        } catch (error) {
            throw new FirebaseError(error.code);
            //console.error("Error al iniciar sesion con Google: ", error);
        }
    },
    logout: async () => {
        try {
            await auth.signOut();
            console.log('Usuario deslogueado');
        } catch (error) {
            throw new FirebaseError(error.code);
        }
    },
    register: async (email, password, name) => {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Al ser registro nuevo, lo creamos siempre
            await UserService.createUser(user, name);
            
            // Sincronizar uso previo de invitado en la cuenta recién creada
            // El profileId es el subscriptionId recién creado (está en UserService después de createUser)
            if (UserService.subscriptionId) {
                await SubscriptionService.syncGuestUsage(UserService.subscriptionId);
            }

            return { success: true, user };
        } catch (error) {
            throw new FirebaseError(error.code);
            //console.error("Error al registrar: ", error);
        }
    },
    onAuthChange: (callback) => {
        auth.onAuthStateChanged(callback);
    }
}