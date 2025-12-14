import React from 'react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="container hero-container">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Discover Your Next <br />
                        <span className="highlight">Great Adventure</span>
                    </h1>
                    <p className="hero-description">
                        Explore our vast collection of books, journals, and digital resources.
                        Your gateway to knowledge and imagination starts here.
                    </p>



                    <div className="hero-stats">
                        <div className="stat-item">
                            <span className="stat-number">50k+</span>
                            <span className="stat-label">Books</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">10k+</span>
                            <span className="stat-label">Members</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">24/7</span>
                            <span className="stat-label">Access</span>
                        </div>
                    </div>
                </div>

                <div className="hero-image">
                    <div className="image-wrapper">
                        {/* Placeholder for a nice library illustration or image */}
                        <div className="abstract-shape shape-1"></div>
                        <div className="abstract-shape shape-2"></div>
                        <img src="https://images.unsplash.com/photo-1507842217121-9e93c8aaf27c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Library Interior" className="main-img" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
