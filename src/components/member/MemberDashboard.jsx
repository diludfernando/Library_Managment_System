import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import bookApi from '../../services/bookApi';
import './MemberDashboard.css';

const MemberDashboard = () => {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [borrowRequests, setBorrowRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [darkMode, setDarkMode] = useState(false);
    const [user, setUser] = useState(null);
    const [activeView, setActiveView] = useState('books'); // 'books', 'requests', 'borrowed'
    const [requestsFilter, setRequestsFilter] = useState('all'); // 'all', 'pending', 'borrowed'
    const navigate = useNavigate();

    const categories = ['All', 'Fiction', 'Non-Fiction', 'Sci-Fi', 'Biography', 'History', 'Self-Help', 'Psychology'];

    useEffect(() => {
        // Check authentication
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Redirect admins to admin dashboard
        if (parsedUser.role === 'Admin' || parsedUser.role === 'Librarian') {
            navigate('/admin');
            return;
        }

        fetchBooks();
        fetchBorrowRequests();

        // Check if dark mode is active
        if (document.body.classList.contains('dark-mode')) {
            setDarkMode(true);
        }
    }, [navigate]);

    useEffect(() => {
        filterBooks();
    }, [books, searchTerm, selectedCategory]);

    const fetchBooks = async () => {
        try {
            const response = await bookApi.get('/books');
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

    const fetchBorrowRequests = async () => {
        if (!user) {
            console.log('User is null, cannot fetch requests');
            return;
        }
        console.log('Fetching borrow requests for user:', user);
        try {
            const response = await api.get(`/borrow-requests/user/${user.id}`);
            console.log('Borrow requests response:', response.data);
            setBorrowRequests(response.data);
        } catch (error) {
            console.error('Error fetching borrow requests:', error);
        }
    };



    const handleBorrowBook = async (book) => {
        if (book.count <= 0) {
            alert('This book is currently unavailable.');
            return;
        }

        const confirmBorrow = window.confirm(`Do you want to request to borrow "${book.title}" by ${book.author}?`);
        if (confirmBorrow) {
            try {
                // Determine user details (fallback to current user if needed)
                const payload = {
                    userId: user.id,
                    userName: user.name,
                    userEmail: user.email,
                    bookIsbn: book.isbn,
                    bookTitle: book.title
                };

                await api.post('/borrow-requests', payload);
                alert(`Borrow request for "${book.title}" has been submitted! Please wait for librarian approval.`);
                // Refresh borrow requests
                fetchBorrowRequests();
            } catch (error) {
                console.error('Error creating borrow request:', error);
                if (error.response?.data) {
                    alert(`Failed to create borrow request: ${error.response.data}`);
                } else {
                    alert('Failed to create borrow request. Please try again.');
                }
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.body.classList.toggle('dark-mode');
    };

    if (loading) {
        return <div className="loading">Loading books...</div>;
    }

    // Helper function to get book details
    const getBookDetails = (isbn) => {
        return books.find(b => b.isbn === isbn) || {};
    };

    return (
        <div className="member-dashboard">
            <header className="member-header">
                <div className="container">
                    <div className="header-content">
                        <div className="logo" onClick={() => navigate('/')}>
                            <span className="logo-icon">📚</span>
                            <span className="logo-text">LibSys</span>
                        </div>
                        <div className="user-info">
                            <span className="welcome-text">Welcome, {user?.name}</span>
                        </div>
                        <div className="header-actions">
                            <button
                                className="icon-btn"
                                onClick={toggleDarkMode}
                                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            >
                                {darkMode ? '☀️' : '🌙'}
                            </button>
                            <button className="btn btn-secondary" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="member-main">
                <div className="container">
                    <div className="dashboard-hero">
                        <h1>Member Dashboard</h1>
                        <p>Browse and borrow books from our collection</p>
                    </div>

                    <div className="view-tabs">
                        <button
                            className={`tab-btn ${activeView === 'books' ? 'active' : ''}`}
                            onClick={() => setActiveView('books')}
                        >
                            📚 Browse Books
                        </button>
                        <button
                            className={`tab-btn ${activeView === 'requests' ? 'active' : ''}`}
                            onClick={() => setActiveView('requests')}
                        >
                            📋 My Requests ({borrowRequests.length})
                        </button>
                        <button
                            className={`tab-btn ${activeView === 'borrowed' ? 'active' : ''}`}
                            onClick={() => setActiveView('borrowed')}
                        >
                            📖 My Borrowed Books ({borrowRequests.filter(r => r.status === 'APPROVED').length})
                        </button>
                    </div>

                    {activeView === 'books' ? (
                        <>

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
                                                <img src={book.imageUrl} alt={book.title} onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=No+Image' }} />
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
                                                onClick={() => handleBorrowBook(book)}
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
                        </>
                    ) : activeView === 'borrowed' ? (
                        <div className="borrowed-section">
                            <h2>My Borrowed Books</h2>
                            {borrowRequests.filter(r => r.status === 'APPROVED').length === 0 ? (
                                <div className="no-results">
                                    <p>You strictly don't have any borrowed books right now.</p>
                                </div>
                            ) : (
                                <div className="books-grid">
                                    {borrowRequests
                                        .filter(r => r.status === 'APPROVED')
                                        .map(request => {
                                            const book = getBookDetails(request.bookIsbn);
                                            return (
                                                <div key={request.id} className="book-card borrowed-card">
                                                    <div className="book-image">
                                                        {book.imageUrl ? (
                                                            <img src={book.imageUrl} alt={book.title || request.bookTitle} onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=No+Image' }} />
                                                        ) : (
                                                            <div className="book-placeholder">
                                                                <span>{request.bookTitle}</span>
                                                            </div>
                                                        )}
                                                        <span className="status-badge status-approved">Borrowed</span>
                                                    </div>
                                                    <div className="book-details">
                                                        <h3 className="book-title">{request.bookTitle}</h3>
                                                        <p className="book-author">{book.author || 'Unknown Author'}</p>
                                                        <div className="book-meta">
                                                            <span className="category-tag">{book.category}</span>
                                                            <span className="borrow-date">Due: {new Date(new Date(request.responseDate).setDate(new Date(request.responseDate).getDate() + 14)).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="requests-section">
                            <h2>My Borrow Requests</h2>

                            <div className="request-filter-tabs">
                                <button
                                    className={`request-filter-btn ${requestsFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setRequestsFilter('all')}
                                >
                                    All ({borrowRequests.length})
                                </button>
                                <button
                                    className={`request-filter-btn ${requestsFilter === 'pending' ? 'active' : ''}`}
                                    onClick={() => setRequestsFilter('pending')}
                                >
                                    Pending ({borrowRequests.filter(r => r.status === 'PENDING').length})
                                </button>
                                <button
                                    className={`request-filter-btn ${requestsFilter === 'borrowed' ? 'active' : ''}`}
                                    onClick={() => setRequestsFilter('borrowed')}
                                >
                                    📚 My Borrowed Books ({borrowRequests.filter(r => r.status === 'APPROVED').length})
                                </button>
                            </div>

                            {borrowRequests.filter(request => {
                                if (requestsFilter === 'pending') return request.status === 'PENDING';
                                if (requestsFilter === 'borrowed') return request.status === 'APPROVED';
                                return true;
                            }).length === 0 ? (
                                <div className="no-results">
                                    <p>
                                        {requestsFilter === 'pending' && "You don't have any pending requests."}
                                        {requestsFilter === 'borrowed' && "You don't have any borrowed books currently."}
                                        {requestsFilter === 'all' && "You haven't made any borrow requests yet."}
                                    </p>
                                </div>
                            ) : (
                                <div className="requests-list">
                                    {borrowRequests
                                        .filter(request => {
                                            if (requestsFilter === 'pending') return request.status === 'PENDING';
                                            if (requestsFilter === 'borrowed') return request.status === 'APPROVED';
                                            return true;
                                        })
                                        .map(request => {
                                            const book = getBookDetails(request.bookIsbn);
                                            return (
                                                <div key={request.id} className="request-card">
                                                    <div className="request-header">
                                                        <h3>{request.bookTitle}</h3>
                                                        <span className={`status-badge status-${request.status.toLowerCase()}`}>
                                                            {request.status}
                                                        </span>
                                                    </div>
                                                    <div className="request-details">
                                                        <div className="request-book-info" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                                            {book.imageUrl && (
                                                                <img src={book.imageUrl} alt={request.bookTitle} style={{ width: '50px', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none' }} />
                                                            )}
                                                            <div>
                                                                <p><strong>ISBN:</strong> {request.bookIsbn}</p>
                                                                <p><strong>Author:</strong> {book.author}</p>
                                                            </div>
                                                        </div>
                                                        <p><strong>Requested:</strong> {new Date(request.requestDate).toLocaleString()}</p>
                                                        {request.responseDate && (
                                                            <p><strong>{request.status === 'APPROVED' ? 'Approved' : 'Response'}:</strong> {new Date(request.responseDate).toLocaleString()}</p>
                                                        )}
                                                        {request.librarianName && (
                                                            <p><strong>Processed by:</strong> {request.librarianName}</p>
                                                        )}
                                                        {request.status === 'APPROVED' && (
                                                            <div className="borrowed-notice">
                                                                ✓ This book is ready for pickup at the library
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main >
        </div >
    );
};

export default MemberDashboard;
