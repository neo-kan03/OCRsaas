function App() {
  const [user, setUser] = React.useState(null);
  const [authView, setAuthView] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState(() => {
    return localStorage.getItem("current_view") || "home";
  });
  const [lang, setLang] = React.useState(window.i18n.lang);

  React.useEffect(() => {
    const handleLang = (e) => {
      setLang(e.detail);
      // Dynamic title
      document.title = window.t('home_title'); 
    };
    window.addEventListener('languageChange', handleLang);
    return () => window.removeEventListener('languageChange', handleLang);
  }, []);

  React.useEffect(() => {
    localStorage.setItem("current_view", view);
  }, [view]);

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
                const userInstance = new window.User({
                    uid: firebaseUser.uid,
                    subscriptionId: profile ? profile.subscriptionId : null,
                    email: firebaseUser.email,
                    name: (profile && profile.name) ? profile.name : (firebaseUser.displayName || window.t('user_default_name')),
                    role: (profile && profile.role) ? profile.role : window.t('user_default_role'),
                    subscriptionData: subData
                });
                setUser(userInstance);
                setAuthView(null);
            } catch (err) {
                console.error("Error al cargar datos del usuario:", err);
            }
        } else {
            // Usuario no logueado -> Guest Mode
            const today = new Date().toISOString().split('T')[0];
            const storedRaw = localStorage.getItem("guest_usage");
            const stored = storedRaw ? JSON.parse(storedRaw) : { usageToday: 0 };
            const usage = (stored.dateUsageToday === today) ? stored.usageToday : 0;
            
            const guestInstance = new window.User({
                subscriptionId: "guest",
                name: window.t('user_guest_name'),
                role: window.t('user_guest_role'),
                subscriptionData: {
                    tipo: window.t('user_guest_type'),
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
            <Header user={user} onLogin={() => setAuthView("login")} onLogout={AuthController.logout} />
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
            <Header user={user} onLogin={() => setAuthView("login")} onLogout={AuthController.logout} />
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
        />
        <div style={{ flex: 1, overflow: 'auto' }}>
            {view === "ocr" ? (
                <OCRDashboardView user={user} onBack={() => setView("home")} />
            ) : (
                <HomeView 
                    user={user} 
                    onLogout={(user && user.isGuest) ? null : AuthController.logout} 
                    onLogin={() => setAuthView("login")}
                    onOpenOCR={() => setView("ocr")} 
                />
            )}
        </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);