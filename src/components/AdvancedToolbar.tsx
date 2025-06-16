
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Palette, 
  Link, 
  Unlink, 
  Table, 
  ImageIcon,
  Type,
  Minus
} from 'lucide-react';

interface AdvancedToolbarProps {
  onFormatText: (command: string, value?: string) => void;
}

const AdvancedToolbar: React.FC<AdvancedToolbarProps> = ({ onFormatText }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB'
  ];

  const fontSizes = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px'];

  const insertTable = () => {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    
    if (rows && cols) {
      let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%;">';
      for (let i = 0; i < parseInt(rows); i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
          tableHTML += '<td style="padding: 8px; border: 1px solid #ccc;">Cell</td>';
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</table><p></p>';
      
      onFormatText('insertHTML', tableHTML);
    }
  };

  const insertLink = () => {
    if (linkUrl.trim()) {
      const selectedText = window.getSelection()?.toString() || 'Link';
      onFormatText('insertHTML', `<a href="${linkUrl}" target="_blank">${selectedText}</a>`);
      setLinkUrl('');
      setIsLinkPopoverOpen(false);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      onFormatText('insertHTML', `<img src="${url}" alt="Image" style="max-width: 100%; height: auto;" />`);
    }
  };

  const insertHorizontalRule = () => {
    onFormatText('insertHTML', '<hr style="margin: 1rem 0;" />');
  };

  return (
    <div className="flex items-center space-x-1 border-l pl-4">
      {/* Font Size */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Type className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-32 p-2">
          <div className="grid grid-cols-2 gap-1">
            {fontSizes.map((size) => (
              <Button
                key={size}
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => onFormatText('fontSize', size.replace('px', ''))}
              >
                {size}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Text Color */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="grid grid-cols-5 gap-1">
            {colors.map((color) => (
              <Button
                key={color}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                style={{ backgroundColor: color }}
                onClick={() => onFormatText('foreColor', color)}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Link */}
      <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Link className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3">
          <div className="space-y-2">
            <Input
              placeholder="Enter URL..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && insertLink()}
            />
            <Button onClick={insertLink} size="sm" className="w-full">
              Insert Link
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Unlink */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onFormatText('unlink')}
      >
        <Unlink className="h-4 w-4" />
      </Button>

      {/* Table */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={insertTable}
      >
        <Table className="h-4 w-4" />
      </Button>

      {/* Image */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={insertImage}
      >
        <ImageIcon className="h-4 w-4" />
      </Button>

      {/* Horizontal Rule */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={insertHorizontalRule}
      >
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AdvancedToolbar;
