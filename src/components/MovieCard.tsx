// src/components/MovieCard.tsx
// No 'use client' needed here, as Link is a Next.js component that doesn't inherently make it client-side.
// However, if the parent page (page.tsx) is a client component, this will also be part of the client bundle.

import React from 'react';
import Link from 'next/link'; // Import Link
import { TMDBMedia } from '../types/tmdb';

interface MovieCardProps {
  media: TMDBMedia;
  imageBaseUrl: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ media, imageBaseUrl }) => {
  const title = media.title || media.name;
  const releaseDate = media.release_date || media.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  const posterUrl = media.poster_path ? `${imageBaseUrl}${media.poster_path}` : '/no-poster.png'; // Fallback image

  return (
    // Wrap the entire card with Next.js Link
    <Link href={`/movie/${media.id}`} passHref>
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-transform duration-200 hover:scale-105 flex flex-col cursor-pointer h-full"> {/* h-full to make cards same height */}
        <div className="relative w-full h-0 pb-[150%]">
          <img
            src={posterUrl}
            alt={title || 'Media Poster'}
            width={300} // Adjust width/height as per your imageBaseUrl for better performance
            height={450} // 2:3 aspect ratio
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.539 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.565-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path></svg>
            {media.vote_average ? media.vote_average.toFixed(1) : 'N/A'}
          </div>
          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end text-white text-xs font-semibold px-2 py-1 rounded-md">
            <span>{media.original_language?.toUpperCase()}</span>
            <span>{year}</span>
          </div>
        </div>
        <div className="p-4 flex flex-col items-center text-center flex-grow">
          <h3 className="text-lg font-semibold text-white mb-1 leading-tight">{title}</h3> {/* leading-tight for line height */}
          {/* This is where you would potentially show "Your Rating" if it's available in the `media` prop,
              or fetch it here if not passing it from parent. For now, it's on the detail page. */}
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
