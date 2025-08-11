import React, { useState, useEffect } from 'react';
import CoverItem from './CoverItem';
import SortBar from './SortBar';
import booksData from '../data/books.json';

const CoverList: React.FC = () => {
    const [books, setBooks] = useState(booksData);
    const [sortOption, setSortOption] = useState('name');

    useEffect(() => {
        const sortedBooks = [...books].sort((a, b) => {
            if (sortOption === 'name') {
                return a.name.localeCompare(b.name);
            } else {
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            }
        });
        setBooks(sortedBooks);
    }, [sortOption]);

    return (
        <div className="cover-list">
            <h1>故事書封面清單</h1>
            <SortBar setSortOption={setSortOption} />
            <div className="covers">
                {books.map((book) => (
                    <CoverItem key={book.id} book={book} />
                ))}
            </div>
        </div>
    );
};

export default CoverList;