import React, { useEffect } from 'react';
import { Sparkles, Heart, ShieldCheck, Globe, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  useEffect(() => {
    document.title = "About Us | Kaarigar Expo";
  }, []);

  return (
    <div className="container" style={{ padding: '4rem 1.5rem 6rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 4rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-bg-alt)', padding: '0.35rem 0.9rem', borderRadius: 'var(--radius-full)', marginBottom: '1rem', color: 'var(--color-primary)' }}>
          <Sparkles size={16} color="var(--color-secondary-dark)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Preserving Indian Heritage</span>
        </div>
        <h1 style={{ fontSize: '2.75rem', marginBottom: '1rem' }}>Empowering India’s Traditional Craftspeople</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.15rem', lineHeight: 1.7 }}>
          Kaarigar Expo is a modern event management and digital registration platform dedicated to elevating artisans, bridging the gap between master creators and patrons of authentic handicrafts.
        </p>
      </div>

      {/* Mission & Vision */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        <div className="card" style={{ padding: '2.5rem 2rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-alt)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <Heart size={24} />
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>Our Mission</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.98rem', lineHeight: 1.7 }}>
            To provide every Indian artisan a transparent, dignified, and direct channel to apply for, participate in, and excel at major handicraft melas, exhibitions, and cultural bazaars across the country.
          </p>
        </div>

        <div className="card" style={{ padding: '2.5rem 2rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-alt)', color: 'var(--color-secondary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <Globe size={24} />
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>Our Vision</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.98rem', lineHeight: 1.7 }}>
            A sustainable cultural economy where traditional handicraft traditions thrive, artisan livelihoods are protected, and visitors experience the rich cultural tapestry of India firsthand.
          </p>
        </div>

        <div className="card" style={{ padding: '2.5rem 2rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-alt)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <ShieldCheck size={24} />
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>Authenticity & Trust</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.98rem', lineHeight: 1.7 }}>
            Rigorous curation and review workflows ensure only verified, authentic artisans are featured, safeguarding both visitor trust and artisan integrity.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div style={{ background: 'var(--color-primary)', color: '#FFFFFF', borderRadius: 'var(--radius-xl)', padding: '3.5rem 2.5rem', textAlign: 'center' }}>
        <h2 style={{ color: '#FFFFFF', fontSize: '2rem', marginBottom: '1rem' }}>Join the Cultural Movement</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '600px', margin: '0 auto 2rem', fontSize: '1.05rem' }}>
          Whether you are a generational master craftsperson or a passionate admirer of Indian arts, Kaarigar Expo welcomes you.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-secondary">
            Register Today
          </Link>
          <Link to="/melas" className="btn btn-outline" style={{ color: '#FFFFFF', borderColor: '#FFFFFF' }}>
            Explore Melas
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
