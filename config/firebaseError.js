window.FirebaseError = class FirebaseError extends Error {
    constructor(code) {
        super(FirebaseError.getMensaje(code));
        this.code = code;
    }

    static getMensaje(code) {
        switch (code) {
            case "auth/invalid-credential":
            case "auth/invalid-login-credentials":
                return window.t('error_invalid_credentials');
            case "auth/email-already-in-use":
                return "Este correo ya está registrado";
            case "auth/user-not-found":
            case "auth/wrong-password":
                return "Email o contraseña incorrectos";
            case "auth/invalid-email":
                return "El formato del correo electrónico no es válido";
            case "auth/weak-password":
                return "La contraseña es muy débil";
            case "auth/too-many-requests":
                return "Demasiados intentos. Por favor, inténtalo más tarde";
            case "auth/operation-not-allowed":
                return window.t('error_method_disabled');
            case "auth/network-request-failed":
                return "Error de conexión a internet";
            case "auth/user-disabled":
                return "Esta cuenta de usuario ha sido deshabilitada";
            case "auth/popup-closed-by-user":
                return "Se ha cancelado el inicio de sesión";
            case "permission-denied":
                return "Error de permisos en la base de datos (Colección mal nombrada o acceso denegado)";
            default:
                console.warn("Código de error Firebase no mapeado:", code);
                return "Ha ocurrido un error inesperado al conectar con Firebase";
        }
    }
}