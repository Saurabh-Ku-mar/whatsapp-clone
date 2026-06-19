'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, collection, query, where, onSnapshot, orderBy, doc, getDoc, setDoc, updateDoc, serverTimestamp } from '@/lib/firebase';
import { FaSearch, FaSignOutAlt, FaUserPlus, FaComments, FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface UserType {
  uid: string;
  displayName: string;
  photoURL: string;
  online: boolean;
  email: string;
}

export default function Sidebar({ onSelectChat, selectedChat }: any) {
  const { user, logout, userData } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [chats, setChats] = useState<any[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'users'), where('uid', '!=', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserType));
      setUsers(usersList);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageTime', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsList = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const chatData = docSnap.data();
        const otherUserId = chatData.participants.find((id: string) => id !== user.uid);
        const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
        const otherUser = otherUserDoc.exists() ? otherUserDoc.data() : null;
        return { id: docSnap.id, ...chatData, otherUser, otherUserId };
      }));
      setChats(chatsList);
    });

    return () => unsubscribe();
  }, [user]);

  const startChat = async (selectedUser: UserType) => {
    const existingChat = chats.find(chat => chat.otherUserId === selectedUser.uid);
    if (existingChat) {
      onSelectChat(existingChat);
      setShowNewChat(false);
      return;
    }

    const chatId = [user!.uid, selectedUser.uid].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);
    await setDoc(chatRef, {
      participants: [user!.uid, selectedUser.uid],
      lastMessageTime: serverTimestamp(),
      createdAt: serverTimestamp(),
    }, { merge: true });

    onSelectChat({ id: chatId, participants: [user!.uid, selectedUser.uid], otherUser: selectedUser, otherUserId: selectedUser.uid });
    setShowNewChat(false);
    toast.success(`Started chat with ${selectedUser.displayName}`);
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 bg-[#075E54] text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={userData?.photoURL || `https://ui-avatars.com/api/?background=25D366&color=fff&name=${userData?.displayName?.substring(0, 2) || 'U'}`} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
          <h2 className="font-semibold text-white">{userData?.displayName}</h2>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setShowNewChat(!showNewChat)} className="p-2 hover:bg-[#128C7E] rounded-full transition-colors">
            <FaUserPlus className="text-xl" />
          </button>
          <button onClick={logout} className="p-2 hover:bg-[#128C7E] rounded-full transition-colors">
            <FaSignOutAlt className="text-xl" />
          </button>
        </div>
      </div>

      <div className="p-3 bg-[#F0F0F0] border-b border-gray-200">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#25D366] text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {showNewChat && (
          <div className="p-4 bg-[#F0F0F0] border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">New Chat</h3>
            {filteredUsers.map((u) => (
              <div key={u.uid} onClick={() => startChat(u)} className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                <img src={u.photoURL} alt={u.displayName} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 text-sm">{u.displayName}</h3>
                  <p className="text-xs text-gray-500">{u.online ? 'Online' : 'Offline'}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {chats.map((chat) => (
          <div key={chat.id} onClick={() => onSelectChat(chat)} className={`flex items-center space-x-3 p-4 hover:bg-[#F0F0F0] cursor-pointer transition-colors ${selectedChat?.id === chat.id ? 'bg-[#E8F5E9]' : ''}`}>
            <img src={chat.otherUser?.photoURL || `https://ui-avatars.com/api/?background=25D366&color=fff&name=${chat.otherUser?.displayName?.substring(0, 2) || 'U'}`} alt={chat.otherUser?.displayName} className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800">{chat.otherUser?.displayName || 'User'}</h3>
              <p className="text-sm text-gray-500 truncate">{chat.lastMessage?.content || 'Tap to start chatting'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
