export default function Hero({ onCtaClick }: { onCtaClick: () => void }) {
    return (
        <section className="hero">
            <div className="hero-orb hero-orb-1" aria-hidden="true" />
            <div className="hero-orb hero-orb-2" aria-hidden="true" />
            <div className="hero-orb hero-orb-3" aria-hidden="true" />

            <div className="hero-inner">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="hero-badge-dot" />
                        Advanced AI Detection
                    </div>

                    <h1 className="hero-title">
                        Is it real
                        <br />
                        or <span className="hero-title-gradient">AI-made?</span>
                    </h1>

                    <p className="hero-subtitle">
                        Get a clearer picture with multi-model analysis. Check images for
                        AI-generated patterns in just a few moments.
                    </p>

                    <div className="hero-actions">
                        <button className="btn btn-primary" onClick={onCtaClick}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            Analyze an Image
                        </button>
                        <a className="btn btn-secondary" href="#how-it-works">
                            How It Works
                        </a>
                    </div>

                    <div className="hero-proof" aria-label="Detection highlights">
                        <span><span className="hero-proof-check">✓</span> Multiple models</span>
                        <span><span className="hero-proof-check">✓</span> Private analysis</span>
                    </div>
                </div>

                <div className="hero-visual" aria-hidden="true">
                    <div className="hero-visual-orbit hero-visual-orbit-outer" />
                    <div className="hero-visual-orbit hero-visual-orbit-inner" />
                    <div className="hero-visual-card">
                        <div className="hero-visual-header">
                            <span className="hero-visual-brand">
                                <span className="hero-visual-brand-icon">V</span>
                                VERIFAI <span>/</span> ANALYSIS
                            </span>
                            <span className="hero-visual-status">
                                <span /> READY
                            </span>
                        </div>
                        <div className="hero-visual-image">
                            <svg viewBox="0 0 480 300" fill="none">
                                <defs>
                                    <linearGradient id="preview-sky" x1="240" y1="0" x2="240" y2="300" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#FFE7EA" />
                                        <stop offset="1" stopColor="#FFF7F7" />
                                    </linearGradient>
                                    <linearGradient id="preview-hill" x1="240" y1="120" x2="240" y2="300" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#F06F86" stopOpacity=".76" />
                                        <stop offset="1" stopColor="#E74B69" stopOpacity=".18" />
                                    </linearGradient>
                                </defs>
                                <rect width="480" height="300" rx="14" fill="url(#preview-sky)" />
                                <circle cx="338" cy="88" r="34" fill="#F58A9C" fillOpacity=".8" />
                                <circle cx="338" cy="88" r="51" stroke="#E76B82" strokeOpacity=".3" />
                                <path d="M0 206L92 137L155 190L252 108L374 207L421 166L480 209V300H0V206Z" fill="#F7CDD3" />
                                <path d="M0 235L112 178L191 230L298 159L392 226L449 193L480 211V300H0V235Z" fill="url(#preview-hill)" />
                                <path d="M0 248L101 218L177 252L275 203L362 252L435 220L480 239V300H0V248Z" fill="#D94D68" fillOpacity=".5" />
                                <path d="M0 150H480M0 200H480M0 250H480M80 0V300M160 0V300M240 0V300M320 0V300M400 0V300" stroke="#FFFFFF" strokeOpacity=".42" />
                                <rect x="1" y="1" width="478" height="298" rx="13" stroke="#E8A0AD" strokeOpacity=".42" />
                            </svg>
                            <div className="hero-visual-scanline" />
                            <span className="hero-visual-image-label">IMAGE PATTERN SCAN</span>
                            <span className="hero-visual-corner hero-visual-corner-tl" />
                            <span className="hero-visual-corner hero-visual-corner-tr" />
                            <span className="hero-visual-corner hero-visual-corner-bl" />
                            <span className="hero-visual-corner hero-visual-corner-br" />
                        </div>
                        <div className="hero-visual-footer">
                            <div>
                                <span className="hero-visual-caption">ANALYSIS PIPELINE</span>
                                <strong>Three independent checks</strong>
                            </div>
                            <div className="hero-visual-pipeline">
                                <span>GENAI</span>
                                <span>VISION</span>
                                <span>METADATA</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-float-chip">
                        <span className="hero-float-chip-icon">✳</span>
                        <span><strong>One image</strong><small>Multiple signals</small></span>
                    </div>
                </div>
            </div>
        </section>
    );
}
