import firebase from '../config/firebase';
import { auth } from '../config/firebase';
import UserService from '../services/userService';
import SubscriptionService from '../services/subscriptionService';
import FirebaseError from '../config/firebaseError';

const provider = new firebase.auth.GoogleAuthProvider();

const AuthController = {
    login: async (email, password, remember) => {
        try {
            await auth.setPersistence(remember ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION);
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            const profile = await UserService.ensureUserExists(user);
            
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

            const profile = await UserService.ensureUserExists(user);

            if (profile && profile.subscriptionId) {
                await SubscriptionService.syncGuestUsage(profile.subscriptionId);
            }

            return { success: true, user };
        } catch (error) {
            throw new FirebaseError(error.code);
        }
    },
    logout: async () => {
        try {
            await auth.signOut();
        } catch (error) {
            throw new FirebaseError(error.code);
        }
    },
    register: async (email, password, name) => {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            await UserService.createUser(user, name);
            
            if (UserService.subscriptionId) {
                await SubscriptionService.syncGuestUsage(UserService.subscriptionId);
            }

            return { success: true, user };
        } catch (error) {
            throw new FirebaseError(error.code);
        }
    },
    onAuthChange: (callback) => {
        auth.onAuthStateChanged(callback);
    }
}

window.AuthController = AuthController;
export default AuthController;