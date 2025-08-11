import React, { useState, useEffect } from 'react';
import CoverList from './components/CoverList';
import SortBar from './components/SortBar';
import booksData from './data/books.json';

const App: React.FC = () => {
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
        <div className="app">
            <h1 className="title">故事書封面清單</h1>
            <SortBar setSortOption={setSortOption} />
            <CoverList books={books} />
        </div>
    );
};

export default App;