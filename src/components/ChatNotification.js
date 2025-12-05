import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Snackbar, Alert } from '@mui/material';
import { Chat } from '@mui/icons-material';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';

const ChatNotification = ({ onChatOpen }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [newMessage, setNewMessage] = useState(null);

  useEffect(() => {
    if (!user) return;

    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageTime', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalUnread = 0;
      let latestMessage = null;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const userUnread = data.unreadCount?.[user.uid] || 0;
        totalUnread += userUnread;

        if (userUnread > 0 && (!latestMessage || data.lastMessageTime > latestMessage.time)) {
          latestMessage = {
            text: data.lastMessage,
            time: data.lastMessageTime,
            sender: data.participantNames?.[data.participants.find(p => p !== user.uid)]
          };
        }
      });

      setUnreadCount(totalUnread);
      
      if (latestMessage && latestMessage.text !== newMessage?.text) {
        setNewMessage(latestMessage);
      }
    });

    return unsubscribe;
  }, [user, newMessage?.text]);

  return (
    <>
      <IconButton color="inherit" onClick={onChatOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <Chat />
        </Badge>
      </IconButton>

      <Snackbar
        open={!!newMessage}
        autoHideDuration={4000}
        onClose={() => setNewMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="info" onClose={() => setNewMessage(null)}>
          <strong>{newMessage?.sender}:</strong> {newMessage?.text}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ChatNotification;