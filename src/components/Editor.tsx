import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Type
} from 'lucide-react';
import AdvancedToolbar from './AdvancedToolbar';

interface User {
  id: string;
  name: string;
  color: string;
  cursor: { x: number; y: number };
  lastSeen: number;
}

interface EditorProps {
  users: User[];
  currentUser: User;
  documentContent: string;
  onContentChange: (content: string) => void;
  onCursorMove: (position: { x: number; y: number }) => void;
}

const Editor: React.FC<EditorProps> = ({ 
  users, 
  currentUser, 
  documentContent,
  onContentChange, 
  onCursorMove 
}) => {
  const [content, setContent] = useState(documentContent);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const editorRef = useRef<HTMLDivElement>(null);
  const contentUpdateTimeoutRef = useRef<NodeJS.Timeout>();

  // Update local content when document content changes from other users
  useEffect(() => {
    if (documentContent !== content) {
      setContent(documentContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = documentContent;
      }
    }
  }, [documentContent]);

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      
      // Debounce content updates to avoid too many database writes
      if (contentUpdateTimeoutRef.current) {
        clearTimeout(contentUpdateTimeoutRef.current);
      }
      
      contentUpdateTimeoutRef.current = setTimeout(() => {
        onContentChange(newContent);
      }, 500);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = editorRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onCursorMove({ x, y });
    }
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleContentChange();
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    const formats = new Set<string>();
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    setActiveFormats(formats);
  };

  const toolbarButtons = [
    { command: 'bold', icon: Bold, label: 'Bold' },
    { command: 'italic', icon: Italic, label: 'Italic' },
    { command: 'underline', icon: Underline, label: 'Underline' },
    { command: 'justifyLeft', icon: AlignLeft, label: 'Align Left' },
    { command: 'justifyCenter', icon: AlignCenter, label: 'Align Center' },
    { command: 'justifyRight', icon: AlignRight, label: 'Align Right' },
    { command: 'insertUnorderedList', icon: List, label: 'Bullet List' },
    { command: 'insertOrderedList', icon: ListOrdered, label: 'Numbered List' },
    { command: 'formatBlock', icon: Quote, label: 'Quote', value: 'blockquote' },
  ];

  const headingButtons = [
    { command: 'formatBlock', icon: Heading1, label: 'Heading 1', value: 'h1' },
    { command: 'formatBlock', icon: Heading2, label: 'Heading 2', value: 'h2' },
    { command: 'formatBlock', icon: Type, label: 'Paragraph', value: 'p' },
  ];

  const otherUsers = users.filter(user => user.id !== currentUser.id);

  return (
    <div className="flex-1 flex flex-col bg-gray-50/30">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {/* Heading Controls */}
          <div className="flex items-center space-x-1 mr-4 pr-4 border-r">
            {headingButtons.map(({ command, icon: Icon, label, value }) => (
              <Button
                key={`${command}-${value}`}
                variant="ghost"
                size="sm"
                onClick={() => formatText(command, value)}
                className="h-8 w-8 p-0"
                title={label}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          {/* Text Formatting */}
          <div className="flex items-center space-x-1 mr-4 pr-4 border-r">
            {toolbarButtons.map(({ command, icon: Icon, label, value }) => (
              <Button
                key={command}
                variant={activeFormats.has(command) ? "default" : "ghost"}
                size="sm"
                onClick={() => formatText(command, value)}
                className="h-8 w-8 p-0"
                title={label}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          {/* Advanced Toolbar */}
          <AdvancedToolbar onFormatText={formatText} />
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex justify-center py-8">
        <div className="relative w-full max-w-4xl">
          {/* Other users' cursors */}
          {otherUsers.map((user) => (
            <div
              key={user.id}
              className="absolute pointer-events-none z-10 transition-all duration-100"
              style={{
                left: user.cursor.x,
                top: user.cursor.y,
                transform: 'translate(-50%, -100%)'
              }}
            >
              <div 
                className="w-0.5 h-6 mb-1"
                style={{ backgroundColor: user.color }}
              />
              <div 
                className="text-xs text-white px-2 py-1 rounded whitespace-nowrap"
                style={{ backgroundColor: user.color }}
              >
                {user.name}
              </div>
            </div>
          ))}

          {/* Document */}
          <div className="bg-white shadow-lg rounded-lg min-h-[800px] mx-4">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="p-12 outline-none min-h-[800px] prose prose-lg max-w-none"
              style={{ 
                lineHeight: '1.8',
                fontSize: '16px',
                fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'
              }}
              onInput={handleContentChange}
              onMouseMove={handleMouseMove}
              onKeyUp={updateActiveFormats}
              onMouseUp={updateActiveFormats}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
