
import React, { useEffect } from 'react';
import { useCollaborativeSession } from '@/hooks/useCollaborativeSession';
import DocumentHeader from './DocumentHeader';
import Editor from './Editor';

const CollaborativeEditor: React.FC = () => {
  // Get document ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const documentId = urlParams.get('doc') || 'default';
  
  const {
    currentUser,
    users,
    document,
    isLoading,
    updateUserCursor,
    updateDocumentContent,
    updateDocumentTitle
  } = useCollaborativeSession(documentId);

  // Update the browser URL when document changes
  useEffect(() => {
    if (document && document.id !== 'default') {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('doc', document.id);
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [document]);

  const handleContentChange = (content: string) => {
    updateDocumentContent(content);
  };

  const handleTitleChange = (newTitle: string) => {
    updateDocumentTitle(newTitle);
  };

  if (isLoading || !currentUser || !document) {
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
        documentTitle={document.title}
        documentId={document.id}
        onTitleChange={handleTitleChange}
      />
      <Editor
        users={users}
        currentUser={currentUser}
        documentContent={document.content || ''}
        onContentChange={handleContentChange}
        onCursorMove={updateUserCursor}
      />
    </div>
  );
};

export default CollaborativeEditor;
