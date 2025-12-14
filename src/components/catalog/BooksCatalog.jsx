import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './BooksCatalog.css';

const BooksCatalog = () => {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();

    const categories = ['All', 'Fiction', 'Non-Fiction', 'Sci-Fi', 'Biography', 'History', 'Self-Help', 'Psychology'];

    useEffect(() => {
        fetchBooks();

        // Check if dark mode is active
        if (document.body.classList.contains('dark-mode')) {
            setDarkMode(true);
        }
    }, []);

    useEffect(() => {
        filterBooks();
    }, [books, searchTerm, selectedCategory]);

    const fetchBooks = async () => {
        try {
            const response = await api.get('/books');
            setBooks(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching books:', error);
            setLoading(false);
        }
    };

    const filterBooks = () => {
        let filtered = books;

        // Filter by category
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(book => book.category === selectedCategory);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(book =>
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.isbn.includes(searchTerm)
            );
        }

        setFilteredBooks(filtered);
    };

    const handleBorrowClick = () => {
        navigate('/login');
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.body.classList.toggle('dark-mode');
    };

    if (loading) {
        return <div className="loading">Loading books...</div>;
    }

    return (
        <div className="catalog-page">
            <header className="catalog-header">
                <div className="container">
                    <div className="header-content">
                        <div className="logo" onClick={() => navigate('/')}>
                            <span className="logo-icon">📚</span>
                            <span className="logo-text">LibSys</span>
                        </div>
                        <div className="header-actions">
                            <button
                                className="icon-btn"
                                onClick={toggleDarkMode}
                                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            >
                                {darkMode ? '☀️' : '🌙'}
                            </button>
                            <button className="btn btn-secondary" onClick={handleBackToHome}>
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="catalog-main">
                <div className="container">
                    <div className="catalog-hero">
                        <h1>Book Catalog</h1>
                        <p>Browse our collection of available books</p>
                    </div>

                    <div className="catalog-controls">
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search by title, author, or ISBN..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="category-filters">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="books-count">
                        Showing {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}
                    </div>

                    <div className="books-grid">
                        {filteredBooks.map(book => (
                            <div key={book.isbn} className="book-card">
                                <div className="book-image">
                                    {book.imageUrl ? (
                                        <img src={book.imageUrl} alt={book.title} />
                                    ) : (
                                        <div className="book-placeholder">
                                            <span>{book.title}</span>
                                        </div>
                                    )}
                                    <span className={`status-badge ${book.status.toLowerCase()}`}>
                                        {book.status}
                                    </span>
                                </div>
                                <div className="book-details">
                                    <h3 className="book-title">{book.title}</h3>
                                    <p className="book-author">{book.author}</p>
                                    <div className="book-meta">
                                        <span className="category-tag">{book.category}</span>
                                        <span className="book-count">{book.count} available</span>
                                    </div>
                                    <button
                                        className={`btn ${book.count > 0 ? 'btn-primary' : 'btn-disabled'}`}
                                        onClick={handleBorrowClick}
                                        disabled={book.count <= 0}
                                    >
                                        {book.count > 0 ? 'Borrow Book' : 'Unavailable'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredBooks.length === 0 && (
                        <div className="no-results">
                            <p>No books found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default BooksCatalog;
