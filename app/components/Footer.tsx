export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-links">
                <a href="#detector">Detect</a>
                <a href="#features">Features</a>
                <a href="#how-it-works">How It Works</a>
                <a
                    href="https://github.com/ToMyBaNe"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    GitHub
                </a>
            </div>
            <p className="footer-copy">
                &copy; {new Date().getFullYear()} DetectAI. Built for educational purposes.
            </p>
        </footer>
    );
}
