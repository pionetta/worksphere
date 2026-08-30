-- Migration: Add habits and habit_logs tables with RLS and realtime replication

-- 1. Create habits table
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '🎯',
    color TEXT DEFAULT '#4F46E5',
    frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'custom')),
    target_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7],
    target_per_day INTEGER DEFAULT 1,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create habit_logs table
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    completed_date DATE NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_habit_log_per_day UNIQUE (user_id, habit_id, completed_date)
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_is_archived ON public.habits(is_archived);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_habit_date ON public.habit_logs(user_id, habit_id, completed_date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_completed_date ON public.habit_logs(completed_date);

-- 4. Enable RLS
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for habits
CREATE POLICY "Users can manage their own habits"
    ON public.habits
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all habits"
    ON public.habits
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 6. RLS Policies for habit_logs
CREATE POLICY "Users can manage their own habit logs"
    ON public.habit_logs
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all habit logs"
    ON public.habit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 7. Add updated_at trigger
CREATE OR REPLACE TRIGGER set_habits_updated_at
    BEFORE UPDATE ON public.habits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER set_habit_logs_updated_at
    BEFORE UPDATE ON public.habit_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Add to Realtime publication
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.habits;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.habit_logs;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
