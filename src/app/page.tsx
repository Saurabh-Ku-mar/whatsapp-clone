'use client';

import { useAuth } from '@/contexts/AuthContext';
import { FaGoogle, FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { signInWithGoogle, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ECE5DD] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#25D366]"></div>
      </div>
    );
  }

  if (user) {
    return <ChatApp />;
  }

  return (
    <div className="min-h-screen bg-[#ECE5DD] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-[#25D366] rounded-full flex items-center justify-center mx-auto mb-4">
            <FaWhatsapp className="text-white text-4xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">WhatsApp</h1>
          <p className="text-gray-600 mb-8">Connect with friends and family</p>
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full bg-[#25D366] text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-[#128C7E] transition-all transform hover:scale-105"
        >
          <FaGoogle className="text-xl" />
          Continue with Google
        </button>

        <p className="text-center text-xs text-gray-500 mt-6">
          By continuing, you agree to our Terms of Service
        </p>
      </motion.div>
    </div>
  );
}

// Import ChatApp component (will be created next)
import ChatApp from '@/components/ChatApp';
