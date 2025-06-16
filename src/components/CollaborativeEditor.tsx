
import React, { useState, useEffect } from 'react';
import { generateUniqueUser } from '@/utils/userUtils';
import DocumentHeader from './DocumentHeader';
import Editor from './Editor';

interface User {
  id: string;
  name: string;
  color: string;
  cursor: { x: number; y: number };
  lastSeen: number;
}

const CollaborativeEditor: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');

  // Initialize current user on component mount
  useEffect(() => {
    const newUser = generateUniqueUser();
    setCurrentUser(newUser);
    setUsers([newUser]);
    
    // Simulate other users joining periodically
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 5 seconds
        const newUser = generateUniqueUser();
        setUsers(prev => [...prev, newUser]);
        
        // Remove user after some time
        setTimeout(() => {
          setUsers(prev => prev.filter(u => u.id !== newUser.id));
        }, Math.random() * 30000 + 10000); // 10-40 seconds
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleContentChange = (content: string) => {
    console.log('Document content updated:', content.length, 'characters');
  };

  const handleCursorMove = (position: { x: number; y: number }) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, cursor: position };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(user => 
        user.id === currentUser.id ? updatedUser : user
      ));
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setDocumentTitle(newTitle);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Joining collaboration session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DocumentHeader
        users={users}
        currentUser={currentUser}
        documentTitle={documentTitle}
        onTitleChange={handleTitleChange}
      />
      <Editor
        users={users}
        currentUser={currentUser}
        onContentChange={handleContentChange}
        onCursorMove={handleCursorMove}
      />
    </div>
  );
};

export default CollaborativeEditor;
