CREATE TABLE public.resale_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resale_name TEXT,
    pix_key TEXT,
    beneficiary_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.resale_settings TO authenticated;
GRANT ALL ON public.resale_settings TO service_role;

ALTER TABLE public.resale_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own resale settings" ON public.resale_settings
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE TRIGGER update_resale_settings_updated_at BEFORE UPDATE ON public.resale_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add resale_id to clients to link them to a specific resale
ALTER TABLE public.clients ADD COLUMN resale_id UUID REFERENCES public.resale_settings(id);
