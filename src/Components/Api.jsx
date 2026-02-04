import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Api.css";

function Api() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("hot");
  const [subreddit, setSubreddit] = useState("reactjs");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch posts from API
  const fetchPosts = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }
      
      setError(null);
      const response = await axios.get(
        `https://www.reddit.com/r/${subreddit}/${sortBy}.json`,
        {
          params: {
            limit: 10,
            after: reset ? null : posts[posts.length - 1]?.name
          }
        }
      );

      const newPosts = response.data.data.children.map((obj) => ({
        ...obj.data,
        id: obj.data.id,
        title: obj.data.title,
        author: obj.data.author,
        score: obj.data.score,
        num_comments: obj.data.num_comments,
        created_utc: obj.data.created_utc,
        thumbnail: obj.data.thumbnail,
        url: obj.data.url,
        permalink: `https://reddit.com${obj.data.permalink}`
      }));

      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(response.data.data.children.length > 0);
    } catch (err) {
      setError(err.message || "Failed to fetch posts");
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }, [subreddit, sortBy, posts]);

  // Initial fetch and when dependencies change
  useEffect(() => {
    fetchPosts(true);
  }, [subreddit, sortBy]);

  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 500 &&
        !loading && 
        hasMore
      ) {
        setPage(prev => prev + 1);
        fetchPosts(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, fetchPosts]);

  // Filter posts based on search term
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  // Handle subreddit change
  const handleSubredditChange = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      setSubreddit(e.target.value.trim());
      e.target.value = "";
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchPosts(true);
  };

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Content</h2>
        <p>{error}</p>
        <button onClick={() => fetchPosts(true)}>Retry</button>
      </div>
    );
  }

  return (
    <div className="api-container">
      <header className="api-header">
        <h1>
          <span className="reddit-logo">reddit</span>
          <span className="subreddit-name">/r/{subreddit}</span>
        </h1>
        
        <div className="controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <input
              type="text"
              placeholder="Change subreddit (press Enter)"
              onKeyDown={handleSubredditChange}
              className="subreddit-input"
            />
          </div>
          
          <div className="sort-controls">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="hot">Hot</option>
              <option value="new">New</option>
              <option value="top">Top</option>
              <option value="rising">Rising</option>
            </select>
            
            <button 
              onClick={handleRefresh} 
              className="refresh-btn"
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      <main className="posts-container">
        {loading && posts.length === 0 ? (
          <div className="loading">Loading posts...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="no-posts">No posts found. Try a different search term.</div>
        ) : (
          <>
            <div className="posts-grid">
              {filteredPosts.map((post) => (
                <article key={post.id} className="post-card">
                  <div className="post-score">
                    <button className="vote-btn upvote">▲</button>
                    <span className="score">{post.score}</span>
                    <button className="vote-btn downvote">▼</button>
                  </div>
                  
                  <div className="post-content">
                    <div className="post-header">
                      <span className="post-author">Posted by u/{post.author}</span>
                      <span className="post-date">{formatDate(post.created_utc)}</span>
                    </div>
                    
                    <h3 className="post-title">
                      <a 
                        href={post.permalink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {post.title}
                      </a>
                    </h3>
                    
                    {post.thumbnail && post.thumbnail.startsWith('http') && (
                      <div className="post-thumbnail">
                        <img 
                          src={post.thumbnail} 
                          alt="Thumbnail" 
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                    
                    <div className="post-footer">
                      <span className="comments">
                        <i className="comment-icon">💬</i>
                        {post.num_comments} comments
                      </span>
                      <a 
                        href={post.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="external-link"
                      >
                        Visit Link →
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            
            {loading && posts.length > 0 && (
              <div className="loading-more">Loading more posts...</div>
            )}
            
            {!hasMore && posts.length > 0 && (
              <div className="no-more">No more posts to load.</div>
            )}
          </>
        )}
      </main>

      <footer className="api-footer">
        <p>Displaying {filteredPosts.length} of {posts.length} posts</p>
        <p>Data fetched from Reddit API • Page {page}</p>
      </footer>
    </div>
  );
}

export default Api;
