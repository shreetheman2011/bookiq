export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  favorite_genre: string | null;
  school_grade: string | null;
  reading_preferences: string[] | null;
  theme_preference: 'light' | 'dark';
  updated_at: string;
};

export type BookScan = {
  id: string;
  user_id: string;
  image_url: string | null;
  title: string | null;
  author: string | null;
  genre: string | null;
  reading_level: string | null;
  maturity_level: string | null;
  is_movie: boolean | null;
  recommendations: Recommendation[] | null;
  is_recommended_for_user: boolean | null;
  ai_analysis: string | null;
  created_at: string;
};

export type Recommendation = {
  title: string;
  author: string;
  reason: string;
};
