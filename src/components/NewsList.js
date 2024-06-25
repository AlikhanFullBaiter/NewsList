import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchNews } from '../redux/newsSlice';
import './NewsList.css';


const NewsList = () => {
  const dispatch = useDispatch();
  const news = useSelector((state) => state.news.news);
  const loading = useSelector((state) => state.news.loading);
  const error = useSelector((state) => state.news.error);

  useEffect(() => {
    dispatch(fetchNews());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchNews());
  };

  return (
   
      <div className="container">
        <h1>News</h1>
        <button className="refresh-button" onClick={handleRefresh} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh News'}
        </button>
        {error && <p className="error">Error: {error}</p>}
        <ul className="news-list">
          {news.map((newsItem) => (
            <li key={newsItem.id} className="news-item">
              <Link className="news-title" to={`/news/${newsItem.id}`}>{newsItem.title}</Link>
              <p className="description">{newsItem.description}</p>
              <div className='author-date-container'>
                  <p className="author">{newsItem.by}</p>
                  <p className="date">{new Date(newsItem.time * 1000).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    
  );
};

export default NewsList;
