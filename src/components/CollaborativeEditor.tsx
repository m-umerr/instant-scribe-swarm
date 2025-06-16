import React, { useEffect, useState } from 'react';
import { useCollaborativeSession } from '@/hooks/useCollaborativeSession';
import { supabase } from '@/integrations/supabase/client';
import DocumentHeader from './DocumentHeader';
import Editor from './Editor';
import ExportDialog from './ExportDialog';
import { toast } from 'sonner';

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

  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

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

  const handleDocumentSelect = (newDocumentId: string) => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('doc', newDocumentId);
    window.location.href = newUrl.toString();
  };

  const handleNewDocument = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: 'New Document',
          content: '<h1>New Document</h1><p>Start writing here...</p>'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating document:', error);
        toast.error('Failed to create document');
        return;
      }

      toast.success('New document created!');
      handleDocumentSelect(data.id);
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Failed to create document');
    }
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
        onDocumentSelect={handleDocumentSelect}
        onNewDocument={handleNewDocument}
      />
      <Editor
        users={users}
        currentUser={currentUser}
        documentContent={document.content || ''}
        onContentChange={handleContentChange}
        onCursorMove={updateUserCursor}
      />
      
      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        documentTitle={document.title}
        documentContent={document.content || ''}
      />
    </div>
  );
};

export default CollaborativeEditor;
