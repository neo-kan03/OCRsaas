function LoginView({ onLogin, onLoginWithGoogle, onSwitch, onBack }) {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [remember, setRemember] = React.useState(true);
    const [error, setError] = React.useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await onLogin(email, password, remember);
        } catch (err) {
            Swal.fire({
                icon: 'error',
                toast: true,
                text: err.message,
                timer: 5000,
                showConfirmButton: false,
                position: "top-end",
                showClass: { popup: '' },
                hideClass: { popup: 'swal2-hide', backdrop: 'swal2-backdrop-hide', icon: 'swal2-icon-hide' }
            });
            setError(err.message);
        }
    };

    const handleGoogleLogin = async (e) => {
        e.preventDefault();
        try {
            await onLoginWithGoogle();
        } catch (err) {
            Swal.fire({
                icon: 'error',
                toast: true,
                text: err.message,
                timer: 5000,
                showConfirmButton: false,
                position: "top-end",
                showClass: { popup: '' },
                hideClass: { popup: 'swal2-hide', backdrop: 'swal2-backdrop-hide', icon: 'swal2-icon-hide' }
            });
        }
    };

    return (
        <div className="centered-layout">
            <div className="container">
                <h2>{window.t('login_title')}</h2>
                <form onSubmit={handleSubmit}>
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="submit" className="aeon-btn-primary" style={{ width: '100%' }}>{window.t('login_btn_enter')}</button>
                </form>
                <div style={{ margin: '20px 0', textAlign: 'center', color: '#666' }}></div>
                <button onClick={handleGoogleLogin} className="divIniciarSesion">
                    <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" width="20" />
                    {window.t('login_btn_google')}
                </button>
                <p>{window.t('login_footer_no_account')} <button onClick={onSwitch}>{window.t('login_btn_switch_register')}</button></p>
                <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                    <button onClick={onBack} className="aeon-btn-secondary" style={{ width: '100%' }}>← {window.t('login_btn_back')}</button>
                </div>
            </div>
        </div>
    );
}