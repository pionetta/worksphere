-- ============================================================================
-- WorkSphere - Enable Supabase Realtime Replication for All Entities
-- ============================================================================

-- Ensure supabase_realtime publication exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Add all WorkSphere application tables to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE subtasks;
ALTER PUBLICATION supabase_realtime ADD TABLE wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE budgets;
ALTER PUBLICATION supabase_realtime ADD TABLE savings_goals;
ALTER PUBLICATION supabase_realtime ADD TABLE debts;
ALTER PUBLICATION supabase_realtime ADD TABLE members;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;

-- Set REPLICA IDENTITY FULL for detailed change logs
ALTER TABLE profiles REPLICA IDENTITY FULL;
ALTER TABLE tasks REPLICA IDENTITY FULL;
ALTER TABLE subtasks REPLICA IDENTITY FULL;
ALTER TABLE wallets REPLICA IDENTITY FULL;
ALTER TABLE categories REPLICA IDENTITY FULL;
ALTER TABLE transactions REPLICA IDENTITY FULL;
ALTER TABLE budgets REPLICA IDENTITY FULL;
ALTER TABLE savings_goals REPLICA IDENTITY FULL;
ALTER TABLE debts REPLICA IDENTITY FULL;
ALTER TABLE members REPLICA IDENTITY FULL;
ALTER TABLE attendance REPLICA IDENTITY FULL;
