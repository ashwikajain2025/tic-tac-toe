import { createClient } from '@supabase/supabase-js';

interface TestDB {
  public: {
    Tables: {
      t: {
        Row: { id: string; name: string };
        Insert: { name: string };
        Update: { name?: string };
        Relationships: [];
      };
    };
    Views: {
      v: {
        Row: { id: string; name: string };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
  };
}

const c = createClient<TestDB>('', '');
const r = c.from('t').insert({ name: 'test' });
