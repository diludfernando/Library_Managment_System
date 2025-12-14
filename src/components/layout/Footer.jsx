import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-brand">
                    <div className="logo">
                        <span className="logo-icon">📚</span>
                        <span className="logo-text">LibSys</span>
                    </div>
                    <p className="footer-desc">
                        Empowering communities through knowledge and imagination.
                    </p>
                </div>

                <div className="footer-links">
                    <div className="link-group">
                        <h4>Explore</h4>
                        <a href="#">Catalog</a>
                        <a href="#">New Arrivals</a>
                        <a href="#">Popular</a>
                        <a href="#">E-Books</a>
                    </div>

                    <div className="link-group">
                        <h4>Support</h4>
                        <a href="#">Help Center</a>
                        <a href="#">Contact Us</a>
                        <a href="#">FAQs</a>
                        <a href="#">Librarians</a>
                    </div>

                    <div className="link-group">
                        <h4>Legal</h4>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Cookie Policy</a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} LibSys. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
