const express = require('express');
const fs = require('fs');
const path = require('path');
const authRouter = require('./routes/auth-router.js');
const usersRouter = require('./routes/users-router.js');
const postsRouter = require('./routes/posts-router.js');
const categoryRouter = require('./routes/categories-router.js');
const commentRouter = require('./routes/comments-router.js');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;

// app.use(session({
//     secret : 'secret-key',
//     resave : false,
//     saveUninitialized : true
// }));

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/comments', commentRouter);

app.listen(PORT, (error) => {
    error ? console.log(error) : console.log(`listening port ${PORT}`);
});