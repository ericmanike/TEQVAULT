-- ===============================================================
-- SUPABASE DATABASE SCHEMA & RLS POLICIES FOR USER FEEDBACKS
-- (CUSTOMER & VISITOR FEEDBACK SYSTEM)
-- ===============================================================

-- 1. Create feedbacks table
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT,
    email TEXT,
    phone TEXT,
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    category VARCHAR(50) NOT NULL DEFAULT 'General',
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'in_progress', 'resolved', 'archived')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create indexes for quick admin queries and filtering
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON public.feedbacks(status);
CREATE INDEX IF NOT EXISTS idx_feedbacks_rating ON public.feedbacks(rating);
CREATE INDEX IF NOT EXISTS idx_feedbacks_category ON public.feedbacks(category);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON public.feedbacks(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- 4. Clean up existing RLS policies
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedbacks;
DROP POLICY IF EXISTS "Users can view own feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Admins view all feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Admins update all feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Admins delete all feedbacks" ON public.feedbacks;

-- ===============================================================
-- RLS POLICIES
-- ===============================================================

-- 5. Submission Policy: Anyone (authenticated customers or guest visitors) can submit feedback
CREATE POLICY "Anyone can submit feedback"
ON public.feedbacks
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 6. Customer Policy: Authenticated users can view their own feedbacks
CREATE POLICY "Users can view own feedbacks"
ON public.feedbacks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 7. Admin Policy: Admin can view ALL feedbacks
CREATE POLICY "Admins view all feedbacks"
ON public.feedbacks
FOR SELECT
TO authenticated
USING (
    LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com')
);

-- 8. Admin Policy: Admin can update feedback status and notes
CREATE POLICY "Admins update all feedbacks"
ON public.feedbacks
FOR UPDATE
TO authenticated
USING (
    LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com')
);

-- 9. Admin Policy: Admin can delete feedbacks
CREATE POLICY "Admins delete all feedbacks"
ON public.feedbacks
FOR DELETE
TO authenticated
USING (
    LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com')
);

-- 10. Trigger for automatic updated_at timestamp updates
CREATE OR REPLACE FUNCTION update_feedbacks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_feedbacks_updated_at ON public.feedbacks;
CREATE TRIGGER trigger_feedbacks_updated_at
BEFORE UPDATE ON public.feedbacks
FOR EACH ROW
EXECUTE FUNCTION update_feedbacks_updated_at();
