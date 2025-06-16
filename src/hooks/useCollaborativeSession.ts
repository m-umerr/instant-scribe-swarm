
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateUniqueUser } from '@/utils/userUtils';
import type { Database } from '@/integrations/supabase/types';

type UserSession = Database['public']['Tables']['user_sessions']['Row'];
type Document = Database['public']['Tables']['documents']['Row'];

interface User {
  id: string;
  name: string;
  color: string;
  cursor: { x: number; y: number };
  lastSeen: number;
}

export const useCollaborativeSession = (documentId: string) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    initializeSession();
    
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
      if (currentUser) {
        cleanupUserSession(currentUser.id);
      }
    };
  }, [documentId]);

  const initializeSession = async () => {
    try {
      // Get or create document
      let { data: doc } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (!doc) {
        if (documentId === 'default') {
          // Get the default document if specific ID not found
          const { data: defaultDoc } = await supabase
            .from('documents')
            .select('*')
            .limit(1)
            .single();
          doc = defaultDoc;
        } else {
          // Create a new document with the specified ID if it doesn't exist
          const { data: newDoc, error } = await supabase
            .from('documents')
            .insert({
              id: documentId,
              title: 'New Shared Document',
              content: '<h1>Welcome to your shared document!</h1><p>Start collaborating by typing here...</p>'
            })
            .select()
            .single();
          
          if (error) {
            console.error('Error creating document:', error);
            // Fallback to default document
            const { data: defaultDoc } = await supabase
              .from('documents')
              .select('*')
              .limit(1)
              .single();
            doc = defaultDoc;
          } else {
            doc = newDoc;
          }
        }
      }

      setDocument(doc);

      // Create user session
      const newUser = generateUniqueUser();
      const userSession = {
        id: newUser.id,
        name: newUser.name,
        color: newUser.color,
        document_id: doc?.id || null,
        cursor_x: 0,
        cursor_y: 0,
        last_seen: new Date().toISOString()
      };

      await supabase.from('user_sessions').insert(userSession);
      
      setCurrentUser({
        id: newUser.id,
        name: newUser.name,
        color: newUser.color,
        cursor: { x: 0, y: 0 },
        lastSeen: Date.now()
      });

      // Load existing users
      await loadUsers();
      
      // Set up real-time subscriptions
      setupRealtimeSubscriptions();
      
      // Set up cleanup for inactive users
      setupUserCleanup();
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing session:', error);
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data: userSessions } = await supabase
        .from('user_sessions')
        .select('*')
        .not('document_id', 'is', null);

      if (userSessions) {
        const formattedUsers = userSessions.map(session => ({
          id: session.id,
          name: session.name,
          color: session.color,
          cursor: { x: session.cursor_x || 0, y: session.cursor_y || 0 },
          lastSeen: new Date(session.last_seen).getTime()
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to user session changes
    const userChannel = supabase
      .channel('user_sessions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_sessions' },
        () => {
          loadUsers();
        }
      )
      .subscribe();

    // Subscribe to document changes
    const docChannel = supabase
      .channel('document_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'documents' },
        (payload) => {
          if (payload.new && payload.new.id === document?.id) {
            setDocument(payload.new as Document);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
      supabase.removeChannel(docChannel);
    };
  };

  const setupUserCleanup = () => {
    const cleanup = async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      await supabase
        .from('user_sessions')
        .delete()
        .lt('last_seen', fiveMinutesAgo);
    };

    // Clean up every minute
    const interval = setInterval(cleanup, 60000);
    return () => clearInterval(interval);
  };

  const updateUserCursor = async (position: { x: number; y: number }) => {
    if (!currentUser) return;

    try {
      await supabase
        .from('user_sessions')
        .update({
          cursor_x: position.x,
          cursor_y: position.y,
          last_seen: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      setCurrentUser(prev => prev ? { ...prev, cursor: position } : null);
    } catch (error) {
      console.error('Error updating cursor:', error);
    }
  };

  const updateDocumentContent = async (content: string) => {
    if (!document) return;

    try {
      await supabase
        .from('documents')
        .update({
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', document.id);
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const updateDocumentTitle = async (title: string) => {
    if (!document) return;

    try {
      await supabase
        .from('documents')
        .update({
          title,
          updated_at: new Date().toISOString()
        })
        .eq('id', document.id);

      setDocument(prev => prev ? { ...prev, title } : null);
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const cleanupUserSession = async (userId: string) => {
    try {
      await supabase
        .from('user_sessions')
        .delete()
        .eq('id', userId);
    } catch (error) {
      console.error('Error cleaning up user session:', error);
    }
  };

  return {
    currentUser,
    users,
    document,
    isLoading,
    updateUserCursor,
    updateDocumentContent,
    updateDocumentTitle
  };
};
