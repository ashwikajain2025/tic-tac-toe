// Auto-describable DB row shapes — kept manually in sync with 001_init.sql.
// Use these as the generic parameter for createClient<Database>().

export interface CommunityRow {
  id: string;
  name: string;
  created_at: string;
}

export interface PlayerRow {
  id: string;
  name: string;
  community_id: string;
  slot: 1 | 2;
  wins: number;
  losses: number;
  draws: number;
  games_played: number;
}

export interface GameRecordRow {
  id: string;
  community_id: string;
  player_x_id: string;
  player_o_id: string;
  winner_id: string | null;
  played_at: string;
}

export interface LeaderboardRow {
  id: string;
  name: string;
  community_id: string;
  community_name: string;
  wins: number;
  losses: number;
  draws: number;
  games_played: number;
  win_rate: number;
}

// Supabase generated-type shape (minimal — only the tables we use)
export interface Database {
  public: {
    Tables: {
      communities: {
        Row: CommunityRow;
        Insert: Omit<CommunityRow, 'id' | 'created_at'>;
        Update: Partial<Omit<CommunityRow, 'id'>>;
        Relationships: [];
      };
      players: {
        Row: PlayerRow;
        Insert: Omit<PlayerRow, 'id' | 'wins' | 'losses' | 'draws' | 'games_played'>;
        Update: Partial<Omit<PlayerRow, 'id'>>;
        Relationships: [];
      };
      game_records: {
        Row: GameRecordRow;
        Insert: Omit<GameRecordRow, 'id' | 'played_at'>;
        Update: Partial<Omit<GameRecordRow, 'id'>>;
        Relationships: [];
      };
    };
    Views: {
      leaderboard: {
        Row: LeaderboardRow;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
  };
}
