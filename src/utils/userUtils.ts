
const adjectives = [
  'Swift', 'Bright', 'Clever', 'Bold', 'Wise', 'Quick', 'Sharp', 'Creative',
  'Dynamic', 'Energetic', 'Focused', 'Gentle', 'Happy', 'Inspired', 'Joyful',
  'Kind', 'Lively', 'Mindful', 'Noble', 'Optimistic', 'Peaceful', 'Radiant',
  'Serene', 'Thoughtful', 'Vibrant', 'Zealous', 'Agile', 'Brilliant', 'Calm'
];

const nouns = [
  'Writer', 'Editor', 'Scribe', 'Author', 'Poet', 'Novelist', 'Journalist',
  'Composer', 'Creator', 'Thinker', 'Dreamer', 'Visionary', 'Innovator',
  'Builder', 'Maker', 'Designer', 'Architect', 'Planner', 'Strategist',
  'Explorer', 'Pioneer', 'Navigator', 'Guide', 'Mentor', 'Teacher', 'Scholar'
];

const colors = [
  '#3B82F6', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B', '#EC4899',
  '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
];

export const generateUniqueUser = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const id = Math.random().toString(36).substr(2, 9);
  
  return {
    id,
    name: `${adjective} ${noun}`,
    color,
    cursor: { x: 0, y: 0 },
    lastSeen: Date.now()
  };
};

export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
};
