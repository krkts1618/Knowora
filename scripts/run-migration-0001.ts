import pg from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function runSearchAndTriggersMigration() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Neon database for triggers & search setup...');

    await client.query(`
      -- 1. Enable pg_trgm extension
      CREATE EXTENSION IF NOT EXISTS "pg_trgm";

      -- 2. Trigram & Full-Text Search Indexes
      CREATE INDEX IF NOT EXISTS "folders_name_trgm_idx" ON "folders" USING gin ("name" gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS "documents_title_trgm_idx" ON "documents" USING gin ("title" gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS "topics_title_trgm_idx" ON "topics" USING gin ("title" gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS "tags_name_trgm_idx" ON "tags" USING gin ("name" gin_trgm_ops);

      CREATE INDEX IF NOT EXISTS "documents_fts_idx" ON "documents" USING gin (to_tsvector('english', coalesce("title", '') || ' ' || coalesce("description", '')));
      CREATE INDEX IF NOT EXISTS "topics_fts_idx" ON "topics" USING gin (to_tsvector('english', coalesce("title", '') || ' ' || coalesce("plain_text", '')));

      -- 3. Automatic updated_at Trigger Function
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Apply updated_at trigger to relevant tables
      DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
      CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS trg_user_preferences_updated_at ON user_preferences;
      CREATE TRIGGER trg_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS trg_folders_updated_at ON folders;
      CREATE TRIGGER trg_folders_updated_at BEFORE UPDATE ON folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS trg_documents_updated_at ON documents;
      CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS trg_topics_updated_at ON topics;
      CREATE TRIGGER trg_topics_updated_at BEFORE UPDATE ON topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS trg_extraction_drafts_updated_at ON extraction_drafts;
      CREATE TRIGGER trg_extraction_drafts_updated_at BEFORE UPDATE ON extraction_drafts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS trg_extraction_draft_nodes_updated_at ON extraction_draft_nodes;
      CREATE TRIGGER trg_extraction_draft_nodes_updated_at BEFORE UPDATE ON extraction_draft_nodes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      -- 4. Constraint Triggers: Folder user ownership & Circular reference checks
      CREATE OR REPLACE FUNCTION check_folder_parent_rules()
      RETURNS TRIGGER AS $$
      DECLARE
        curr_parent_id uuid := NEW.parent_folder_id;
        p_user_id text;
      BEGIN
        IF NEW.parent_folder_id IS NOT NULL THEN
          -- Check parent belongs to same user
          SELECT user_id INTO p_user_id FROM folders WHERE id = NEW.parent_folder_id;
          IF p_user_id IS NULL OR p_user_id <> NEW.user_id THEN
            RAISE EXCEPTION 'Parent folder must belong to the same user';
          END IF;

          -- Check circular reference
          WHILE curr_parent_id IS NOT NULL LOOP
            IF curr_parent_id = NEW.id THEN
              RAISE EXCEPTION 'Circular folder reference detected';
            END IF;
            SELECT parent_folder_id INTO curr_parent_id FROM folders WHERE id = curr_parent_id;
          END LOOP;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_check_folder_parent ON folders;
      CREATE TRIGGER trg_check_folder_parent
      BEFORE INSERT OR UPDATE OF parent_folder_id, user_id ON folders
      FOR EACH ROW EXECUTE FUNCTION check_folder_parent_rules();

      -- 5. Constraint Triggers: Topic parent document & Circular reference checks
      CREATE OR REPLACE FUNCTION check_topic_parent_rules()
      RETURNS TRIGGER AS $$
      DECLARE
        curr_parent_id uuid := NEW.parent_topic_id;
        p_doc_id uuid;
      BEGIN
        IF NEW.parent_topic_id IS NOT NULL THEN
          -- Check parent belongs to same document
          SELECT document_id INTO p_doc_id FROM topics WHERE id = NEW.parent_topic_id;
          IF p_doc_id IS NULL OR p_doc_id <> NEW.document_id THEN
            RAISE EXCEPTION 'Parent topic must belong to the same document';
          END IF;

          -- Check circular reference
          WHILE curr_parent_id IS NOT NULL LOOP
            IF curr_parent_id = NEW.id THEN
              RAISE EXCEPTION 'Circular topic reference detected';
            END IF;
            SELECT parent_topic_id INTO curr_parent_id FROM topics WHERE id = curr_parent_id;
          END LOOP;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_check_topic_parent ON topics;
      CREATE TRIGGER trg_check_topic_parent
      BEFORE INSERT OR UPDATE OF parent_topic_id, document_id ON topics
      FOR EACH ROW EXECUTE FUNCTION check_topic_parent_rules();

      -- 6. Row Level Security Setup
      -- Enable RLS on user-specific tables
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
      ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
      ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
      ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
      ALTER TABLE topic_versions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;
      ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
      ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
      ALTER TABLE recent_views ENABLE ROW LEVEL SECURITY;
      ALTER TABLE storage_objects ENABLE ROW LEVEL SECURITY;
      ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

      -- Create RLS Policies that respect request-scoped app.current_user_id
      -- If app.current_user_id is set, it MUST match the record user_id.
      -- If app.current_user_id is not set (e.g. admin/migration session), allow access.
      DROP POLICY IF EXISTS profiles_user_policy ON profiles;
      CREATE POLICY profiles_user_policy ON profiles
        USING (id = current_setting('app.current_user_id', true) OR current_setting('app.current_user_id', true) IS NULL OR current_setting('app.current_user_id', true) = '');

      DROP POLICY IF EXISTS user_preferences_user_policy ON user_preferences;
      CREATE POLICY user_preferences_user_policy ON user_preferences
        USING (user_id = current_setting('app.current_user_id', true) OR current_setting('app.current_user_id', true) IS NULL OR current_setting('app.current_user_id', true) = '');

      DROP POLICY IF EXISTS folders_user_policy ON folders;
      CREATE POLICY folders_user_policy ON folders
        USING (user_id = current_setting('app.current_user_id', true) OR current_setting('app.current_user_id', true) IS NULL OR current_setting('app.current_user_id', true) = '');

      DROP POLICY IF EXISTS documents_user_policy ON documents;
      CREATE POLICY documents_user_policy ON documents
        USING (user_id = current_setting('app.current_user_id', true) OR current_setting('app.current_user_id', true) IS NULL OR current_setting('app.current_user_id', true) = '');

      DROP POLICY IF EXISTS topics_user_policy ON topics;
      CREATE POLICY topics_user_policy ON topics
        USING (user_id = current_setting('app.current_user_id', true) OR current_setting('app.current_user_id', true) IS NULL OR current_setting('app.current_user_id', true) = '');

      DROP POLICY IF EXISTS topic_versions_user_policy ON topic_versions;
      CREATE POLICY topic_versions_user_policy ON topic_versions
        USING (user_id = current_setting('app.current_user_id', true) OR current_setting('app.current_user_id', true) IS NULL OR current_setting('app.current_user_id', true) = '');

      DROP POLICY IF EXISTS bookmarks_user_policy ON bookmarks;
      CREATE POLICY bookmarks_user_policy ON bookmarks
        USING (user_id = current_setting('app.current_user_id', true) OR current_setting('app.current_user_id', true) IS NULL OR current_setting('app.current_user_id', true) = '');

      DROP POLICY IF EXISTS tags_user_policy ON tags;
      CREATE POLICY tags_user_policy ON tags
        USING (user_id = current_setting('app.current_user_id', true) OR current_setting('app.current_user_id', true) IS NULL OR current_setting('app.current_user_id', true) = '');

      DROP POLICY IF EXISTS recent_views_user_policy ON recent_views;
      CREATE POLICY recent_views_user_policy ON recent_views
        USING (user_id = current_setting('app.current_user_id', true) OR current_setting('app.current_user_id', true) IS NULL OR current_setting('app.current_user_id', true) = '');
    `);

    console.log('Triggers, search indexes, and RLS policies successfully applied!');
  } catch (err: any) {
    console.error('Error applying migration:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSearchAndTriggersMigration();
