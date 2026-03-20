function HomeView({ user, onLogout, onLogin, onOpenOCR }) {
    const [contadorDiario, setContadorDiario] = React.useState(user.subscription.usageToday);

    React.useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, []);

    return (
        <div className="home-wrapper">
            <div className="bg-grid"></div>
            {/* HERO SECTION V2 */}
            <section className="hero-v2">
                <div className="hero-shape-1"></div>
                <div className="hero-shape-2"></div>
                {/*<span className="pill-tag">OCR de Nueva Generación</span>*/}
                <h1 dangerouslySetInnerHTML={{ __html: window.t('home_hero_title') }}></h1>
                <p>{window.t('home_hero_subtitle')}</p>
                <div className="hero-btns">
                    <button onClick={onOpenOCR} className="btn-primary-v2">{window.t('home_hero_btn')}</button>
                    <button className="btn-secondary-v2 ghost">{window.t('home_hero_btn_demo')} <i data-lucide="move-right" style={{width: '20px', height: '20px'}}></i></button>
                </div>
                <div className="hero-main-img">
                    <img src="assets/dashboard.png" alt="Dashboard Preview" />
                </div>
            </section>

            {/* SIDE-BY-SIDE FEATURE */}
            <section className="feature-split">
                <div className="feature-list" id="funcionamiento">
                    <span className="section-tag">{window.t('section_tag_next_gen')}</span>
                    <h2 className="section-title">{window.t('feature_title_human_ocr')}</h2>
                    <p style={{ color: '#64748b', marginBottom: '3rem', fontSize: '1.1rem' }}>
                        {window.t('feature_desc_human_ocr')}
                    </p>
                    
                    <div className="feature-list-item">
                        <i><i data-lucide="pen-tool"></i></i>
                        <div>
                            <h4>{window.t('feature_handwriting_title')}</h4>
                            <p>{window.t('feature_handwriting_desc')}</p>
                        </div>
                    </div>
                    <div className="feature-list-item">
                        <i><i data-lucide="languages"></i></i>
                        <div>
                            <h4>{window.t('feature_multilingual_title')}</h4>
                            <p>{window.t('feature_multilingual_desc')}</p>
                        </div>
                    </div>
                    <div className="feature-list-item">
                        <i><i data-lucide="shield-check"></i></i>
                        <div>
                            <h4>{window.t('feature_accuracy_title')}</h4>
                            <p>{window.t('feature_accuracy_desc')}</p>
                        </div>
                    </div>
                </div>
                <div className="feature-img-v2">
                    <img src="assets/extract.png" alt="Extraction Detail"/>
                </div>
            </section>

            {/* GRID FEATURES CENTERED */}
            <section style={{ padding: '8rem 0' }} id="tecnologia">
                <div className="centered-header">
                    <span className="section-tag">{window.t('section_tag_efficiency')}</span>
                    <h2 className="section-title">{window.t('feature_title_scaling')}</h2>
                </div>
                <div className="grid-features-v2">
                    <div className="grid-item-v2">
                        <i><i data-lucide="files"></i></i>
                        <h4>{window.t('grid_multipage_title')}</h4>
                        <p>{window.t('grid_multipage_desc')}</p>
                    </div>
                    <div className="grid-item-v2">
                        <i><i data-lucide="refresh-cw"></i></i>
                        <h4>{window.t('grid_sync_title')}</h4>
                        <p>{window.t('grid_sync_desc')}</p>
                    </div>
                    <div className="grid-item-v2">
                        <i><i data-lucide="cloud"></i></i>
                        <h4>{window.t('grid_cloud_title')}</h4>
                        <p>{window.t('grid_cloud_desc')}</p>
                    </div>
                </div>
            </section>

            {/* PRICING SECTION */}
            <section className="pricing-section" id="precios">
                <div className="centered-header">
                    <h2 className="section-title">{window.t('pricing_title')}</h2>
                    <p>{window.t('pricing_subtitle')}</p>
                </div>                <div className="pricing-grid">
                    <div className="pricing-card">
                        <h5>Starter</h5>
                        <div className="price">0€<span>{window.t('price_per_month')}</span></div>
                        <ul>
                            <li><i data-lucide="check" style={{width: '18px', color: '#2563eb'}}></i> {window.t('plan_feature_docs_100')}</li>
                            <li><i data-lucide="check" style={{width: '18px', color: '#2563eb'}}></i> {window.t('plan_feature_core_std')}</li>
                            <li><i data-lucide="check" style={{width: '18px', color: '#2563eb'}}></i> {window.t('plan_feature_export')}</li>
                        </ul>
                        <button className="btn-pricing outline" onClick={onOpenOCR}>{window.t('pricing_btn_start')}</button>
                    </div>
                    <div className="pricing-card featured">
                        <span className="featured-label">{window.t('pricing_featured_label')}</span>
                        <h5>Pro</h5>
                        <div className="price">79€<span>{window.t('price_per_month')}</span></div>
                        <ul>
                            <li><i data-lucide="check" style={{width: '18px', color: '#2563eb'}}></i> {window.t('plan_feature_docs_1000')}</li>
                            <li><i data-lucide="check" style={{width: '18px', color: '#2563eb'}}></i> {window.t('plan_feature_ia_premium')}</li>
                            <li><i data-lucide="check" style={{width: '18px', color: '#2563eb'}}></i> {window.t('plan_feature_integrations')}</li>
                            <li><i data-lucide="check" style={{width: '18px', color: '#2563eb'}}></i> {window.t('plan_feature_support')}</li>
                        </ul>
                        <button className="btn-pricing primary" onClick={onOpenOCR}>{window.t('pricing_btn_choose')}</button>
                    </div>
                    <div className="pricing-card">
                        <h5>Enterprise</h5>
                        <div className="price">199€<span>{window.t('price_per_month')}</span></div>
                        <ul>
                            <li><i data-lucide="check" style={{width: '18px', color: '#2563eb'}}></i> {window.t('plan_feature_unlimited')}</li>
                            <li><i data-lucide="check" style={{width: '18px', color: '#2563eb'}}></i> {window.t('plan_feature_training')}</li>
                            <li><i data-lucide="check" style={{width: '18px', color: '#2563eb'}}></i> {window.t('plan_feature_sla')}</li>
                        </ul>
                        <button className="btn-pricing dark" onClick={onOpenOCR}>{window.t('pricing_btn_contact')}</button>
                    </div>
                </div>
            </section>

            {/* FOOTER V2 */}
            <footer className="footer-v2">
                <div className="footer-logo">
                    <h2>EXTRAEXTRACT.AI</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        {window.t('footer_desc')}
                    </p>
                </div>
                <div className="footer-col">
                    <h5>{window.t('footer_col_product')}</h5>
                    <ul>
                        <li><a href="#">{window.t('footer_link_api')}</a></li>
                        <li><a href="#">{window.t('footer_link_integrations')}</a></li>
                        <li><a href="#">{window.t('footer_link_security')}</a></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h5>{window.t('footer_col_company')}</h5>
                    <ul>
                        <li><a href="#">{window.t('footer_link_about')}</a></li>
                        <li><a href="#">{window.t('footer_link_blog')}</a></li>
                        <li><a href="#">{window.t('footer_link_press')}</a></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h5>{window.t('footer_col_legal')}</h5>
                    <ul>
                        <li><a href="#">{window.t('footer_link_privacy')}</a></li>
                        <li><a href="#">{window.t('footer_link_terms')}</a></li>
                    </ul>
                </div>
            </footer>
            
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                <p>{window.t('footer_copyright')}</p>
            </div>
        </div>
    );
}

