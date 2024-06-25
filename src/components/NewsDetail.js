import store from '../redux/store'
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { fetchNews, fetchComments, addComment, deleteComment, editComment, setComments } from '../redux/newsSlice';
import './NewsDetail.css';

import { v4 as uuidv4 } from 'uuid';

const NewsDetail = () => {
  const { newsId } = useParams();
  const dispatch = useDispatch();
  const newsItem = useSelector((state) => state.news.news.find((news) => news.id === Number(newsId)));
  const comments = useSelector((state) => state.news.comments[newsId] || []);
  const currentUser = useSelector((state) => state.news.currentUser);
  const [commentText, setCommentText] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  useEffect(() => {
    if (!newsItem) {
      dispatch(fetchNews());
    } else {
      dispatch(fetchComments(newsId));
      const savedComments = JSON.parse(localStorage.getItem(`comments-${newsId}`)) || [];
      dispatch(setComments({ newsId, comments: savedComments }));
      
    }
  }, [dispatch, newsItem, newsId]);

  const handleAddComment = () => {
    if (currentUser && commentText.trim() !== '') {
      const newComment = { text: commentText.trim(), by: currentUser.name, id: uuidv4() };
      dispatch(addComment({ newsId, comment: newComment }));
      const updatedComments = [...comments, newComment];
      localStorage.setItem(`comments-${newsId}`, JSON.stringify(updatedComments));
      
      setCommentText('');
    }
  };

  const handleDeleteComment = (commentId) => {
    dispatch(deleteComment({ newsId, commentId }));
    const updatedComments = comments.filter(comment => comment.id !== commentId);
    localStorage.setItem(`comments-${newsId}`, JSON.stringify(updatedComments));
    
  };

  const handleEdit = (commentId, text) => {
    setEditCommentId(commentId);
    setEditCommentText(text);
  };

  const handleEditComment = (commentId) => {
    dispatch(editComment({ newsId, commentId, text: editCommentText }));
    const updatedComments = comments.map(comment => 
      comment.id === commentId ? { ...comment, text: editCommentText } : comment
    );
    localStorage.setItem(`comments-${newsId}`, JSON.stringify(updatedComments));
    
    setEditCommentId(null);
    setEditCommentText('');
  };

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  if (!newsItem) {
    return <p>Loading...</p>;
  }

  console.log(store.getState());

  return (
    
    <div className="container">
      <h1>{newsItem.title}</h1>
      <p className="description">{newsItem.description}</p>
      <p><span className="author">Author:</span> <span className="author-name">{newsItem.by}</span></p>
      <p>Published: {new Date(newsItem.time * 1000).toLocaleString()}</p>
      <p>Comments ({comments.length}):</p>
      <ul className="comment-list">
        {comments.map((comment) => (
          <li key={comment.id} className="comment-item">
            {editCommentId === comment.id ? (
              <div className='edit-comment-container'>
                <input
                  className="edit-comment-input"
                  type="text"
                  value={editCommentText}
                  onChange={(e) => setEditCommentText(e.target.value)}
                />
                <button className="edit-comment-button" onClick={() => handleEditComment(comment.id)}>Save</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p className="comment-author">{comment.by === currentUser?.name ? 'You' : comment.by }</p>
                </div>
                <p className="comment-text">{stripHtml(comment.text)}</p>
                {currentUser && comment.by === currentUser.name && (
                  <div className="comment-actions">
                    <button className="edit-comment-button" onClick={() => handleEdit(comment.id, comment.text)}>Edit</button>
                    <button className="delete-comment-button" onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
      <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Add a comment"
      />
      <div className="actions-container">
        <Link to="/" className="back-link">Back to News List</Link>
        <button className="add-comment-button" onClick={handleAddComment} disabled={!currentUser}>Add Comment</button>
      </div>
    </div>
  );
};


export default NewsDetail;
