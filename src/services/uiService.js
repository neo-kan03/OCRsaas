import Swal from 'sweetalert2';

export const Alerts = {
    success(title, text) {
        return Swal.fire({
            toast: true,
            position: 'bottom-end',
            icon: 'success',
            title: title,
            text: text,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    },
    warning(title, text) {
        return Swal.fire({
            toast: true,
            position: 'bottom-end',
            icon: 'warning',
            title: title,
            text: text,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    },
    info(title, text) {
        return Swal.fire({
            toast: true,
            position: 'bottom-end',
            icon: 'info',
            title: title,
            text: text,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    },
    error(title, text) {
        return Swal.fire({
            toast: true,
            position: 'bottom-end',
            icon: 'error',
            title: title,
            text: text,
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true
        });
    },
    errorToast(message) {
        return this.error(message);
    },
    confirm(title, text) {
        return Swal.fire({
            icon: 'warning',
            title: title,
            text: text,
            showCancelButton: true,
            confirmButtonColor: '#0052FF',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        });
    }
};

export const UIService = {
    showLoading(title = 'Cargando...') {
        Swal.fire({
            title: title,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    },
    hideLoading() {
        Swal.close();
    }
};

// Mantener compatibilidad global por ahora
window.Alerts = Alerts;
window.UIService = UIService;
