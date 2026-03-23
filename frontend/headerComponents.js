function Header({ user, onLogin, onLogout }) {
    React.useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, [user]);

    if (!user) return null;

    const handleLanguageChange = (e) => {
        window.i18n.lang = e.target.value;
    };

    return (
        <header className="aeon-header">
            <div className="aeon-header-container">
                <div className="aeon-header-logo" onClick={() => window.location.reload()}>
                    <div className="aeon-logo-icon">F</div>
                    <span className="aeon-logo-text">Facturas SaaS</span>
                </div>

                <nav className="aeon-header-nav">
                    <a href="#features">{window.t('nav_features')}</a>
                    <a href="#use-cases">{window.t('nav_use_cases')}</a>
                </nav>

                <div className="aeon-header-actions">
                    <select
                        className="aeon-lang-selector"
                        value={window.i18n.lang}
                        onChange={handleLanguageChange}
                        title={window.t('header_title_language')}
                    >
                        <option value="es">ES</option>
                        <option value="en">EN</option>
                    </select>

                    {user.isGuest ? (
                        <React.Fragment>
                            <button onClick={onLogin} className="aeon-btn-login">{window.t('btn_login')}</button>
                            <button onClick={onLogin} className="aeon-btn-signup">{window.t('btn_free_trial')}</button>
                        </React.Fragment>
                    ) : (
                        <div className="aeon-user-profile">
                            <span className="aeon-user-name">
                                <i data-lucide="circle-user"></i>
                                {window.t('user_welcome', { name: user.name })}
                            </span>
                            <button onClick={onLogout} className="aeon-btn-logout">{window.t('btn_logout')}</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
