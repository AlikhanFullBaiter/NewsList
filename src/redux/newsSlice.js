import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Асинхронный экшен для загрузки новостей
export const fetchNews = createAsyncThunk('news/fetchNews', async () => {
  const response = await axios.get('https://hacker-news.firebaseio.com/v0/askstories.json?print=pretty');
  const topStoryIds = response.data.slice(0, 10);

  const newsPromises = topStoryIds.map(async (id) => {
    const newsResponse = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`);
    const newsItem = newsResponse.data;

    const description = newsItem.text ? stripHtml(newsItem.text) : "No description available";

    return {
      ...newsItem,
      description,
    };
  });

  const newsResponses = await Promise.all(newsPromises);
  return newsResponses;
});

// Асинхронный экшен для загрузки комментариев
export const fetchComments = createAsyncThunk('news/fetchComments', async (newsId) => {
  const response = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${newsId}.json?print=pretty`);
  const newsItem = response.data;

  const commentPromises = (newsItem.kids || []).map(id =>
    axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`)
  );

  const commentResponses = await Promise.all(commentPromises);
  return { newsId, comments: commentResponses.map(res => ({ id: res.data.id, ...res.data })) };
});

// Функция для очистки HTML-тегов
const stripHtml = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

const newsSlice = createSlice({
  name: 'news',
  initialState: {
    news: [],
    comments: {},
    loading: false,
    error: null,
    currentUser: { name: 'You' } // Пример текущего пользователя
  },
  reducers: {
    setNews(state, action) {
      state.news = action.payload;
    },
    addComment(state, action) {
      const { newsId, comment } = action.payload;
      state.comments[newsId] = [...(state.comments[newsId] || []), { id: Date.now(), ...comment }];
      localStorage.setItem(`comments-${newsId}`, JSON.stringify(state.comments[newsId])); // Сохраняем комментарии в локальное хранилище
    },
    deleteComment(state, action) {
      const { newsId, commentId } = action.payload;
      state.comments[newsId] = state.comments[newsId].filter(comment => comment.id !== commentId);
      localStorage.setItem(`comments-${newsId}`, JSON.stringify(state.comments[newsId])); // Обновляем локальное хранилище
    },
    editComment(state, action) {
      const { newsId, commentId, text } = action.payload;
      state.comments[newsId] = state.comments[newsId].map(comment =>
        comment.id === commentId ? { ...comment, text } : comment
      );
      localStorage.setItem(`comments-${newsId}`, JSON.stringify(state.comments[newsId])); // Обновляем локальное хранилище
    },
    setComments(state, action) {
      const { newsId, comments } = action.payload;
      state.comments[newsId] = comments;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
        state.news = action.payload.sort((a, b) => b.time - a.time);
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments[action.payload.newsId] = action.payload.comments;
      });
  },
});

export const { setNews, addComment, deleteComment, editComment, setComments } = newsSlice.actions;
export default newsSlice.reducer;
