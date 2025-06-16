
import React from 'react';
import { useCollaborativeSession } from '@/hooks/useCollaborativeSession';
import DocumentHeader from './DocumentHeader';
import Editor from './Editor';

const CollaborativeEditor: React.FC = () => {
  // Use the first document for now - you could get this from URL params
  const documentId = 'default';
  
  const {
    currentUser,
    users,
    document,
    isLoading,
    updateUserCursor,
    updateDocumentContent,
    updateDocumentTitle
  } = useCollaborativeSession(documentId);

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
