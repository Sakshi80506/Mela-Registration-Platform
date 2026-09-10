import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="public-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-brand">
            <h3>
              <Sparkles size={22} color="var(--color-secondary)" />
              Kaarigar Expo
            </h3>
            <p>
              Dedicated to celebrating, preserving, and providing market access to India’s traditional handicraft masters, weaves, and folk heritage.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/melas">Upcoming Melas</Link></li>
              <li><Link to="/kaarigars">Featured Kaarigars</Link></li>
              <li><Link to="/about">About Platform</Link></li>
              <li><Link to="/contact">Contact Support</Link></li>
            </ul>
          </div>

          {/* For Artisans & Visitors */}
          <div className="footer-col">
            <h4>Portals</h4>
            <ul className="footer-links">
              <li><Link to="/register">Artisan Registration</Link></li>
              <li><Link to="/register">Visitor Passes</Link></li>
              <li><Link to="/login">Account Login</Link></li>
              <li><Link to="/melas">Event Calendar</Link></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="footer-col">
            <h4>Contact & Helpdesk</h4>
            <ul className="footer-links">
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="var(--color-secondary)" /> support@kaarigarexpo.org
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="var(--color-secondary)" /> +91 11 2436 0000
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="var(--color-secondary)" /> New Delhi, India
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Kaarigar Expo – Mela Registration Platform. All rights reserved.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Empowering Indian Artisans with <Heart size={14} color="#E53935" fill="#E53935" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
