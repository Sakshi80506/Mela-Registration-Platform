import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { feedbackService } from '../../services/feedbackService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';

const EventReviews = ({ eventId, eventName }) => {
  const { currentUser, userProfile, role } = useAuth();
  const { showSuccess, showError } = useToast();

  const [feedbackData, setFeedbackData] = useState({
    reviews: [],
    totalCount: 0,
    averageRating: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [myFeedback, setMyFeedback] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadFeedbacks();
    }
  }, [eventId, currentUser]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await feedbackService.getEventFeedbacks(eventId);
      setFeedbackData(data);

      if (currentUser) {
        const userReview = await feedbackService.getUserFeedback(eventId, currentUser.uid);
        if (userReview) {
          setMyFeedback(userReview);
          setRating(userReview.rating);
          setComment(userReview.comment || '');
        } else {
          setMyFeedback(null);
          setRating(5);
          setComment('');
        }
      }
    } catch (err) {
      console.error('Failed to load feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showError('Please login to submit your feedback.');
      return;
    }

    if (!comment.trim()) {
      showError('Please write a brief feedback comment.');
      return;
    }

    setSubmitting(true);
    try {
      await feedbackService.submitFeedback({
        eventId,
        userId: currentUser.uid,
        userName: userProfile?.name || currentUser.displayName || (role === 'kaarigar' ? 'Artisan' : 'Visitor'),
        userRole: role || 'visitor',
        rating,
        comment
      });
      showSuccess(myFeedback ? 'Review updated successfully!' : 'Thank you for your rating & feedback!');
      setIsEditing(false);
      loadFeedbacks();
    } catch (err) {
      console.error('Error saving review:', err);
      showError(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await feedbackService.deleteFeedback(reviewId);
      showSuccess('Review removed.');
      if (myFeedback?.id === reviewId) {
        setMyFeedback(null);
        setComment('');
        setRating(5);
      }
      loadFeedbacks();
    } catch (err) {
      console.error('Error deleting review:', err);
      showError(err.message || 'Failed to delete review.');
    }
  };

  return (
    <div style={{ marginTop: '3.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Community Reviews
          </span>
          <h2 style={{ fontSize: '1.8rem', marginTop: '0.25rem' }}>
            Visitor & Artisan Feedback ({feedbackData.totalCount})
          </h2>
        </div>
      </div>

      {/* Ratings Score & Breakdown Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 280px) 1fr', gap: '2rem', background: 'var(--color-surface)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderRight: '1px solid var(--color-border)', paddingRight: '1.5rem' }}>
          <div style={{ fontSize: '3.2rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>
            {feedbackData.totalCount > 0 ? feedbackData.averageRating : '—'}
          </div>
          <div style={{ display: 'flex', gap: '0.2rem', color: '#F59E0B', margin: '0.5rem 0' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                fill={feedbackData.averageRating >= star ? '#F59E0B' : (feedbackData.averageRating >= star - 0.5 ? '#F59E0B' : 'none')}
                color="#F59E0B"
              />
            ))}
          </div>
          <span style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
            Based on {feedbackData.totalCount} {feedbackData.totalCount === 1 ? 'review' : 'ratings'}
          </span>
        </div>

        {/* Breakdown Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.4rem' }}>
          {[5, 4, 3, 2, 1].map((s) => {
            const count = feedbackData.breakdown[s] || 0;
            const pct = feedbackData.totalCount > 0 ? Math.round((count / feedbackData.totalCount) * 100) : 0;
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                <span style={{ width: '45px', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                  {s} <Star size={13} fill="#F59E0B" color="#F59E0B" />
                </span>
                <div style={{ flex: 1, height: '8px', background: 'var(--color-bg-alt)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-secondary-dark)', borderRadius: '4px', transition: 'width 0.3s' }} />
                </div>
                <span style={{ width: '40px', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Submission Form / Status */}
      {currentUser ? (
        <div style={{ background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--color-border)', marginBottom: '2.5rem' }}>
          {myFeedback && !isEditing ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                  <CheckCircle2 size={18} /> You submitted feedback for this Mela
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#F59E0B', marginBottom: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} fill={myFeedback.rating >= s ? '#F59E0B' : 'none'} color="#F59E0B" />
                  ))}
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text)', fontWeight: 600 }}>
                    {myFeedback.rating} / 5 Stars
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                  "{myFeedback.comment}"
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setIsEditing(true)} className="btn btn-outline btn-sm">
                  Edit Feedback
                </button>
                <button onClick={() => handleDeleteReview(myFeedback.id)} className="btn btn-outline btn-sm" style={{ color: 'var(--color-danger)', borderColor: '#FFCDD2' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                {myFeedback ? 'Update Your Feedback' : 'Rate & Review this Exhibition'}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                Share your experience as a {role === 'kaarigar' ? 'Kaarigar' : 'Visitor'} with the organizers and public.
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Your Rating
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: '#F59E0B' }}
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        size={28}
                        fill={(hoverRating || rating) >= star ? '#F59E0B' : 'none'}
                        color="#F59E0B"
                      />
                    </button>
                  ))}
                  <span style={{ marginLeft: '0.75rem', fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary)' }}>
                    {hoverRating || rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Review & Feedback
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you liked about the stalls, crafts, venue setup, or overall ambiance..."
                  required
                  className="form-control"
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                {isEditing && (
                  <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline btn-sm">
                    Cancel
                  </button>
                )}
                <button type="submit" disabled={submitting} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Send size={14} /> {submitting ? 'Submitting...' : myFeedback ? 'Update Feedback' : 'Post Feedback'}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div style={{ background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center', border: '1px dashed var(--color-border)', marginBottom: '2.5rem' }}>
          <MessageSquare size={28} color="var(--color-secondary-dark)" style={{ margin: '0 auto 0.5rem' }} />
          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Have you attended or participated in this Mela?</h4>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>
            Log in as a Visitor or Kaarigar to rate the event and leave your review.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/login" className="btn btn-primary btn-sm">
              Log In to Rate
            </Link>
            <Link to="/register" className="btn btn-outline btn-sm">
              Create Account
            </Link>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {feedbackData.reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <MessageSquare size={36} color="var(--color-text-muted)" style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
          <h4 style={{ fontSize: '1.1rem', color: 'var(--color-text)' }}>No reviews yet</h4>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Be the first visitor or artisan to leave feedback for this exhibition!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {feedbackData.reviews.map((rev) => (
            <div
              key={rev.id}
              style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1.5rem',
                border: '1px solid var(--color-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-primary-light)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                    {(rev.userName || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{rev.userName}</strong>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          background: rev.userRole === 'kaarigar' ? '#FFF8E7' : '#E8F5E9',
                          color: rev.userRole === 'kaarigar' ? 'var(--color-secondary-dark)' : 'var(--color-success)',
                          textTransform: 'uppercase'
                        }}
                      >
                        {rev.userRole === 'kaarigar' ? 'Kaarigar / Artisan' : 'Visitor'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.15rem', color: '#F59E0B' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={15} fill={rev.rating >= s ? '#F59E0B' : 'none'} color="#F59E0B" />
                    ))}
                  </div>
                  {(currentUser && (currentUser.uid === rev.userId || role === 'admin')) && (
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      title="Delete Review"
                      style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '0.2rem' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: 1.6 }}>
                {rev.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventReviews;
