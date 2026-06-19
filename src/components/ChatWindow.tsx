'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDoc } from '@/lib/firebase';
import { FaArrowLeft, FaPaperPlane, FaSmile } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function ChatWindow({ chat, onBack }: any) {
  const { user, userData } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const otherUser = chat.otherUser;

  useEffect(() => {
    if (!chat?.id) return;

    const q = query(
      collection(db, 'chats', chat.id, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messagesData = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const msgData = { id: docSnap.id, ...docSnap.data() };
        if (msgData.senderId && msgData.senderId !== user?.uid && !msgData.senderName) {
          const senderDoc = await getDoc(doc(db, 'users', msgData.senderId));
          if (senderDoc.exists()) msgData.senderName = senderDoc.data().displayName;
        }
        return msgData;
      }));
      
      setMessages(messagesData);
      setLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, [chat, user]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const messageData = {
      content: message.trim(),
      senderId: user?.uid,
      senderName: userData?.displayName || user?.displayName,
      timestamp: serverTimestamp(),
      read: false,
    };

    try {
      await addDoc(collection(db, 'chats', chat.id, 'messages'), messageData);
      await updateDoc(doc(db, 'chats', chat.id), {
        lastMessage: { content: message.trim(), timestamp: new Date(), senderId: user?.uid },
        lastMessageTime: serverTimestamp(),
      });
      setMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#ECE5DD]">
      <div className="bg-[#075E54] text-white px-4 py-3 flex items-center shadow-sm">
        <button onClick={onBack} className="md:hidden p-2 -ml-2 hover:bg-[#128C7E] rounded-full">
          <FaArrowLeft className="text-xl" />
        </button>
        <img src={otherUser?.photoURL || `https://ui-avatars.com/api/?background=25D366&color=fff&name=${otherUser?.displayName?.substring(0, 2) || 'U'}`} alt={otherUser?.displayName} className="w-10 h-10 rounded-full object-cover mx-2" />
        <div>
          <h2 className="font-semibold">{otherUser?.displayName || 'User'}</h2>
          <p className="text-xs text-green-300">{otherUser?.online ? 'Online' : 'Offline'}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#25D366]"></div></div>
        ) : messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${msg.senderId === user?.uid ? 'bg-[#DCF8C6] rounded-br-none' : 'bg-white rounded-bl-none shadow'}`}>
              <p className="break-words text-sm">{msg.content}</p>
              <p className="text-[10px] text-gray-400 text-right mt-1">
                {msg.timestamp?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-gray-200 p-3">
        <div className="flex items-end space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#25D366] text-sm"
          />
          <button onClick={sendMessage} disabled={!message.trim()} className="p-2 bg-[#25D366] text-white rounded-full hover:bg-[#128C7E] transition-colors disabled:opacity-50">
            <FaPaperPlane className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
}
