import apiService from './api';

class GoogleAuthService {
  // Load Google API script
  loadGoogleScript() {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Initialize Google Sign-In
  async initializeGoogleSignIn() {
    try {
      await this.loadGoogleScript();
      
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw new Error('Google Client ID not configured');
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: this.handleGoogleSignIn.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      return true;
    } catch (error) {
      console.error('Google Sign-In initialization failed:', error);
      return false;
    }
  }

  // Handle Google Sign-In response
  async handleGoogleSignIn(response) {
    try {
      const result = await apiService.post('/google/login', {
        googleToken: response.credential
      });

      if (result.success) {
        // Store token
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Emit custom event for auth context
        window.dispatchEvent(new CustomEvent('googleSignInSuccess', {
          detail: { user: result.user, token: result.token }
        }));

        return { success: true, user: result.user, token: result.token };
      } else {
        throw new Error(result.message || 'Google sign-in failed');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  // Render Google Sign-In button
  renderGoogleButton(elementId, options = {}) {
    const defaultOptions = {
      type: 'standard',
      shape: 'rectangular',
      theme: 'outline',
      text: 'signin_with',
      size: 'large',
      logo_alignment: 'left',
      width: 300
    };

    const buttonOptions = { ...defaultOptions, ...options };

    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.renderButton(
        document.getElementById(elementId),
        buttonOptions
      );
    } else {
      console.error('Google API not loaded');
    }
  }

  // Show Google Sign-In popup
  showGoogleSignIn() {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.prompt();
    } else {
      console.error('Google API not loaded');
    }
  }

  // Get Google Auth URL (for server-side flow)
  async getGoogleAuthUrl() {
    try {
      const response = await apiService.get('/google/auth-url');
      return response.authUrl;
    } catch (error) {
      console.error('Failed to get Google auth URL:', error);
      throw error;
    }
  }

  // Link Google account to existing user
  async linkGoogleAccount(googleToken) {
    try {
      const result = await apiService.post('/google/link', {
        googleToken
      });

      if (result.success) {
        // Update stored user data
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...result.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        return { success: true, user: result.user };
      } else {
        throw new Error(result.message || 'Failed to link Google account');
      }
    } catch (error) {
      console.error('Link Google account error:', error);
      throw error;
    }
  }

  // Unlink Google account
  async unlinkGoogleAccount() {
    try {
      const result = await apiService.post('/google/unlink');

      if (result.success) {
        // Update stored user data
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...result.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        return { success: true, user: result.user };
      } else {
        throw new Error(result.message || 'Failed to unlink Google account');
      }
    } catch (error) {
      console.error('Unlink Google account error:', error);
      throw error;
    }
  }

  // Check if user has Google account linked
  hasGoogleLinked() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.authProvider === 'google' || user.authProvider === 'hybrid' || !!user.googleId;
  }

  // Get user's auth provider
  getAuthProvider() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.authProvider || 'local';
  }

  // Sign out from Google (optional)
  googleSignOut() {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }

  // Validate Google token (for debugging)
  async validateGoogleToken(token) {
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token}`);
      const userInfo = await response.json();
      return userInfo;
    } catch (error) {
      console.error('Token validation failed:', error);
      return null;
    }
  }
}

const googleAuthService = new GoogleAuthService();
export default googleAuthService;
