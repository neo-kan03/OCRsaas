import React from 'react';
import { createIcons, icons } from 'lucide';
import { t, i18n } from '../services/translations';

export default function Header({ user, onLogin, onLogout, onNavigate, currentView }) {
    React.useEffect(() => {
        createIcons({ icons });
    }, [user, currentView]);

    if (!user) return null;

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        window.i18n.lang = newLang;

        // Actualizar URL sincronizando el idioma
        const params = new URLSearchParams(window.location.search);
        params.set('lang', newLang);
        window.history.pushState(window.history.state, '', `?${params.toString()}`);
    };

    const handleHomeLink = (e, anchor) => {
        e.preventDefault();
        if (currentView !== 'home') {
            onNavigate('home');
            // Retardo para que cargue la vista y pueda hacer scroll
            setTimeout(() => {
                const el = document.getElementById(anchor);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            const el = document.getElementById(anchor);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header className="aeon-header">
            <div className="aeon-header-container">
                <div className="aeon-header-logo" onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
                    <div className="aeon-logo-icon">{t('header_logo_initial')}</div>
                    <span className="aeon-logo-text">{t('header_brand_name')}</span>
                </div>

                <nav className="aeon-header-nav">
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('how_it_works'); }}>{t('nav_how_it_works')}</a>
                    <a href="#features" onClick={(e) => handleHomeLink(e, 'features')}>{t('nav_features')}</a>
                    <a href="#use-cases" onClick={(e) => handleHomeLink(e, 'use-cases')}>{t('nav_use_cases')}</a>
                </nav>

                <div className="aeon-header-actions">
                    <select
                        className="aeon-lang-selector"
                        value={i18n.lang}
                        onChange={handleLanguageChange}
                        title={t('header_title_language')}
                    >
                        <option value="es">ES</option>
                        <option value="en">EN</option>
                    </select>

                    {user.isGuest ? (
                        <React.Fragment>
                            <button onClick={onLogin} className="aeon-btn-login">{t('btn_login')}</button>
                            <button onClick={onLogin} className="aeon-btn-signup">{t('btn_free_trial')}</button>
                        </React.Fragment>
                    ) : (
                        <div className="aeon-user-profile">
                            <span className="aeon-user-name">
                                <i data-lucide="circle-user"></i>
                                {t('user_welcome', { name: user.name })}
                            </span>
                            <button onClick={onLogout} className="aeon-btn-logout">{t('btn_logout')}</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
