'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatApp() {
  const { userData } = useAuth();
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-[#ECE5DD] overflow-hidden">
      <div className={`${isMobile && selectedChat ? 'hidden' : 'flex'} w-full md:w-96 bg-white flex-col border-r border-gray-200`}>
        <Sidebar onSelectChat={setSelectedChat} selectedChat={selectedChat} />
      </div>

      <AnimatePresence mode="wait">
        {selectedChat ? (
          <motion.div 
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`${isMobile ? 'fixed inset-0 z-50' : 'flex-1'} bg-[#ECE5DD] flex flex-col`}
          >
            <ChatWindow chat={selectedChat} onBack={() => setSelectedChat(null)} />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 hidden md:flex items-center justify-center bg-[#ECE5DD]"
          >
            <div className="text-center">
              <div className="w-24 h-24 bg-[#25D366] rounded-full flex items-center justify-center mx-auto mb-4">
                <FaWhatsapp className="text-white text-5xl" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-600">WhatsApp</h2>
              <p className="text-gray-500 mt-2">Select a chat to start messaging</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { FaWhatsapp } from 'react-icons/fa';
