-- ==========================================
-- POAI Database Schema & Initial Mock Data
-- ==========================================

-- 1. Create Tables
CREATE TABLE public.users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user'
);

CREATE TABLE public.partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    whatsapp_number TEXT,
    whatsapp_group_id TEXT
);

CREATE TABLE public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prospect_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'New',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    status TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;

-- 3. Create Basic RLS Policies (For MVP: Allow all authenticated users to read/write)
-- Note: In a production app, you would lock these down to specific roles.
CREATE POLICY "Allow all access to authenticated users" ON public.users FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON public.partners FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON public.students FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON public.activities FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON public.approvals FOR ALL TO authenticated USING (true);

-- 4. Seed Mock Data
-- Insert Mock Partners
INSERT INTO public.partners (name) VALUES 
    ('Leap Scholar'), 
    ('AECC'), 
    ('IDP'), 
    ('Crizac');

-- Insert Mock Students (Fetching the partner IDs dynamically)
DO $$
DECLARE
    leap_id UUID;
    aecc_id UUID;
    idp_id UUID;
    crizac_id UUID;
    rahul_id UUID;
    priya_id UUID;
    aman_id UUID;
    sneha_id UUID;
    karan_id UUID;
BEGIN
    SELECT id INTO leap_id FROM public.partners WHERE name = 'Leap Scholar';
    SELECT id INTO aecc_id FROM public.partners WHERE name = 'AECC';
    SELECT id INTO idp_id FROM public.partners WHERE name = 'IDP';
    SELECT id INTO crizac_id FROM public.partners WHERE name = 'Crizac';

    INSERT INTO public.students (id, prospect_id, name, partner_id, status, notes) VALUES 
        (gen_random_uuid(), '812341', 'Rahul Sharma', leap_id, 'DNP', 'DNP after 3 attempts. Please continue follow-up.') RETURNING id INTO rahul_id;
    INSERT INTO public.students (id, prospect_id, name, partner_id, status, notes) VALUES 
        (gen_random_uuid(), '812342', 'Priya Nair', aecc_id, 'Interested', 'Looking for Fall 2026 intake in Canada.') RETURNING id INTO priya_id;
    INSERT INTO public.students (id, prospect_id, name, partner_id, status, notes) VALUES 
        (gen_random_uuid(), '812343', 'Aman Verma', idp_id, 'Deposit Pending', 'Waiting for loan approval.') RETURNING id INTO aman_id;
    INSERT INTO public.students (id, prospect_id, name, partner_id, status, notes) VALUES 
        (gen_random_uuid(), '812344', 'Sneha Kapoor', leap_id, 'Call Back', 'Call back tomorrow at 5 PM.') RETURNING id INTO sneha_id;
    INSERT INTO public.students (id, prospect_id, name, partner_id, status, notes) VALUES 
        (gen_random_uuid(), '812345', 'Karan Mehta', crizac_id, 'Visa Documents', 'Missing financial transcripts.') RETURNING id INTO karan_id;

    -- Insert Mock Activities
    INSERT INTO public.activities (student_id, action, status) VALUES 
        (rahul_id, 'Added to queue', 'DNP'),
        (priya_id, 'Message sent', 'Interested'),
        (aman_id, 'Added to queue', 'Deposit Pending');

    -- Insert Mock Approvals
    INSERT INTO public.approvals (student_id, message, status) VALUES 
        (rahul_id, 'Hi Team, Student Rahul Sharma (Prospect ID: 812341) has been marked as DNP after multiple contact attempts. Kindly continue follow-up from your side.', 'pending'),
        (priya_id, 'Hi Team, Priya Nair is highly interested for Fall 2026. Please share the course brochures.', 'approved'),
        (aman_id, 'Hi Team, Aman Verma is awaiting loan approval. Please hold the deposit deadline for 3 days.', 'pending');
END $$;
