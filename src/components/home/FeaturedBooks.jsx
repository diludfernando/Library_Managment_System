import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './FeaturedBooks.css';
import api from '../../services/api';

const FeaturedBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleBorrowClick = () => {
        navigate('/login');
    };

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await api.get('/books');
                setBooks(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching books:", err);
                setError("Failed to load books. Please try again later.");
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    if (loading) return <div className="text-center py-10">Loading books...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <section className="featured-section">
            <div className="container">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Currently Available Books</h2>
                        <p className="section-subtitle">Browse our collection of books available for borrowing.</p>
                    </div>
                    <Link to="/catalog" className="view-all-link">View All &rarr;</Link>
                </div>

                <div className="books-grid">
                    {books.map((book) => (
                        <div key={book.isbn} className="book-card">
                            <div className="book-cover-wrapper">
                                {book.imageUrl ? (
                                    <img src={book.imageUrl} alt={book.title} className="book-cover-image" />
                                ) : (
                                    <div className="book-cover-placeholder">
                                        {book.title}
                                    </div>
                                )}
                                <div className="book-overlay">
                                    <button className="btn btn-primary" onClick={handleBorrowClick}>Borrow</button>
                                </div>
                                <span className="book-category">{book.category}</span>
                            </div>
                            <div className="book-info">
                                <h3 className="book-title">{book.title}</h3>
                                <p className="book-author">{book.author}</p>
                                <div className="book-rating">
                                    <span className="star">★</span>
                                    <span>{book.rating}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedBooks;
