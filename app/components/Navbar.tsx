"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navigateTo = (id: string) => {
        setMenuOpen(false);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <nav className={`navbar ${scrolled ? "scrolled" : ""}`} aria-label="Main navigation">
            <a className="navbar-logo" href="#" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                <span className="navbar-logo-image-wrap">
                    <Image
                        className="navbar-logo-image"
                        src="/logo.jpg"
                        alt=""
                        width={48}
                        height={48}
                        priority
                    />
                </span>
                <span className="navbar-logo-text">VERIFAI</span>
            </a>

            <ul id="main-navigation" className={`navbar-nav ${menuOpen ? "mobile-open" : ""}`}>
                <li><a href="#detector" onClick={(event) => { event.preventDefault(); navigateTo("detector"); }}>Detect</a></li>
                <li><a href="#features" onClick={(event) => { event.preventDefault(); navigateTo("features"); }}>Features</a></li>
                <li><a href="#how-it-works" onClick={(event) => { event.preventDefault(); navigateTo("how-it-works"); }}>How It Works</a></li>
            </ul>

            <button
                className="navbar-cta"
                onClick={() => navigateTo("detector")}
            >
                Try Now
            </button>

            <button
                className="navbar-menu-btn"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls="main-navigation"
                onClick={() => setMenuOpen((isOpen) => !isOpen)}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            </button>
        </nav>
    );
}
