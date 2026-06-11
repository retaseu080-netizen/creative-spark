CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resale_id UUID REFERENCES public.resale_settings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'operator')),
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their resale team members" 
ON public.team_members 
FOR ALL 
TO authenticated 
USING (resale_id = auth.uid()) 
WITH CHECK (resale_id = auth.uid());

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_team_members_updated_at 
BEFORE UPDATE ON public.team_members 
FOR EACH ROW 
EXECUTE FUNCTION public.update_updated_at_column();
