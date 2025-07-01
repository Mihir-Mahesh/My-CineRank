// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import MovieCard from '../components/MovieCard';
import { TMDBMedia, TMDBSearchResponse } from '../types/tmdb';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<TMDBMedia[]>([]);
  const [popularMovies, setPopularMovies] = useState<TMDBMedia[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w300';

  // --- Effect for fetching POPULAR movies on initial load ---
  useEffect(() => {
    const fetchPopular = async () => {
      if (!TMDB_API_KEY) {
        setError("TMDb API Key is not configured. Please check your .env.local file.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const pagesToFetch = 16; // Still fetching 2 pages
        const minVotes = 700; // <<<--- NEW: Minimum vote count
        let allPopularMovies: TMDBMedia[] = [];

        for (let i = 1; i <= pagesToFetch; i++) {
          const response = await fetch(
            `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${i}&vote_count.gte=${minVotes}&include_adult=false` // <<<--- ADDED vote_count.gte and include_adult=false
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.status_message || `Failed to fetch popular movies on page ${i}`);
          }
          const data: TMDBSearchResponse = await response.json();
          allPopularMovies = allPopularMovies.concat(data.results);
        }

        // You can limit the total number of items here if you fetched too many
        setPopularMovies(allPopularMovies.filter(media => media.poster_path !== null && media.vote_count > 700)); // Still displaying 20, but now filtered
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred while fetching popular movies.');
      } finally {
        setLoading(false);
      }
    };

    fetchPopular();
  }, [TMDB_API_KEY]);

  // --- Effect for fetching SEARCH results (with debouncing) ---
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      if (!TMDB_API_KEY) {
        setError("TMDb API Key is not configured.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&include_adult=false` // <<<--- ADDED include_adult=false here too
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.status_message || 'Failed to fetch search results');
        }

        const data: TMDBSearchResponse = await response.json();
        // Filtering out 'person' and potentially also low vote counts if desired for search results
        setSearchResults(data.results.filter(
          item => (item.media_type === 'movie' || item.media_type === 'tv') && (item.vote_count || 0) >= 0 // No specific vote count filter for search yet, but you could add it
        ));
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred during search.');
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(() => {
      fetchSearchResults();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, TMDB_API_KEY]);

  const moviesToDisplay = searchQuery.trim() ? searchResults : popularMovies;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="w-full max-w-4xl text-center py-16 px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-purple-400">
          Find, Rate, Repeat
        </h1>
        <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-gray-200">
          All under a minute
        </h2>
        <SearchBar onSearch={setSearchQuery} />
      </section>

      {/* Display Loading/Error/No Results messages */}
      {loading && <p className="text-blue-400 mt-4">Loading content...</p>}
      {error && <p className="text-red-500 mt-4">Error: {error}</p>}

      {/* Display Movies */}
      {!loading && !error && (
        <>
          <h2 className="text-3xl font-bold mt-12 mb-6 self-start pl-4 md:pl-58">
            {searchQuery.trim() ? 'Search Results' : 'Popular'}
          </h2>
          {moviesToDisplay.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 w-full max-w-6xl">
              {moviesToDisplay.map((media) => (
                <MovieCard key={media.id} media={media} imageBaseUrl={TMDB_IMAGE_BASE_URL} />
              ))}
            </div>
          ) : (
            !searchQuery.trim() && (
              <p className="text-gray-400 mt-4 text-lg">Start by searching for a movie or TV show, or check out what's popular!</p>
            )
          )}

           {searchResults.length === 0 && !loading && !error && searchQuery.trim() && (
            <p className="text-gray-400 mt-4 text-lg">No results found for "{searchQuery}".</p>
          )}
        </>
      )}
    </main>
  );
}