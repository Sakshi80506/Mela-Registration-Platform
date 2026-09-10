import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import FormInput from '../../components/common/FormInput';
import { useToast } from '../../context/ToastContext';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    document.title = "Contact Support | Kaarigar Expo";
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showError('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      showSuccess("Thank you for reaching out! Our support team will get back to you shortly.");
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSubmitting(false);
    }, 600);
  };

  return (
    <div className="container" style={{ padding: '4rem 1.5rem 6rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Helpdesk & Inquiries
        </span>
        <h1 style={{ fontSize: '2.5rem', marginTop: '0.25rem' }}>Get in Touch with Us</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginTop: '0.4rem' }}>
          Have questions regarding artisan stall applications, visitor entry passes, or organizing a mela? We are here to assist.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Contact info cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-alt)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Mail size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Email Inquiries</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                For general support and mela partnerships.
              </p>
              <a href="mailto:support@kaarigarexpo.org" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                support@kaarigarexpo.org
              </a>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-alt)', color: 'var(--color-secondary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Phone size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Artisan Helpline</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                Monday to Saturday, 9:00 AM – 6:00 PM IST.
              </p>
              <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                +91 11 2436 0000 / 0001
              </span>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-alt)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Headquarters</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                Handicrafts Promotion Council Building, Institutional Area, New Delhi - 110003, India.
              </p>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={20} color="var(--color-secondary)" /> Send Us a Message
          </h2>

          <form onSubmit={handleSubmit}>
            <FormInput
              id="contact-name"
              label="Your Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priyanshu Roy"
            />

            <FormInput
              id="contact-email"
              type="email"
              label="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. priyanshu@example.com"
            />

            <FormInput
              id="contact-subject"
              label="Subject / Topic"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Stall booking inquiry for Delhi Mela"
            />

            <FormInput
              id="contact-message"
              type="textarea"
              rows={4}
              label="Message"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please describe how we can assist you..."
            />

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={submitting}
              style={{ marginTop: '0.5rem' }}
            >
              <Send size={16} /> {submitting ? 'Sending...' : 'Submit Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
