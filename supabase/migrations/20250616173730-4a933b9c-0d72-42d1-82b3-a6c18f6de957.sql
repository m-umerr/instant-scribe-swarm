
-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  content TEXT DEFAULT '<p>Start typing your document here...</p>',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user sessions table for tracking anonymous users
CREATE TABLE public.user_sessions (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  cursor_x INTEGER DEFAULT 0,
  cursor_y INTEGER DEFAULT 0,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create document operations table for operational transformation
CREATE TABLE public.document_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  user_session_id TEXT REFERENCES public.user_sessions(id) ON DELETE CASCADE NOT NULL,
  operation JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (but make everything public since no auth)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_operations ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for everyone (no auth required)
CREATE POLICY "Anyone can view documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Anyone can create documents" ON public.documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update documents" ON public.documents FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete documents" ON public.documents FOR DELETE USING (true);

CREATE POLICY "Anyone can view user sessions" ON public.user_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can create user sessions" ON public.user_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update user sessions" ON public.user_sessions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete user sessions" ON public.user_sessions FOR DELETE USING (true);

CREATE POLICY "Anyone can view operations" ON public.document_operations FOR SELECT USING (true);
CREATE POLICY "Anyone can create operations" ON public.document_operations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update operations" ON public.document_operations FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete operations" ON public.document_operations FOR DELETE USING (true);

-- Enable realtime for all tables
ALTER TABLE public.documents REPLICA IDENTITY FULL;
ALTER TABLE public.user_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.document_operations REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_operations;

-- Create a default document
INSERT INTO public.documents (title, content) 
VALUES ('Welcome Document', '<h1>Welcome to CollabEdit!</h1><p>This is a collaborative document editor. Multiple users can edit this document simultaneously and see each other''s changes in real-time.</p><p>Start typing to see the collaboration in action!</p>');
