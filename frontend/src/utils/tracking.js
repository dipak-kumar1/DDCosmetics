import api from '../services/api';

// Generate a random session token for guest users
const generateSessionToken = () => {
  return 'guest_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Get or create session token
export const getSessionToken = () => {
  let token = localStorage.getItem('sessionToken');
  if (!token) {
    token = generateSessionToken();
    localStorage.setItem('sessionToken', token);
  }
  return token;
};

// Track user interaction
export const trackAction = async (action, product, timeSpent = 0) => {
  try {
    const sessionToken = getSessionToken();
    const payload = {
      action,
      sessionToken,
      productId: product._id,
      category: product.category,
      timeSpent
    };

    // We don't await this or block the UI, it's a fire-and-forget
    api.post('/recommendations/track', payload).catch(err => {
      // Silently fail or log for analytics
      // console.error('Tracking failed:', err);
    });
  } catch (err) {
    // Failsafe
  }
};
