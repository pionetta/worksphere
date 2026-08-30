-- ============================================================
-- Migration: Add Shared Wallets and Workspaces Collaboration
-- ============================================================

-- 1. Table: wallet_members
CREATE TABLE IF NOT EXISTS public.wallet_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('editor', 'viewer')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    invited_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexing for fast lookups
CREATE INDEX IF NOT EXISTS idx_wallet_members_wallet_id ON public.wallet_members(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_members_user_id ON public.wallet_members(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_members_status ON public.wallet_members(status);
CREATE INDEX IF NOT EXISTS idx_wallet_members_invited_email ON public.wallet_members(invited_email);

-- Enable RLS
ALTER TABLE public.wallet_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wallet members accessible by wallet owner or member"
    ON public.wallet_members
    FOR ALL
    USING (
        auth.uid() = user_id OR
        EXISTS (SELECT 1 FROM public.wallets WHERE wallets.id = wallet_members.wallet_id AND wallets.user_id = auth.uid())
    )
    WITH CHECK (
        auth.uid() = user_id OR
        EXISTS (SELECT 1 FROM public.wallets WHERE wallets.id = wallet_members.wallet_id AND wallets.user_id = auth.uid())
    );

-- Trigger for wallet_members updated_at
CREATE TRIGGER set_wallet_members_updated_at
    BEFORE UPDATE ON public.wallet_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- 2. Table: workspaces
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON public.workspaces(owner_id);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspaces viewable and editable by owner or members"
    ON public.workspaces
    FOR ALL
    USING (
        auth.uid() = owner_id OR
        EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_members.workspace_id = workspaces.id AND workspace_members.user_id = auth.uid() AND workspace_members.status = 'accepted')
    )
    WITH CHECK (
        auth.uid() = owner_id
    );

CREATE TRIGGER set_workspaces_updated_at
    BEFORE UPDATE ON public.workspaces
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- 3. Table: workspace_members
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    invited_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_status ON public.workspace_members(status);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members viewable by workspace owner or member"
    ON public.workspace_members
    FOR ALL
    USING (
        auth.uid() = user_id OR
        EXISTS (SELECT 1 FROM public.workspaces WHERE workspaces.id = workspace_members.workspace_id AND workspaces.owner_id = auth.uid())
    )
    WITH CHECK (
        auth.uid() = user_id OR
        EXISTS (SELECT 1 FROM public.workspaces WHERE workspaces.id = workspace_members.workspace_id AND workspaces.owner_id = auth.uid())
    );

CREATE TRIGGER set_workspace_members_updated_at
    BEFORE UPDATE ON public.workspace_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- 4. Alter tasks table for workspace collaboration
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_workspace_id ON public.tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON public.tasks(assignee_id);


-- 5. Realtime publication
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_members;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.workspaces;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_members;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
