// src/app/movie/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { TMDBMedia } from '../../../types/tmdb';
import { MyMovieRating } from '../../../types/ratings'; 


export default function MovieDetailPage({}: MovieDetailPageProps) {
  const params = useParams();
  const movieId = Number(params.id); 
  const [movieDetails, setMovieDetails] = useState<TMDBMedia | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [myRating, setMyRating] = useState<MyMovieRating | null>(null);
  const [userRatingInput, setUserRatingInput] = useState<string>('');

  const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  useEffect(() => {
    const fetchDetails = async () => {
      if (isNaN(movieId)) { 
        setError("Invalid movie ID.");
        setLoading(false);
        return;
      }

      if (!TMDB_API_KEY) {
        setError("TMDb API Key is not configured. Please check your .env.local file.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let data: TMDBMedia | null = null;
        let response = await fetch(
          `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`
        );

        if (!response.ok) {
          response = await fetch(
            `${TMDB_BASE_URL}/tv/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`
          );
          if (!response.ok) {
             const errorData = await response.json();
             throw new Error(errorData.status_message || `Could not find details for ID: ${movieId}.`);
          }
        }
        data = await response.json();
        setMovieDetails(data);
        if (myRating) {
          setUserRatingInput(myRating.my_rating.toString());
        }

      } catch (err: any) {
        setError(err.message || 'Failed to fetch media details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [movieId, TMDB_API_KEY]); 

  useEffect(() => {
    if (isNaN(movieId)) return;

    try {
      const storedRatings = JSON.parse(localStorage.getItem('myMovieRatings') || '[]') as MyMovieRating[];
      const foundRating = storedRatings.find(rating => rating.id === movieId);
      setMyRating(foundRating || null);
      if (foundRating) {
        setUserRatingInput(foundRating.my_rating.toString());
      }
    } catch (e) {
      console.error("Failed to load personal rating from localStorage:", e);
      setMyRating(null);
    }
  }, [movieId]); 

  const handleSaveRating = () => {
    if (!movieDetails) return; 

    const ratingValue = parseInt(userRatingInput);

    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 10) {
      alert("Please enter a valid rating between 1 and 10.");
      return;
    }

    const newRating: MyMovieRating = {
      id: movieDetails.id,
      title: movieDetails.title || movieDetails.name || 'Unknown Title',
      poster_path: movieDetails.poster_path,
      imdb_rating: movieDetails.vote_average,
      my_rating: ratingValue,
      overview: movieDetails.overview,
      media_type: movieDetails.media_type as 'movie' | 'tv' 
    };

    try {
      const storedRatings = JSON.parse(localStorage.getItem('myMovieRatings') || '[]') as MyMovieRating[];
      const existingIndex = storedRatings.findIndex(rating => rating.id === newRating.id);

      if (existingIndex > -1) {
        storedRatings[existingIndex] = newRating;
      } else {
        storedRatings.push(newRating);
      }

      localStorage.setItem('myMovieRatings', JSON.stringify(storedRatings));
      setMyRating(newRating); 
      alert("Rating saved successfully!");
    } catch (e) {
      console.error("Failed to save rating to localStorage:", e);
      alert("Could not save rating. Please try again.");
    }
  };

  const handleDeleteRating = () => {
    if (!movieDetails || !myRating) return;

    if (!window.confirm(`Are you sure you want to delete your rating for "${myRating.title}"?`)) {
        return;
    }

    try {
      const storedRatings = JSON.parse(localStorage.getItem('myMovieRatings') || '[]') as MyMovieRating[];
      const updatedRatings = storedRatings.filter(rating => rating.id !== myRating.id);

      localStorage.setItem('myMovieRatings', JSON.stringify(updatedRatings));
      setMyRating(null); 
      setUserRatingInput(''); 
      alert("Rating deleted successfully!");
    } catch (e) {
      console.error("Failed to delete rating from localStorage:", e);
      alert("Could not delete rating. Please try again.");
    }
  };


  const posterUrl = movieDetails?.poster_path
    ? `${TMDB_IMAGE_BASE_URL}${movieDetails.poster_path}`
    : '/no-poster.png';

  const imdbId = (movieDetails as any)?.external_ids?.imdb_id; 
  const imdbLink = imdbId ? `https://www.imdb.com/title/${imdbId}/` : null;

  const title = movieDetails?.title || movieDetails?.name;

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
        <p className="text-blue-400 text-xl">Loading details...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
        <p className="text-red-500 text-xl">Error: {error}</p>
        <Link href="/" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Go Back Home
        </Link>
      </main>
    );
  }

  if (!movieDetails) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
        <p className="text-gray-400 text-xl">Movie or TV show not found.</p>
        <Link href="/" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Go Back Home
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 max-w-4xl w-full flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 flex-shrink-0">
          <img
            src={posterUrl}
            alt={title || 'Media Poster'}
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>
        <div className="md:w-2/3 flex flex-col">
          <h1 className="text-4xl font-extrabold mb-2 text-purple-400">{title}</h1>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-xl font-semibold mb-1">TMDb Rating:</h3>
              <p className="text-yellow-400 text-3xl font-bold">
                {movieDetails.vote_average ? movieDetails.vote_average.toFixed(1) : 'N/A'}
              </p>
              <p className="text-sm text-gray-400">({movieDetails.vote_count} votes)</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">Your Rating:</h3>
              {myRating ? (
                <p className="text-green-400 text-3xl font-bold">{myRating.my_rating}/10</p>
              ) : (
                <p className="text-gray-400 text-2xl font-semibold">N/A</p>
              )}
            </div>
          </div>

          {/* User Rating Input Section */}
          <div className="mt-4 p-4 bg-gray-700 rounded-lg flex flex-col sm:flex-row items-center gap-4">
            <label htmlFor="userRating" className="text-lg font-semibold text-gray-200 flex-shrink-0">
              Rate this:
            </label>
            <input
              type="number"
              id="userRating"
              min="1"
              max="10"
              value={userRatingInput}
              onChange={(e) => setUserRatingInput(e.target.value)}
              className="w-20 p-2 text-center bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1-10"
            />
            <button
              onClick={handleSaveRating}
              className="px-6 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0"
            >
              {myRating ? 'Update Rating' : 'Save Rating'}
            </button>
            {myRating && (
              <button
                onClick={handleDeleteRating}
                className="px-6 py-2 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex-shrink-0"
              >
                Delete Rating
              </button>
            )}
          </div>

          <h3 className="text-xl font-semibold mb-2 mt-6">Overview:</h3>
          <p className="text-gray-300 mb-6 flex-grow">{movieDetails.overview || 'No overview available.'}</p>

          {imdbLink && (
            <a
              href={imdbLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-400 hover:underline text-lg font-medium"
            >
              View on IMDb
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>
          )}
        </div>
      </div>
      <Link href="/" className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-lg font-semibold">
        Back to Home
      </Link>
    </main>
  );
}
