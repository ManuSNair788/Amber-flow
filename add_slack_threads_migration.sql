-- 1. Create slack_threads table
CREATE TABLE public.slack_threads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    slack_channel_id TEXT,
    slack_thread_ts TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'open',
    followup_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Modify approvals table
ALTER TABLE public.approvals ADD COLUMN slack_thread_id UUID REFERENCES public.slack_threads(id) ON DELETE SET NULL;
ALTER TABLE public.approvals ADD COLUMN rejection_reason TEXT;
ALTER TABLE public.approvals ADD COLUMN is_followup BOOLEAN DEFAULT false;
ALTER TABLE public.approvals ADD COLUMN followup_number INTEGER;

-- 3. RLS for slack_threads
ALTER TABLE public.slack_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to authenticated users" ON public.slack_threads FOR ALL TO authenticated USING (true);
