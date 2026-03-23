function HomeView({ user, onLogout, onLogin, onOpenOCR }) {
    React.useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, []);

    return (
        <div className="home-aeon">
            <HeroSection onOpenOCR={onOpenOCR} />
            <TrustSection />
            <HowItWorksSection />
            <VisualMappingSection />
            <FeaturesSection />
            <UseCasesSection />
            <FinalCTASection onOpenOCR={onOpenOCR} />
            <FooterSection />
        </div>
    );
}

function HeroSection({ onOpenOCR }) {
    return (
        <section className="aeon-hero aeon-container">
            <div>
                <span className="aeon-hero-tag">
                    <span className="material-symbols-outlined" style={{fontSize: '1rem'}}>verified_user</span>
                    {window.t('home.hero.tag')}
                </span>
                <h1 className="aeon-hero-title" dangerouslySetInnerHTML={{ __html: window.t('home.hero.title') }}></h1>
                <p className="aeon-hero-subtitle">{window.t('home.hero.subtitle')}</p>

                <div className="aeon-hero-btns">
                    <button onClick={onOpenOCR} className="aeon-btn-primary">
                        {window.t('home.hero.cta_primary')}
                    </button>
                    <button className="aeon-btn-secondary">
                        {window.t('home.hero.cta_secondary')}
                    </button>
                </div>
                <p style={{fontSize: '0.875rem', color: 'rgba(69, 70, 77, 0.6)', fontWeight: 500, margin: 0}}>
                    {window.t('home.hero.disclaimer')}
                </p>
            </div>

            <div className="aeon-hero-visual-wrapper">
                <div className="aeon-hero-visual">
                    <div className="aeon-hero-visual-grid">
                        <div className="aeon-mock-card">
                            <div className="aeon-mock-badge input">{window.t('home.visual_mapping.input')}</div>
                            <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e0e3e5', paddingBottom: '1rem'}}>
                                <div style={{width: '60%', height: '1.25rem', backgroundColor: '#e0e3e5', borderRadius: '0.25rem'}}></div>
                                <div style={{width: '2.5rem', height: '2.5rem', backgroundColor: '#e0e3e5', borderRadius: '9999px'}}></div>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                                <div style={{width: '100%', height: '1rem', backgroundColor: '#f2f4f6', borderRadius: '0.25rem'}}></div>
                                <div style={{width: '80%', height: '1rem', backgroundColor: '#f2f4f6', borderRadius: '0.25rem'}}></div>
                                <div style={{width: '100%', height: '1rem', backgroundColor: '#f2f4f6', borderRadius: '0.25rem'}}></div>
                            </div>
                            <div style={{marginTop: '2rem', height: '6rem', backgroundColor: '#f7f9fb', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                {/* <span className="material-symbols-outlined" style={{color: '#4648d4', fontSize: '2.5rem', opacity: 0.5}}>description</span> */}
                            </div>
                        </div>

                        <div className="aeon-mock-code">
                            <div className="aeon-mock-badge output">{window.t('home.visual_mapping.output')}</div>
                            <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1.5rem'}}>
                                <div style={{width: '0.75rem', height: '0.75rem', backgroundColor: '#ffdad6', borderRadius: '50%'}}></div>
                                <div style={{width: '0.75rem', height: '0.75rem', backgroundColor: '#ffe082', borderRadius: '50%'}}></div>
                                <div style={{width: '0.75rem', height: '0.75rem', backgroundColor: '#c5e1a5', borderRadius: '50%'}}></div>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', color: '#c0c1ff'}}>
                                <div><span style={{color: 'white'}}>"company"</span>: <span style={{fontWeight: 'bold'}}> "Amazon Web Services"</span>,</div>
                                <div><span style={{color: 'white'}}>"total"</span>: <span style={{color: '#ffe082', fontWeight: 'bold'}}> 1248.50</span>,</div>
                                <div><span style={{color: 'white'}}>"vat"</span>: <span style={{color: '#ffe082', fontWeight: 'bold'}}> 249.70</span>,</div>
                                <div><span style={{color: 'white'}}>"date"</span>: <span style={{fontWeight: 'bold'}}> "2026-03-23"</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function TrustSection() {
    return (
        <section className="aeon-trust">
            <div className="aeon-container">
                <h2 className="aeon-trust-title">{window.t('home.trust.title')}</h2>
                <div className="aeon-trust-grid">
                    <div className="aeon-trust-item">
                        <span className="material-symbols-outlined">verified_user</span>
                        <span className="text">{window.t('home.trust.item1')}</span>
                    </div>
                    <div className="aeon-trust-item">
                        <span className="material-symbols-outlined">gavel</span>
                        <span className="text">{window.t('home.trust.item2')}</span>
                    </div>
                    <div className="aeon-trust-item">
                        <span className="material-symbols-outlined">database_off</span>
                        <span className="text">{window.t('home.trust.item3')}</span>
                    </div>
                </div>
                <div className="aeon-trust-quote">
                    "{window.t('home.trust.quote')}" — {window.t('home.trust.quote_author')}
                </div>
            </div>
        </section>
    );
}

function HowItWorksSection() {
    return (
        <section className="aeon-hiw aeon-container" id="how-it-works">
            <div className="aeon-hiw-header">
                <h2>{window.t('home.how_it_works.title')}</h2>
                <p>{window.t('home.how_it_works.subtitle')}</p>
            </div>
            <div className="aeon-hiw-grid">
                <div className="aeon-hiw-card">
                    <div className="aeon-hiw-icon"><span className="material-symbols-outlined">upload_file</span></div>
                    <h3>{window.t('home.how_it_works.step1_title')}</h3>
                    <p>{window.t('home.how_it_works.step1_desc')}</p>
                </div>
                <div className="aeon-hiw-card">
                    <div className="aeon-hiw-icon"><span className="material-symbols-outlined">smart_toy</span></div>
                    <h3>{window.t('home.how_it_works.step2_title')}</h3>
                    <p>{window.t('home.how_it_works.step2_desc')}</p>
                </div>
                <div className="aeon-hiw-card">
                    <div className="aeon-hiw-icon"><span className="material-symbols-outlined">terminal</span></div>
                    <h3>{window.t('home.how_it_works.step3_title')}</h3>
                    <p>{window.t('home.how_it_works.step3_desc')}</p>
                </div>
            </div>
        </section>
    );
}

function VisualMappingSection() {
    return (
        <section className="aeon-extraction" id="features">
            <div className="aeon-container aeon-extraction-grid">
                <div className="aeon-extraction-visual">
                    <div className="aeon-doc-interactive">
                        <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e0e3e5', paddingBottom: '2rem'}}>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                                <div style={{width: '8rem', height: '1.5rem'}} className="aeon-doc-ghost"></div>
                                <div style={{width: '6rem', height: '1rem'}} className="aeon-doc-ghost"></div>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end'}}>
                                <div style={{width: '5rem', height: '1rem'}} className="aeon-doc-ghost"></div>
                                <div style={{width: '4rem', height: '1rem'}} className="aeon-doc-ghost"></div>
                            </div>
                        </div>
                        <div style={{marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <div style={{width: '12rem', height: '1rem'}} className="aeon-doc-ghost"></div>
                                <div style={{width: '3rem', height: '1rem'}} className="aeon-doc-ghost"></div>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <div style={{width: '14rem', height: '1rem'}} className="aeon-doc-ghost"></div>
                                <div style={{width: '3rem', height: '1rem'}} className="aeon-doc-ghost"></div>
                            </div>
                        </div>

                        {/* Interactive overlays */}
                        <div style={{position: 'absolute', top: '2.5rem', left: '2.5rem', width: '9rem', height: '2.5rem', border: '2px solid #4648d4', borderRadius: '0.5rem', backgroundColor: 'rgba(70, 72, 212, 0.05)'}}>
                            <div style={{position: 'absolute', top: '-1.25rem', left: '0', backgroundColor: '#4648d4', color: 'white', fontSize: '0.625rem', fontWeight: 'bold', padding: '0.125rem 0.5rem', borderRadius: '0.25rem'}}>{window.t('home.visual_mapping.tag_company')}</div>
                        </div>
                        <div style={{position: 'absolute', bottom: '5rem', right: '2.5rem', width: '8rem', height: '3rem', border: '2px solid #6063ee', borderRadius: '0.5rem', backgroundColor: 'rgba(96, 99, 238, 0.05)'}}>
                            <div style={{position: 'absolute', top: '-1.25rem', right: '0', backgroundColor: '#6063ee', color: 'white', fontSize: '0.625rem', fontWeight: 'bold', padding: '0.125rem 0.5rem', borderRadius: '0.25rem'}}>{window.t('home.visual_mapping.tag_total')}</div>
                        </div>

                        <div style={{position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '0.5rem 1rem', borderRadius: '9999px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #e0e3e5'}}>
                            <span className="material-symbols-outlined" style={{color: '#4648d4', fontSize: '1.25rem'}}>near_me</span>
                            <span style={{fontSize: '0.75rem', fontWeight: 'bold'}}>{window.t('home.visual_mapping.drag_fields')}</span>
                        </div>
                    </div>
                </div>

                <div className="aeon-extraction-content">
                    <h2>{window.t('home.visual_mapping.title')}</h2>
                    <span className="subtitle">{window.t('home.visual_mapping.subtitle')}</span>
                    <p className="desc">{window.t('home.visual_mapping.desc')}</p>
                    
                    <div className="aeon-extraction-list">
                        <div className="aeon-extraction-list-item">
                            <div className="icon"><span className="material-symbols-outlined">check</span></div>
                            <span className="text">{window.t('home.visual_mapping.f1')}</span>
                        </div>
                        <div className="aeon-extraction-list-item">
                            <div className="icon"><span className="material-symbols-outlined">check</span></div>
                            <span className="text">{window.t('home.visual_mapping.f2')}</span>
                        </div>
                        <div className="aeon-extraction-list-item">
                            <div className="icon"><span className="material-symbols-outlined">check</span></div>
                            <span className="text">{window.t('home.visual_mapping.f3')}</span>
                        </div>
                        <div className="aeon-extraction-list-item">
                            <div className="icon"><span className="material-symbols-outlined">check</span></div>
                            <span className="text">{window.t('home.visual_mapping.f4')}</span>
                        </div>
                    </div>

                    <button className="aeon-btn-primary" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem'}}>
                        {window.t('home.visual_mapping.cta')}
                        <span className="material-symbols-outlined" style={{fontSize: '1.25rem'}}>arrow_forward</span>
                    </button>
                </div>
            </div>
        </section>
    );
}

function FeaturesSection() {
    return (
        <section className="aeon-bento aeon-container">
            <div className="aeon-bento-grid">
                <div className="aeon-bento-card aeon-bento-1">
                    <div>
                        <span className="material-symbols-outlined" style={{color: '#4648d4', fontSize: '2.5rem', marginBottom: '1.5rem'}}>dynamic_form</span>
                        <h3 style={{fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem', color: '#131b2e'}}>{window.t('home.features.title1')}</h3>
                        <p style={{color: '#45464d', fontSize: '1.125rem'}}>{window.t('home.features.desc1')}</p>
                    </div>
                    <div style={{marginTop: '2rem', display: 'flex', gap: '1rem'}}>
                        <span style={{padding: '0.5rem 1rem', borderRadius: '0.5rem', backgroundColor: '#f2f4f6', color: '#45464d', fontWeight: 500}}>{window.t('home.features.tag1')}</span>
                        <span style={{padding: '0.5rem 1rem', borderRadius: '0.5rem', backgroundColor: '#f2f4f6', color: '#45464d', fontWeight: 500}}>{window.t('home.features.tag2')}</span>
                    </div>
                </div>

                <div className="aeon-bento-card aeon-bento-2">
                    <span className="material-symbols-outlined" style={{color: '#c0c1ff', fontSize: '2.5rem', marginBottom: '1.5rem'}}>bolt</span>
                    <h3 style={{fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem'}}>{window.t('home.features.title2')}</h3>
                    <p style={{color: '#c0c1ff', fontSize: '1.125rem'}}>{window.t('home.features.desc2')}</p>
                </div>

                <div className="aeon-bento-card aeon-bento-3">
                    <span className="material-symbols-outlined" style={{color: '#ffffff', fontSize: '2.5rem', marginBottom: '1.5rem'}}>code_blocks</span>
                    <h3 style={{fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem'}}>{window.t('home.features.title3')}</h3>
                    <p style={{opacity: 0.9, fontSize: '1.125rem'}}>{window.t('home.features.desc3')}</p>
                </div>

                <div className="aeon-bento-card aeon-bento-4">
                    <div style={{display: 'flex', gap: '2rem', alignItems: 'center', height: '100%'}}>
                        <div style={{flex: 1}}>
                            <h3 style={{fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem', color: '#131b2e'}}>{window.t('home.features.title4')}</h3>
                            <p style={{color: '#45464d', fontSize: '1.125rem'}}>{window.t('home.features.desc4')}</p>
                        </div>
                        <div style={{flex: 1, backgroundColor: '#f2f4f6', padding: '2rem', borderRadius: '1rem', border: '1px solid #e0e3e5'}}>
                            <pre style={{fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.875rem', color: '#45464d'}}>
{`{
  `}<span style={{color: '#4648d4', fontWeight: 'bold'}}>"vendor": "Amazon"</span>{`,
  `}<span style={{color: '#b45309', fontWeight: 'bold'}}>"total": 123.50</span>{`,
  `}<span style={{color: '#4648d4', fontWeight: 'bold'}}>"date": "2026-03-20"</span>{`
}`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function UseCasesSection() {
    return (
        <section className="aeon-cases aeon-container" id="use-cases">
            <h2>{window.t('home.use_cases.title')}</h2>
            <div className="aeon-cases-grid">
                <div className="aeon-case-card">
                    <span className="material-symbols-outlined" style={{color: '#4648d4', fontSize: '2.5rem', marginBottom: '1rem'}}>account_balance</span>
                    <h4 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#131b2e'}}>{window.t('home.use_cases.c1_title')}</h4>
                    <p style={{color: '#45464d'}}>{window.t('home.use_cases.c1_desc')}</p>
                </div>
                <div className="aeon-case-card">
                    <span className="material-symbols-outlined" style={{color: '#4648d4', fontSize: '2.5rem', marginBottom: '1rem'}}>storefront</span>
                    <h4 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#131b2e'}}>{window.t('home.use_cases.c2_title')}</h4>
                    <p style={{color: '#45464d'}}>{window.t('home.use_cases.c2_desc')}</p>
                </div>
                <div className="aeon-case-card">
                    <span className="material-symbols-outlined" style={{color: '#4648d4', fontSize: '2.5rem', marginBottom: '1rem'}}>shopping_cart</span>
                    <h4 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#131b2e'}}>{window.t('home.use_cases.c3_title')}</h4>
                    <p style={{color: '#45464d'}}>{window.t('home.use_cases.c3_desc')}</p>
                </div>
            </div>
        </section>
    );
}

function FinalCTASection({ onOpenOCR }) {
    return (
        <section className="aeon-cta">
            <div className="aeon-cta-box">
                <h2>{window.t('home.final_cta.title')}</h2>
                <p style={{fontSize: '1.25rem', color: '#45464d', maxWidth: '42rem', margin: '0 auto 2rem'}}>
                    {window.t('home.final_cta.subtitle')}
                </p>
                <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem'}}>
                    <button onClick={onOpenOCR} className="aeon-btn-primary">
                        {window.t('home.final_cta.btn_primary')}
                    </button>
                    <button className="aeon-btn-secondary">
                        {window.t('home.final_cta.btn_secondary')}
                    </button>
                </div>
                <p style={{fontSize: '0.875rem', color: 'rgba(69, 70, 77, 0.6)', fontWeight: 500}}>
                    {window.t('home.final_cta.footer')}
                </p>
            </div>
        </section>
    );
}

function FooterSection() {
    return (
        <footer className="aeon-footer">
            <div className="aeon-container">
                <div className="aeon-footer-grid">
                    <div className="aeon-footer-brand">
                        <div style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#131b2e', margin: '0 0 1rem'}}>Facturas SaaS</div>
                        <p style={{color: '#45464d', fontSize: '0.875rem', maxWidth: '16rem', lineHeight: '1.5'}}>
                            {window.t('footer_desc')}
                        </p>
                    </div>
                    <div>
                        <h5>{window.t('footer_col_product')}</h5>
                        <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                            <li><a href="#features">{window.t('home.visual_mapping.cta')}</a></li>
                            <li><a href="#">{window.t('footer_link_security')}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h5>{window.t('footer_col_company')}</h5>
                        <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                            <li><a href="#">{window.t('footer_link_about')}</a></li>
                            <li><a href="#">{window.t('footer_link_blog')}</a></li>
                            <li><a href="#">{window.t('footer_link_press')}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h5>{window.t('footer_col_legal')}</h5>
                        <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                            <li><a href="#">{window.t('footer_link_privacy')}</a></li>
                            <li><a href="#">{window.t('footer_link_terms')}</a></li>
                        </ul>
                    </div>
                </div>
                <div style={{marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(224, 227, 229, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{fontSize: '0.75rem', color: '#45464d'}}>{window.t('footer_copyright')}</span>
                    <div style={{display: 'flex', gap: '1.5rem'}}>
                        <a href="#" style={{fontSize: '0.75rem', color: '#45464d', textDecoration: 'none'}}>Twitter</a>
                        <a href="#" style={{fontSize: '0.75rem', color: '#45464d', textDecoration: 'none'}}>LinkedIn</a>
                        <a href="#" style={{fontSize: '0.75rem', color: '#45464d', textDecoration: 'none'}}>GitHub</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
