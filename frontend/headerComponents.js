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
        <header className="header-v2-nav">
            <div className="header-container">
                <div className="header-logo" onClick={() => window.location.reload()} style={{ cursor: 'pointer' }}>
                    <span className="logo-icon"><i data-lucide="scan-text"></i></span>
                    <span className="logo-text">EXTRAEXTRACT<span>.AI</span></span>
                </div>
                
                <nav className="header-nav">
                    <a href="#funcionamiento">{window.t('nav_how_it_works')}</a>
                    <a href="#tecnologia">{window.t('nav_tech')}</a>
                    <a href="#precios">{window.t('nav_pricing')}</a>
                </nav>

                <div className="header-auth">
                    <select 
                        className="lang-selector-v2" 
                        value={window.i18n.lang} 
                        onChange={handleLanguageChange}
                        title={window.t('header_title_language')}
                    >
                        <option value="es">ES</option>
                        <option value="en">EN</option>
                    </select>

                    {user.isGuest ? (
                        <React.Fragment>
                            <button onClick={onLogin} className="btn-login-v2">{window.t('btn_login')}</button>
                            <button onClick={onLogin} className="btn-signup-v2">{window.t('btn_free_trial')}</button>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <span className="user-name-v2"><i data-lucide="circle-user"></i>{window.t('user_welcome', { name: user.name })}</span>
                            <button onClick={onLogout} className="btn-logout-v2">{window.t('btn_logout')}</button>
                        </React.Fragment>
                    )}
                </div>
            </div>
        </header>
    );
}
