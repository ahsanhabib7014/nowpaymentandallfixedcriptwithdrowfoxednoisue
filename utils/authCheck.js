import jwt from 'jsonwebtoken';
import dbConnect from '@/utils/db';
import User from '@/models/User';
import { cookies } from 'next/headers';

// ==========================================
// ১. পুরনো ফাংশনসমূহ (backward compatibility)
// ==========================================

export function verifyJwtToken(req) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { 
        success: false, 
        message: 'অনুমোদিত নয়! টোকেন পাওয়া যায়নি।' 
      };
    }

    const token = authHeader.split(' ')[1];
    // ✅ Algorithm pinning যোগ করা হলো
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

    return { 
      success: true, 
      userId: decoded.userId, 
      uid: decoded.uid, 
      phone: decoded.phone 
    };

  } catch (error) {
    return { 
      success: false, 
      message: 'টোকেন মেয়াদোত্তীর্ণ বা অবৈধ।' 
    };
  }
}

export async function verifyActiveUser(userIdOrUid) {
  try {
    await dbConnect();
    
    const query = userIdOrUid?.match(/^[0-9a-fA-F]{24}$/) 
      ? { _id: userIdOrUid } 
      : { uid: userIdOrUid };

    const user = await User.findOne(query);
    
    if (!user) {
      return { success: false, message: 'ইউজার পাওয়া যায়নি।' };
    }

    if (user.isBlocked) {
      return { 
        success: false, 
        isBlocked: true, 
        message: 'আপনার অ্যাকাউন্টটি ব্লক থাকায় এই সেবাটি বন্ধ রয়েছে।' 
      };
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, message: 'সার্ভার এরর: ' + error.message };
  }
}


// ==========================================
// ২. HttpOnly কুকি ভিত্তিক অথ হেল্পার (Secure)
// ==========================================

/**
 * শুধুমাত্র HttpOnly `token` কুকি থেকে অথেন্টিকেশন করে।
 * কোনো fallback কুকি ব্যবহার করা হয় না (security-র জন্য)।
 * @param {string} requiredRole - 'user' অথবা 'admin'
 */
export async function verifyAuth(requiredRole = 'user') {
  try {
    await dbConnect();
    const cookieStore = await cookies();

    // ✅ শুধু HttpOnly token কুকি থেকে auth
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { 
        success: false, 
        status: 401, 
        message: 'অনুমোদিত নয়! কোনো বৈধ সেশন কুকি পাওয়া যায়নি।' 
      };
    }

    let decoded;
    try {
      // ✅ Algorithm pinning — downgrade attack প্রতিরোধ
      decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch (err) {
      return { 
        success: false, 
        status: 401, 
        message: 'মেয়াদোত্তীর্ণ বা অবৈধ সেশন টোকেন!' 
      };
    }

    const userId = decoded.userId || decoded.id;
    const userUid = decoded.uid;
    const userPhone = decoded.phone;

    // DB query-র জন্য conditions তৈরি
    const conditions = [];
    if (userId) conditions.push({ _id: userId });
    if (userUid) conditions.push({ uid: userUid });
    if (userPhone) conditions.push({ phone: userPhone });

    if (conditions.length === 0) {
      return { 
        success: false, 
        status: 401, 
        message: 'টোকেনে কোনো বৈধ ইউজার আইডি নেই!' 
      };
    }

    // DB থেকে রিয়েল-টাইম ইউজার
    const dbUser = await User.findOne({ $or: conditions }).lean();

    if (!dbUser) {
      return { 
        success: false, 
        status: 401, 
        message: 'ইউজার ডাটাবেজে খুঁজে পাওয়া যায়নি।' 
      };
    }

    if (dbUser.isBlocked === true) {
      return { 
        success: false, 
        status: 403, 
        message: 'আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে।' 
      };
    }

    if (requiredRole === 'admin' && dbUser.role !== 'admin') {
      return { 
        success: false, 
        status: 403, 
        message: 'প্রবেশাধিকার নিষিদ্ধ! আপনার অ্যাডমিন পারমিশন নেই।' 
      };
    }

    return { success: true, user: dbUser };

  } catch (error) {
    console.error('Auth verification error:', error);
    return { 
      success: false, 
      status: 401, 
      message: 'মেয়াদোত্তীর্ণ বা অবৈধ সেশন টোকেন!' 
    };
  }
}