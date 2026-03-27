import React from 'react';
import Header from './components/headerComponents';
import LoadingView from './components/loadingView';
import LoginView from './components/loginView';
import RegisterView from './components/registerView';
import OCRDashboardView from './components/ocrDashboardView';
import HomeView from './components/homeView';
import HowItWorksView from './components/howItWorksView';

// Services
import AuthController from './controllers/authController';
import UserService from './services/userService';
import SubscriptionService from './services/subscriptionService';
import { i18n, t } from './services/translations';
import User from './models/user';

// Firebase
import { auth, db } from './config/firebase';

export default function App() {
  const [user, setUser] = React.useState(null);
  const [authView, setAuthView] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') || localStorage.getItem("current_view") || "home";
  });

  const navigate = React.useCallback((newView) => {
    setView(newView);
    const params = new URLSearchParams(window.location.search);
    params.set('view', newView);
    window.history.pushState({ view: newView }, '', `?${params.toString()}`);
  }, []);

  React.useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.view) {
        setView(event.state.view);
      } else {
        const params = new URLSearchParams(window.location.search);
        setView(params.get('view') || localStorage.getItem("current_view") || 'home');
      }
    };
    window.addEventListener('popstate', handlePopState);

    // Add initial state to history stack if empty
    if (!window.history.state) {
      window.history.replaceState({ view }, '', `?view=${view}`);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [lang, setLang] = React.useState(i18n.lang);

  React.useEffect(() => {
    const handleLang = (e) => {
      setLang(e.detail);
    };
    window.addEventListener('languageChange', handleLang);
    return () => window.removeEventListener('languageChange', handleLang);
  }, []);

  React.useEffect(() => {
    localStorage.setItem("current_view", view);

    // Dynamic SEO Metadata
    let titleStr = t('home_title') || "Facturas SaaS - OCR";
    let metaDesc = t('home.hero.subtitle') || "Extracción inteligente de datos y automatización documental";

    if (authView === "login") {
      titleStr = t('login_title') + " - Facturas SaaS";
      metaDesc = "Inicia sesión para gestionar tus extracciones";
    } else if (authView === "register") {
      titleStr = t('register_title') + " - Facturas SaaS";
      metaDesc = "Regístrate en Facturas SaaS y prueba la automatización gratis";
    } else if (view === "ocr") {
      titleStr = t('ocr_dropzone_title') + " - Facturas SaaS";
      metaDesc = t('ocr_dropzone_subtitle') || "Panel de extracción de OCR";
    }

    document.title = titleStr;
    const metaDescElement = document.querySelector('meta[name="description"]');
    if (metaDescElement) {
      metaDescElement.setAttribute("content", metaDesc);
    }
  }, [view, authView, lang]);

  React.useEffect(() => {
    AuthController.onAuthChange(async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const profile = await UserService.getUser(firebaseUser.uid);

          // Sincronizar uso previo de invitado si existe
          if (profile && profile.subscriptionId) {
            await SubscriptionService.syncGuestUsage(profile.subscriptionId);
          }

          let subData = null;
          if (profile && profile.subscriptionId) {
            subData = await SubscriptionService.getSubscription(profile.subscriptionId);
          }

          const userInstance = new User({
            uid: firebaseUser.uid,
            subscriptionId: profile ? profile.subscriptionId : null,
            email: firebaseUser.email,
            name: (profile && profile.name) ? profile.name : (firebaseUser.displayName || t('user_default_name')),
            role: (profile && profile.role) ? profile.role : t('user_default_role'),
            subscription: subData
          });
          setUser(userInstance);
          setAuthView(null);
          navigate("ocr");
        } catch (err) {
          console.error("Error al cargar datos del usuario:", err);
        }
      } else {
        // Usuario no logueado -> Guest Mode
        const today = getLocalToday();
        const storedRaw = localStorage.getItem("guest_usage");
        const stored = storedRaw ? JSON.parse(storedRaw) : { usageToday: 0 };
        const usage = (stored.dateUsageToday === today) ? stored.usageToday : 0;

        const guestInstance = new User({
          subscriptionId: "guest",
          name: t('user_guest_name'),
          role: t('user_guest_role'),
          subscription: {
            tipo: t('user_guest_type'),
            maxFactPerDays: 10,
            usageToday: usage,
            dateUsageToday: today
          }
        });
        guestInstance.isGuest = true;
        setUser(guestInstance);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingView />;

  if (authView === "login") {
    return (
      <React.Fragment>
        <Header
          user={user}
          onLogin={() => setAuthView("login")}
          onLogout={AuthController.logout}
          onNavigate={navigate}
          currentView={view}
        />
        <LoginView
          onLogin={AuthController.login}
          onLoginWithGoogle={AuthController.loginWithGoogle}
          onSwitch={() => setAuthView("register")}
          onBack={() => setAuthView(null)}
        />
      </React.Fragment>
    );
  }

  if (authView === "register") {
    return (
      <React.Fragment>
        <Header
          user={user}
          onLogin={() => setAuthView("login")}
          onLogout={AuthController.logout}
          onNavigate={navigate}
          currentView={view}
        />
        <RegisterView
          onRegister={AuthController.register}
          onSwitch={() => setAuthView("login")}
          onBack={() => setAuthView(null)}
        />
      </React.Fragment>
    );
  }

  return (
    <div className="app-main-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header
        user={user}
        onLogin={() => setAuthView("login")}
        onLogout={AuthController.logout}
        onNavigate={navigate}
        currentView={view}
      />
      <div style={{ flex: 1, overflow: view === 'ocr' ? 'hidden' : 'auto' }}>
        {view === "ocr" ? (
          <OCRDashboardView user={user} onBack={() => navigate("home")} />
        ) : view === "how_it_works" ? (
          <HowItWorksView onOpenOCR={() => navigate("ocr")} />
        ) : (
          <HomeView
            user={user}
            onLogout={(user && user.isGuest) ? null : AuthController.logout}
            onLogin={() => setAuthView("login")}
            onOpenOCR={() => navigate("ocr")}
            onOpenHIW={() => navigate("how_it_works")}
          />
        )}
      </div>
    </div>
  );
}

function getLocalToday() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
}