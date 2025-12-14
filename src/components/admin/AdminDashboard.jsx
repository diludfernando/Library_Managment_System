import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import bookApi from '../../services/bookApi';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('books');
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();

    // Get logged in user from localStorage
    const [currentUser, setCurrentUser] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setCurrentUser(user);
            setCurrentUserRole(user.role);
        } else {
            // If no user logged in, redirect to login
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [darkMode]);

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBooks = async () => {
        try {
            const response = await bookApi.get('/books');
            setBooks(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching books:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'books') {
            fetchBooks();
        } else if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'requests') {
            fetchBorrowRequests();
        }
    }, [activeTab]);

    const [showBookModal, setShowBookModal] = useState(false);
    const [currentBook, setCurrentBook] = useState(null);
    const [bookFormData, setBookFormData] = useState({ isbn: '', title: '', author: '', category: 'Fiction', status: 'Available', count: 1, imageUrl: '' });

    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    const [borrowRequests, setBorrowRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [requestsFilter, setRequestsFilter] = useState('all'); // 'all', 'pending', 'approved'

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
            setLoadingUsers(false);
        } catch (error) {
            console.error("Error fetching users:", error);
            setLoadingUsers(false);
        }
    };

    const fetchBorrowRequests = async () => {
        try {
            const response = await api.get('/borrow-requests/all');
            setBorrowRequests(response.data);
            setLoadingRequests(false);
        } catch (error) {
            console.error("Error fetching borrow requests:", error);
            setLoadingRequests(false);
        }
    };

    const handleApproveRequest = async (requestId) => {
        if (window.confirm('Approve this borrow request?')) {
            try {
                await api.post(`/borrow-requests/${requestId}/approve`, {
                    librarianId: currentUser.id,
                    librarianName: currentUser.name
                });
                alert('Request approved successfully!');
                fetchBorrowRequests();
            } catch (error) {
                console.error("Error approving request:", error);
                alert("Failed to approve request. " + (error.response?.data || "Please try again."));
            }
        }
    };

    const handleRejectRequest = async (requestId) => {
        if (window.confirm('Reject this borrow request?')) {
            try {
                await api.post(`/borrow-requests/${requestId}/reject`, {
                    librarianId: currentUser.id,
                    librarianName: currentUser.name
                });
                alert('Request rejected successfully!');
                fetchBorrowRequests();
            } catch (error) {
                console.error("Error rejecting request:", error);
                alert("Failed to reject request. Please try again.");
            }
        }
    };

    const [showUserModal, setShowUserModal] = useState(false);
    const [currentEditUser, setCurrentEditUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Member', status: 'Active' });

    const handleLogout = () => {
        // In a real app, we would clear auth tokens here
        navigate('/');
    };

    // Book CRUD Handlers
    const handleAddBook = () => {
        setCurrentBook(null);
        setBookFormData({ isbn: '', title: '', author: '', category: 'Fiction', status: 'Available', count: 1, imageUrl: '' });
        setShowBookModal(true);
    };

    const handleEditBook = (book) => {
        setCurrentBook(book);
        setBookFormData({ isbn: book.isbn, title: book.title, author: book.author, category: book.category, status: book.status, count: book.count, imageUrl: book.imageUrl || '' });
        setShowBookModal(true);
    };

    // Fetch book details from Open Library API by ISBN
    const fetchBookByISBN = async (isbn) => {
        if (!isbn || isbn.length < 10) return; // ISBN should be at least 10 digits

        try {
            const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
            const data = await response.json();
            const bookData = data[`ISBN:${isbn}`];

            if (bookData) {
                // Extract book information
                const title = bookData.title || '';
                const author = bookData.authors?.[0]?.name || '';
                const imageUrl = bookData.cover?.large || bookData.cover?.medium || bookData.cover?.small || '';

                // Update form with fetched data
                setBookFormData(prev => ({
                    ...prev,
                    title: title,
                    author: author,
                    imageUrl: imageUrl
                }));

                console.log('Book details fetched successfully');
            } else {
                console.log('No book found for ISBN:', isbn);
            }
        } catch (error) {
            console.error('Error fetching book details:', error);
        }
    };

    const handleISBNChange = (e) => {
        const isbn = e.target.value;
        setBookFormData({ ...bookFormData, isbn: isbn });

        // Auto-fetch when ISBN is complete (10 or 13 digits)
        if (isbn.length === 10 || isbn.length === 13) {
            fetchBookByISBN(isbn);
        }
    };

    const handleDeleteBook = async (isbn) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            try {
                await bookApi.delete(`/books/${isbn}`);
                setBooks(books.filter(book => book.isbn !== isbn));
            } catch (error) {
                console.error("Error deleting book:", error);
                alert("Failed to delete book");
            }
        }
    };

    const handleCloseBookModal = () => {
        setShowBookModal(false);
        setCurrentBook(null);
    };

    const handleSaveBook = async (e) => {
        e.preventDefault();
        try {
            if (currentBook) {
                // Edit existing book
                const response = await bookApi.put(`/books/${currentBook.isbn}`, bookFormData);
                setBooks(books.map(book => book.isbn === currentBook.isbn ? response.data : book));
            } else {
                // Add new book
                const response = await bookApi.post('/books', bookFormData);
                setBooks([...books, response.data]);
            }
            handleCloseBookModal();
        } catch (error) {
            console.error("Error saving book:", error);
            alert("Failed to save book. Make sure ISBN is unique.");
        }
    };

    const handleAddUser = () => {
        setCurrentEditUser(null);
        setFormData({ name: '', email: '', password: '', role: 'Member', status: 'Active' });
        setShowUserModal(true);
    };

    const handleEditUser = (user) => {
        setCurrentEditUser(user);
        setFormData({ name: user.name, email: user.email, password: user.password || '', role: user.role, status: user.status });
        setShowUserModal(true);
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/users/${id}`);
                setUsers(users.filter(user => user.id !== id));
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("Failed to delete user. Please try again.");
            }
        };
    };

    const handleCloseModal = () => {
        setShowUserModal(false);
        setCurrentEditUser(null);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            if (currentEditUser) {
                // Edit existing user
                const response = await api.put(`/users/${currentEditUser.id}`, formData);
                setUsers(users.map(user => user.id === currentEditUser.id ? response.data : user));
            } else {
                // Add new user
                const response = await api.post('/users', formData);
                setUsers([...users, response.data]);
            }
            handleCloseModal();
        } catch (error) {
            console.error("Error saving user:", error);
            alert("Failed to save user. Please try again.");
        }
    };

    return (
        <div className="admin-dashboard">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <span className="logo-icon">📚</span>
                    <span className="logo-text">LibSys Admin</span>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${activeTab === 'books' ? 'active' : ''}`}
                        onClick={() => setActiveTab('books')}
                    >
                        Book Management
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        Borrow Requests
                    </button>
                    {currentUserRole === 'Admin' && (
                        <button
                            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            Users
                        </button>
                    )}
                    <button
                        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        Settings
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </aside>

            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h2>
                        {activeTab === 'books' ? 'Book Management' :
                            activeTab === 'requests' ? 'Borrow Requests' :
                                activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </h2>
                    <div className="user-profile">
                        <button
                            className="btn-icon"
                            onClick={() => setDarkMode(!darkMode)}
                            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            style={{ marginRight: '1rem', fontSize: '1.2rem' }}
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>
                        <span className="user-name">{currentUser?.name || 'User'}</span>
                        <div className="avatar">{currentUser?.name?.charAt(0).toUpperCase() || 'U'}</div>
                    </div>
                </header>

                <div className="content-area">
                    {activeTab === 'books' && (
                        <div className="book-management">
                            <div className="actions-bar">
                                <input type="text" placeholder="Search books..." className="search-input" />
                                <button className="btn btn-primary" onClick={handleAddBook}>Add New Book</button>
                            </div>

                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>ISBN</th>
                                            <th>Title</th>
                                            <th>Author</th>
                                            <th>Category</th>
                                            <th>Count</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {books.map((book) => (
                                            <tr key={book.isbn}>
                                                <td>{book.isbn}</td>
                                                <td className="font-medium">{book.title}</td>
                                                <td>{book.author}</td>
                                                <td>
                                                    <span className="badge badge-gray">{book.category}</span>
                                                </td>
                                                <td>{book.count}</td>
                                                <td>
                                                    <span className={`badge status-${book.status.toLowerCase().replace(' ', '-')}`}>
                                                        {book.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button className="btn-icon edit" title="Edit" onClick={() => handleEditBook(book)}>✎</button>
                                                        <button className="btn-icon delete" title="Delete" onClick={() => handleDeleteBook(book.isbn)}>🗑</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="user-management">
                            <div className="actions-bar">
                                <input type="text" placeholder="Search users..." className="search-input" />
                                <button className="btn btn-primary" onClick={handleAddUser}>Add New User</button>
                            </div>

                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td className="font-medium">{user.name}</td>
                                                <td>{user.email}</td>
                                                <td>{user.role}</td>
                                                <td>
                                                    <span className={`badge status-${user.status.toLowerCase()}`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button className="btn-icon edit" title="Edit" onClick={() => handleEditUser(user)}>✎</button>
                                                        <button className="btn-icon delete" title="Delete" onClick={() => handleDeleteUser(user.id)}>🗑</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}


                    {activeTab === 'requests' && (
                        <div className="requests-management">
                            <div className="filter-tabs">
                                <button
                                    className={`filter-tab ${requestsFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setRequestsFilter('all')}
                                >
                                    All Requests ({borrowRequests.length})
                                </button>
                                <button
                                    className={`filter-tab ${requestsFilter === 'pending' ? 'active' : ''}`}
                                    onClick={() => setRequestsFilter('pending')}
                                >
                                    Pending ({borrowRequests.filter(r => r.status === 'PENDING').length})
                                </button>
                                <button
                                    className={`filter-tab ${requestsFilter === 'approved' ? 'active' : ''}`}
                                    onClick={() => setRequestsFilter('approved')}
                                >
                                    Borrowed Books ({borrowRequests.filter(r => r.status === 'APPROVED').length})
                                </button>
                            </div>

                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Member</th>
                                            <th>Email</th>
                                            <th>Book Title</th>
                                            <th>ISBN</th>
                                            <th>Request Date</th>
                                            {requestsFilter === 'approved' && <th>Approved Date</th>}
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {borrowRequests
                                            .filter(request => {
                                                if (requestsFilter === 'pending') return request.status === 'PENDING';
                                                if (requestsFilter === 'approved') return request.status === 'APPROVED';
                                                return true;
                                            })
                                            .map((request) => (
                                                <tr key={request.id}>
                                                    <td className="font-medium">{request.userName}</td>
                                                    <td>{request.userEmail}</td>
                                                    <td className="font-medium">{request.bookTitle}</td>
                                                    <td>{request.bookIsbn}</td>
                                                    <td>{new Date(request.requestDate).toLocaleString()}</td>
                                                    {requestsFilter === 'approved' && (
                                                        <td>{request.responseDate ? new Date(request.responseDate).toLocaleString() : '-'}</td>
                                                    )}
                                                    <td>
                                                        <span className={`badge status-${request.status.toLowerCase()}`}>
                                                            {request.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {request.status === 'PENDING' ? (
                                                            <div className="action-buttons">
                                                                <button
                                                                    className="btn btn-success"
                                                                    onClick={() => handleApproveRequest(request.id)}
                                                                    title="Approve"
                                                                >
                                                                    ✓ Approve
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger"
                                                                    onClick={() => handleRejectRequest(request.id)}
                                                                    title="Reject"
                                                                >
                                                                    ✗ Reject
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span style={{ color: '#666', fontSize: '0.9rem' }}>
                                                                {request.librarianName ? `By ${request.librarianName}` : 'Processed'}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                                {borrowRequests.filter(request => {
                                    if (requestsFilter === 'pending') return request.status === 'PENDING';
                                    if (requestsFilter === 'approved') return request.status === 'APPROVED';
                                    return true;
                                }).length === 0 && (
                                        <div className="no-data">
                                            <p>No {requestsFilter === 'all' ? '' : requestsFilter} requests found.</p>
                                        </div>
                                    )}
                            </div>
                        </div>
                    )}

                    {activeTab !== 'books' && activeTab !== 'users' && activeTab !== 'requests' && (
                        <div className="placeholder-content">
                            <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Content</h3>
                            <p>This section is under construction.</p>
                        </div>
                    )}
                </div>

                {showUserModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>{currentEditUser ? 'Edit User' : 'Add New User'}</h3>
                            <form onSubmit={handleSaveUser}>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required={!currentEditUser}
                                        placeholder={currentEditUser ? "Leave blank to keep current password" : ""}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="Member">Member</option>
                                        <option value="Librarian">Librarian</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showBookModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>{currentBook ? 'Edit Book' : 'Add New Book'}</h3>
                            <form onSubmit={handleSaveBook}>
                                <div className="form-group">
                                    <label>ISBN</label>
                                    <input
                                        type="text"
                                        value={bookFormData.isbn}
                                        onChange={handleISBNChange}
                                        required
                                        disabled={!!currentBook} // Disable ISBN editing for existing books
                                        placeholder="Enter ISBN (10 or 13 digits)"
                                    />
                                    {!currentBook && (
                                        <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '0.25rem' }}>
                                            Book details will auto-fill when you enter a valid ISBN
                                        </small>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        value={bookFormData.title}
                                        onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Author</label>
                                    <input
                                        type="text"
                                        value={bookFormData.author}
                                        onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Image URL</label>
                                    <input
                                        type="url"
                                        value={bookFormData.imageUrl}
                                        onChange={(e) => setBookFormData({ ...bookFormData, imageUrl: e.target.value })}
                                        placeholder="https://example.com/book-cover.jpg"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={bookFormData.category}
                                        onChange={(e) => setBookFormData({ ...bookFormData, category: e.target.value })}
                                    >
                                        <option value="Fiction">Fiction</option>
                                        <option value="Non-Fiction">Non-Fiction</option>
                                        <option value="Sci-Fi">Sci-Fi</option>
                                        <option value="Biography">Biography</option>
                                        <option value="History">History</option>
                                        <option value="Self-Help">Self-Help</option>
                                        <option value="Psychology">Psychology</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Count</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={bookFormData.count}
                                        onChange={(e) => setBookFormData({ ...bookFormData, count: parseInt(e.target.value) || 0 })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={bookFormData.status}
                                        onChange={(e) => setBookFormData({ ...bookFormData, status: e.target.value })}
                                    >
                                        <option value="Available">Available</option>
                                        <option value="Checked Out">Checked Out</option>
                                        <option value="Reserved">Reserved</option>
                                        <option value="Lost">Lost</option>
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={handleCloseBookModal}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
