// src/types/ratings.ts

export interface MyMovieRating {
  id: number; // TMDb ID
  title: string;
  poster_path: string | null;
  imdb_rating: number; // TMDb's vote_average
  my_rating: number; // Your personal 1-10 rating
  overview?: string; // Optional full description
  media_type?: 'movie' | 'tv'; // Store type for future use if needed
}