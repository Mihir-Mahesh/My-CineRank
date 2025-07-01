'use client';


import React, { useState } from 'react'

interface SearchBarProps {
    onSearch: (query: string) => void
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(input);
    };

    return (
        <form onSubmit={handleSubmit} className='flex gap-2 p-4'>
            <input type='text' value={input} onChange={(e) => setInput(e.target.value)} placeholder='find and rate you desired movie/tv show' className='flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focusring-blue-500'/>
            <button type="submit" className='px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'>
                Search
            </button>
        </form>
    );
};

export default SearchBar;

