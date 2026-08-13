export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          identity_id: string | null;
          belief_category_id: string | null;
          belief_context_text: string | null;
          onboarding_completed: boolean;
          program_start_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          identity_id?: string | null;
          belief_category_id?: string | null;
          belief_context_text?: string | null;
          onboarding_completed?: boolean;
          program_start_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          identity_id?: string | null;
          belief_category_id?: string | null;
          belief_context_text?: string | null;
          onboarding_completed?: boolean;
          program_start_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      checkins: {
        Row: {
          user_id: string;
          day_number: number;
          challenge_completed: boolean;
          reflection_text: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          day_number: number;
          challenge_completed: boolean;
          reflection_text?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          day_number?: number;
          challenge_completed?: boolean;
          reflection_text?: string | null;
          created_at?: string;
        };
      };
      content_templates: {
        Row: {
          belief_category_id: string;
          affirmation_1: string;
          affirmation_2: string;
          affirmation_3: string;
          challenge: string;
          visualization_script: string;
        };
        Insert: {
          belief_category_id: string;
          affirmation_1: string;
          affirmation_2: string;
          affirmation_3: string;
          challenge: string;
          visualization_script: string;
        };
        Update: {
          belief_category_id?: string;
          affirmation_1?: string;
          affirmation_2?: string;
          affirmation_3?: string;
          challenge?: string;
          visualization_script?: string;
        };
      };
      daily_content: {
        Row: {
          user_id: string;
          day_number: number;
          affirmation_1: string;
          affirmation_2: string;
          affirmation_3: string;
          challenge: string;
          visualization_script: string;
        };
        Insert: {
          user_id: string;
          day_number: number;
          affirmation_1: string;
          affirmation_2: string;
          affirmation_3: string;
          challenge: string;
          visualization_script: string;
        };
        Update: {
          user_id?: string;
          day_number?: number;
          affirmation_1?: string;
          affirmation_2?: string;
          affirmation_3?: string;
          challenge?: string;
          visualization_script?: string;
        };
      };
      streaks: {
        Row: {
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_checkin_date: string | null;
        };
        Insert: {
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_checkin_date?: string | null;
        };
        Update: {
          user_id?: string;
          current_streak?: number;
          longest_streak?: number;
          last_checkin_date?: string | null;
        };
      };
    };
  };
}
