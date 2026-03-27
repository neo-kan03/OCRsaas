 import React from 'react';
import { t } from '../services/translations';
import hiwUpload from '../assets/illustrations/hiw-upload.png';
import hiwExtract from '../assets/illustrations/hiw-extract.png';
import hiwExport from '../assets/illustrations/hiw-export.png';

export default function HowItWorksView({ onOpenOCR }) {
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="aeon-hiw-main">
            {/* Hero Section */}
            <section className="aeon-hiw-hero aeon-container">
                <h1 dangerouslySetInnerHTML={{ __html: t('hiw_hero_title') }}></h1>
                <p className="subtitle">{t('hiw_hero_subtitle')}</p>
            </section>

            {/* Step 1: Upload */}
            <section className="aeon-hiw-step aeon-container">
                <div className="aeon-hiw-content">
                    <span className="step-tag">{t('section_tag_next_gen')}</span>
                    <h2>{t('hiw_step1_title')}</h2>
                    <p>{t('hiw_step1_desc')}</p>
                </div>
                <div className="aeon-hiw-visual">
                    <div className="aeon-hiw-glass-card">
                        <img src={hiwUpload} alt="Upload Illustration" />
                    </div>
                </div>
            </section>

            {/* Step 2: Extract (Reversed) */}
            <section className="aeon-hiw-step aeon-container reversed">
                <div className="aeon-hiw-content">
                    <span className="step-tag">{t('section_tag_efficiency')}</span>
                    <h2>{t('hiw_step2_title')}</h2>
                    <p>{t('hiw_step2_desc')}</p>
                    <div className="aeon-hiw-mini-features">
                        <div className="mini-item">
                            <span className="material-symbols-outlined">verified</span>
                            <span>{t('feature_accuracy_title')}</span>
                        </div>
                        <div className="mini-item">
                            <span className="material-symbols-outlined">translate</span>
                            <span>{t('feature_multilingual_title')}</span>
                        </div>
                    </div>
                </div>
                <div className="aeon-hiw-visual">
                    <div className="aeon-hiw-glass-card">
                        <img src={hiwExtract} alt="AI Extraction Illustration" />
                    </div>
                </div>
            </section>

            {/* Step 3: Export */}
            <section className="aeon-hiw-step aeon-container">
                <div className="aeon-hiw-content">
                    <span className="step-tag">Cloud Ready</span>
                    <h2>{t('hiw_step3_title')}</h2>
                    <p>{t('hiw_step3_desc')}</p>
                    <div className="aeon-hiw-formats">
                        <span className="format-badge">JSON</span>
                        <span className="format-badge">CSV</span>
                        <span className="format-badge">EXCEL</span>
                    </div>
                </div>
                <div className="aeon-hiw-visual">
                    <div className="aeon-hiw-glass-card">
                        <img src={hiwExport} alt="Export Illustration" />
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="aeon-hiw-cta aeon-container">
                <div className="aeon-hiw-cta-box">
                    <h2>{t('hiw_cta_title')}</h2>
                    <button onClick={onOpenOCR} className="aeon-btn-primary big">
                        {t('hiw_cta_btn')}
                        <span className="material-symbols-outlined">bolt</span>
                    </button>
                </div>
            </section>
        </div>
    );
}
