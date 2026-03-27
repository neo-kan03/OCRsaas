import React from 'react';
export default function RegisterView({ onRegister, onSwitch, onBack }) {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [name, setName] = React.useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await onRegister(email, password, name);
            Alerts.success(window.t('register_msg_success'));
        } catch (err) {
            Alerts.errorToast(err.message);
            setError(err.message);
        }
    };

    return (
        <div className="centered-layout">
            <div className="container">
                <h2>{window.t('register_title')}</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder={window.t('register_placeholder_name') || "Name"} value={name} onChange={e => setName(e.target.value)} required />
                    <input type="email" placeholder={window.t('login_placeholder_email') || "Email"} value={email} onChange={e => setEmail(e.target.value)} required />
                    <input type="password" placeholder={window.t('login_placeholder_password') || "Password"} value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="submit" className="aeon-btn-primary" style={{ width: '100%' }}>{window.t('register_btn_submit')}</button>
                </form>
                <p>{window.t('register_footer_has_account')} <button onClick={onSwitch}>{window.t('register_btn_switch_login')}</button></p>
                <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                    <button onClick={onBack} className="aeon-btn-secondary" style={{ width: '100%' }}>← {window.t('login_btn_back')}</button>
                </div>
            </div>
        </div>
    );
}
