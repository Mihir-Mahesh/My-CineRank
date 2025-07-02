export interface TMDBExternalIds {
  imdb_id: string | null;
  wikidata_id: string | null;
  facebook_id: string | null;
  instagram_id: string | null;
  twitter_id: string | null;
  imdb_id: string | null;
}

export interface TMDBMedia {
    id: number;
    title?: string;         // Movies have 'title'
    name?: string;          // TV shows have 'name'
    original_title?: string;
    original_name?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    overview: string;
    release_date?: string;  // Movies have 'release_date'
    first_air_date?: string; // TV shows have 'first_air_date'
    vote_average: number;
    vote_count: number;
    original_language: string;
    media_type?: 'movie' | 'tv' | 'person';
    external_ids?: TMDBExternalIds;
    tagline?: string;
}

export interface TMDBSearchResponse {
    page: number;
    results: TMDBMedia[]; // Array of TMDBMedia objects
    total_pages: number;
    total_results: number;
}
