/**
 * Firebase Phone Auth 2FA Verification Controller
 * Handles Firebase token verification and session creation
 */

const admin = require('firebase-admin');
const { User } = require('../models');
const { AuthService, AUTH_ERROR_CODES } = require('../services');

const firebaseAuthController = {
  /**
   * Verify Firebase 2FA token and create app session
   * POST /api/auth/verify-firebase-2fa
   */
  verifyFirebase2FA: async (req, res) => {
    try {
      const { idToken, phoneNumber, firebaseUid, email } = req.body;

      console.log('🔐 Verifying Firebase 2FA token:', { phoneNumber, firebaseUid });

      // Validate input
      if (!idToken || !phoneNumber || !firebaseUid) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: idToken, phoneNumber, firebaseUid'
        });
      }

      // ✅ STEP 1: VERIFY FIREBASE ID TOKEN
      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log('✅ Firebase token verified:', decodedToken.uid);
      } catch (error) {
        console.error('❌ Firebase token verification failed:', error);
        return res.status(401).json({
          success: false,
          code: 'INVALID_FIREBASE_TOKEN',
          message: 'Invalid or expired Firebase token'
        });
      }

      // ✅ STEP 2: VERIFY TOKEN MATCHES FIREBASE UID
      if (decodedToken.uid !== firebaseUid) {
        console.error('❌ Firebase UID mismatch');
        return res.status(401).json({
          success: false,
          code: 'FIREBASE_UID_MISMATCH',
          message: 'Firebase UID does not match'
        });
      }

      // ✅ STEP 3: FIND OR CREATE USER IN DATABASE
      let user = await User.findOne({
        $or: [
          { phone: phoneNumber },
          { firebaseUid: firebaseUid }
        ]
      });

      if (!user) {
        // Create new user if doesn't exist
        console.log('📝 Creating new user from Firebase 2FA');
        
        user = new User({
          email: email || `firebase_${firebaseUid}@apna-decoration.local`,
          phone: phoneNumber,
          firebaseUid: firebaseUid,
          name: decodedToken.name || 'Firebase User',
          authProvider: 'firebase',
          role: 'user',
          isEmailVerified: !!email,
          lastLogin: new Date(),
          twoFactorEnabled: true // Mark as 2FA user
        });

        await user.save();
        console.log('✅ New user created:', user._id);
      } else {
        // Update existing user
        console.log('📝 Updating existing user from Firebase 2FA');
        
        user.firebaseUid = user.firebaseUid || firebaseUid;
        user.phone = phoneNumber;
        user.lastLogin = new Date();
        user.twoFactorEnabled = true;
        
        if (email && !user.email) {
          user.email = email;
        }

        await user.save();
        console.log('✅ User updated:', user._id);
      }

      // ✅ STEP 4: GENERATE APP JWT TOKEN
      const token = AuthService.generateToken(user);

      console.log('✅ Session created for user:', user._id);

      // ✅ STEP 5: RETURN SUCCESS RESPONSE
      res.json({
        success: true,
        message: 'Firebase 2FA verification successful',
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            firebaseUid: user.firebaseUid,
            role: user.role,
            twoFactorEnabled: user.twoFactorEnabled,
            lastLogin: user.lastLogin
          }
        }
      });

    } catch (error) {
      console.error('❌ Error verifying Firebase 2FA:', error);
      res.status(500).json({
        success: false,
        code: AUTH_ERROR_CODES.SERVER_ERROR,
        message: error.message || 'Firebase verification failed'
      });
    }
  },

  /**
   * Link existing email user to Firebase phone auth
   * POST /api/auth/link-firebase-phone
   * Protected endpoint - user must be logged in
   */
  linkFirebasePhone: async (req, res) => {
    try {
      const { firebaseUid, phoneNumber } = req.body;
      const userId = req.user.userId;

      if (!firebaseUid || !phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: firebaseUid, phoneNumber'
        });
      }

      // Find and update user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      user.firebaseUid = firebaseUid;
      user.phone = phoneNumber;
      user.twoFactorEnabled = true;
      await user.save();

      res.json({
        success: true,
        message: 'Firebase phone authentication linked successfully',
        data: { user }
      });

    } catch (error) {
      console.error('Error linking Firebase phone:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to link Firebase phone'
      });
    }
  }
};

module.exports = firebaseAuthController;
