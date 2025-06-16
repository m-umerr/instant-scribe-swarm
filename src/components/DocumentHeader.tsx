import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Download, Settings, FileText, Copy, Check, FolderOpen, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import UserPresence from './UserPresence';
import DocumentList from './DocumentList';
import ExportDialog from './ExportDialog';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  color: string;
  cursor: { x: number; y: number };
  lastSeen: number;
}

interface DocumentHeaderProps {
  users: User[];
  currentUser: User;
  documentTitle: string;
  documentId: string;
  onTitleChange: (title: string) => void;
  onDocumentSelect: (documentId: string) => void;
  onNewDocument: () => void;
}

const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  users,
  currentUser,
  documentTitle,
  documentId,
  onTitleChange,
  onDocumentSelect,
  onNewDocument
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(documentTitle);
  const [isCopied, setIsCopied] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isDocumentListOpen, setIsDocumentListOpen] = useState(false);

  const handleTitleSave = () => {
    onTitleChange(tempTitle);
    setIsEditingTitle(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTempTitle(documentTitle);
      setIsEditingTitle(false);
    }
  };

  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?doc=${documentId}`;
  };

  const handleShare = async () => {
    const shareLink = generateShareLink();
    
    try {
      await navigator.clipboard.writeText(shareLink);
      setIsCopied(true);
      toast.success('Share link copied to clipboard!');
      
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy link to clipboard');
    }
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg text-primary">CollabEdit</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {isEditingTitle ? (
                <Input
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={handleTitleKeyPress}
                  className="w-64 h-8 text-sm"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="text-lg font-medium hover:bg-accent hover:text-accent-foreground px-2 py-1 rounded transition-colors"
                >
                  {documentTitle}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <UserPresence users={users} currentUser={currentUser} />
            
            <div className="flex items-center space-x-2 border-l pl-4">
              {/* Document Management */}
              <Dialog open={isDocumentListOpen} onOpenChange={setIsDocumentListOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Documents
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Document Management</DialogTitle>
                  </DialogHeader>
                  <DocumentList 
                    onDocumentSelect={(docId) => {
                      onDocumentSelect(docId);
                      setIsDocumentListOpen(false);
                    }}
                    currentDocumentId={documentId}
                  />
                </DialogContent>
              </Dialog>

              {/* New Document */}
              <Button variant="ghost" size="sm" onClick={onNewDocument}>
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>

              {/* Share */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-sm mb-2">Share this document</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        Anyone with this link can view and edit the document
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Input
                        value={generateShareLink()}
                        readOnly
                        className="text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        className="flex-shrink-0"
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Share this link with others to collaborate in real-time
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Export */}
              <Button variant="ghost" size="sm" onClick={() => setIsExportDialogOpen(true)}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        documentTitle={documentTitle}
        documentContent={""} // This will be passed from parent component
      />
    </header>
  );
};

export default DocumentHeader;
