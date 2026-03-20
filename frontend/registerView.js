function RegisterView({ onRegister, onSwitch, onBack }) {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [name, setName] = React.useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await onRegister(email, password, name);
            Swal.fire({
                icon: 'success',
                toast: true,
                text: window.t('register_msg_success'),
                timer: 2000,
                showConfirmButton: false,
                position: "top-end",
                showClass: { popup: '' },
                hideClass: { popup: 'swal2-hide', backdrop: 'swal2-backdrop-hide', icon: 'swal2-icon-hide' }
            });
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

    return (
        <div className="centered-layout">
            <div className="container">
                <h2>{window.t('register_title')}</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder={window.t('register_placeholder_name')} value={name} onChange={e => setName(e.target.value)} required />
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="submit">{window.t('register_btn_submit')}</button>
                </form>
                <p>{window.t('register_footer_has_account')} <button onClick={onSwitch}>{window.t('register_btn_switch_login')}</button></p>
                <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                    <button onClick={onBack} className="btn-secondary" style={{ width: '100%' }}>← {window.t('login_btn_back')}</button>
                </div>
            </div>
        </div>
    );
}