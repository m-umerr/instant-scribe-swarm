
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/utils/userUtils';

interface User {
  id: string;
  name: string;
  color: string;
  cursor: { x: number; y: number };
  lastSeen: number;
}

interface UserPresenceProps {
  users: User[];
  currentUser: User;
}

const UserPresence: React.FC<UserPresenceProps> = ({ users, currentUser }) => {
  const otherUsers = users.filter(user => user.id !== currentUser.id);
  
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground mr-2">
        {users.length} {users.length === 1 ? 'user' : 'users'} online
      </span>
      <div className="flex -space-x-2">
        {users.slice(0, 5).map((user) => (
          <Avatar
            key={user.id}
            className="w-8 h-8 border-2 border-background transition-transform hover:scale-110"
            style={{ borderColor: user.color }}
          >
            <AvatarFallback 
              className="text-xs font-medium text-white"
              style={{ backgroundColor: user.color }}
            >
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        ))}
        {users.length > 5 && (
          <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground">
              +{users.length - 5}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPresence;
