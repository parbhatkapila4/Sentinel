import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <img className="footer-logo-img" src="/Sentinel%20New%20logo.png" alt="Sentinel logo" />
            <div className="footer-tag">
              Read-only CRM and calendar sync, Slack and webhook alerts, and deal risk scoring, so revenue teams see stalled pipeline earlier.
            </div>
            <div className="footer-status"><span className="dot" />ALL SYSTEMS OPERATIONAL</div>
          </div>
          <div className="footer-col">
            <h5>SOCIAL</h5>
            <a href="https://x.com/Parbhat03" target="_blank" rel="noopener noreferrer">
              X / Twitter
            </a>
            <a href="https://www.linkedin.com/in/parbhat-kapila/" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href="https://github.com/parbhatkapila4" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
          <div className="footer-col">
            <h5>FOR BUILDERS</h5>
            <Link href="/api-docs">API Reference</Link>
            <Link href="/integrations">Integrations</Link>
            <Link href="/how">How It Works</Link>
            <Link href="/shortcuts">Keyboard Shortcuts</Link>
          </div>
          <div className="footer-col">
            <h5>INFORMATION</h5>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/security">Security &amp; trust</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 Sentinel</div>
          <div className="footer-bottom-r">
            <Link href="/support">Status</Link>
            <Link href="/changelog">Changelog</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
