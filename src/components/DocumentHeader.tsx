
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Download, Settings, FileText } from 'lucide-react';
import UserPresence from './UserPresence';

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
  onTitleChange: (title: string) => void;
}

const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  users,
  currentUser,
  documentTitle,
  onTitleChange
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(documentTitle);

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
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm">
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
    </header>
  );
};

export default DocumentHeader;
