import { useEffect, useState } from "react";
import { auth } from "./backend/Firebase";

function BrowsePosts() {
    // Store posts and loading status
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filter states
    const [dateFilter, setDateFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [planFilter, setPlanFilter] = useState("All");
    const [tagFilter, setTagFilter] = useState("");

    // Hide and expand states
    const [hiddenPosts, setHiddenPosts] = useState([]);
    const [expandedPosts, setExpandedPosts] = useState([]);

    // Fetch posts from the backend
    async function fetchPosts() {
        try {
            setLoading(true);
            setError("");

            const headers = {};

            // Send login token if a user is logged in
            if (auth.currentUser) {
                const token = await auth.currentUser.getIdToken();
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await fetch(
                "http://localhost:3000/api/posts",
                { headers }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load posts.");
            }

            setPosts(data.posts || []);

        } catch (error) {
            console.error("Error fetching posts:", error);
            setError(error.message);

        } finally {
            setLoading(false);
        }
    }

    // Load posts when the page opens
    useEffect(() => {
        fetchPosts();
    }, []);

    // Convert Firestore timestamp into a readable date
    function getPostDate(post) {
        const seconds = post.createdAt?._seconds;

        if (!seconds) return "";

        return new Date(seconds * 1000).toISOString().split("T")[0];
    }

    // Hide a post without deleting it from Firestore
    function hidePost(postId) {
        setHiddenPosts(previous =>
            previous.includes(postId)
                ? previous
                : [...previous, postId]
        );
    }

    // Unhide a previously hidden post
    function unhidePost(postId) {
        setHiddenPosts(previous =>
            previous.filter(id => id !== postId)
        );
    }

    // Expand or collapse post content
    function toggleExpand(postId) {
        setExpandedPosts(previous =>
            previous.includes(postId)
                ? previous.filter(id => id !== postId)
                : [...previous, postId]
        );
    }

    // Reset all filters and hidden posts
    function resetFilters() {
        setDateFilter("");
        setTypeFilter("All");
        setPlanFilter("All");
        setTagFilter("");
        setHiddenPosts([]);
        setExpandedPosts([]);
    }

    // Apply filters to the posts
    const filteredPosts = posts.filter(post => {

        if (hiddenPosts.includes(post.id)) return false;

        if (dateFilter && getPostDate(post) !== dateFilter) {
            return false;
        }

        if (typeFilter !== "All" && post.postType !== typeFilter) {
            return false;
        }

        if (planFilter !== "All" && post.postPlan !== planFilter) {
            return false;
        }

        if (
            tagFilter &&
            !post.tags?.some(tag =>
                tag.toLowerCase().includes(tagFilter.toLowerCase())
            )
        ) {
            return false;
        }

        return true;
    });

    // Get all hidden posts
    const hiddenPostsList = posts.filter(post =>
        hiddenPosts.includes(post.id)
    );

    // Loading message
    if (loading) {
        return <h2 className="browse-message">Loading posts...</h2>;
    }

    // Error message
    if (error) {
        return <h2 className="browse-message">{error}</h2>;
    }

    return (
        <div className="browse-container">

            <h1>Browse Posts</h1>
            <p className="browse-subtitle">
                Explore questions and articles shared by the community.
            </p>

            {/* Filters */}
            <div className="filter-container">

                <div>
                    <label>Filter by Date</label>
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                    />
                </div>

                <div>
                    <label>Post Type</label>
                    <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                    >
                        <option value="All">All Types</option>
                        <option value="Question">Questions</option>
                        <option value="Article">Articles</option>
                    </select>
                </div>

                <div>
                    <label>Plan</label>
                    <select
                        value={planFilter}
                        onChange={e => setPlanFilter(e.target.value)}
                    >
                        <option value="All">All Plans</option>
                        <option value="Free">Free</option>
                        <option value="Paid">Paid</option>
                    </select>
                </div>

                <div>
                    <label>Search Tags</label>
                    <input
                        type="text"
                        placeholder="Search by tag..."
                        value={tagFilter}
                        onChange={e => setTagFilter(e.target.value)}
                    />
                </div>

                <button onClick={resetFilters}>
                    Reset Filters
                </button>

            </div>

            {/* Posts */}
            <div className="posts-container">

                {filteredPosts.length === 0 ? (
                    <p className="browse-message">No posts found.</p>
                ) : (

                    filteredPosts.map(post => {

                        const isExpanded = expandedPosts.includes(post.id);

                        return (
                            <div className="post-card" key={post.id}>

                                <div className="post-header">
                                    <span className="post-type">
                                        {post.postType}
                                    </span>

                                    <span className="post-plan">
                                        {post.postPlan}
                                    </span>
                                </div>

                                <h2>{post.title}</h2>

                                <p className="post-description">
                                    {post.description}
                                </p>

                                {post.abstract && (
                                    <p>{post.abstract}</p>
                                )}

                                {isExpanded && (
                                    <div className="expanded-content">
                                        <p>{post.articleText}</p>
                                    </div>
                                )}

                                <div className="post-tags">
                                    {post.tags?.map((tag, index) => (
                                        <span key={index}>#{tag}</span>
                                    ))}
                                </div>

                                <p className="post-date">
                                    Posted on: {getPostDate(post)}
                                </p>

                                <div className="post-actions">

                                    <button
                                        onClick={() => toggleExpand(post.id)}
                                    >
                                        {isExpanded ? "Show Less" : "Read More"}
                                    </button>

                                    <button
                                        className="hide-button"
                                        onClick={() => hidePost(post.id)}
                                    >
                                        Hide Post
                                    </button>

                                </div>

                            </div>
                        );
                    })
                )}

            </div>

            {/* Hidden Posts Section */}
            <section className="hidden-posts-section">

                <h2>Hidden Posts ({hiddenPostsList.length})</h2>

                {hiddenPostsList.length === 0 ? (
                    <p>You haven't hidden any posts.</p>
                ) : (

                    hiddenPostsList.map(post => (

                        <div className="post-card" key={post.id}>

                            <div className="post-header">
                                <span className="post-type">
                                    {post.postType}
                                </span>

                                <span className="post-plan">
                                    {post.postPlan}
                                </span>
                            </div>

                            <h3>{post.title}</h3>

                            <p>This post is currently hidden.</p>

                            <button
                                type="button"
                                onClick={() => unhidePost(post.id)}
                            >
                                Unhide Post
                            </button>

                        </div>

                    ))
                )}

            </section>

        </div>
    );
}

export default BrowsePosts;