USOF api mhrytsenko

# Project description
USOF is a backend service for managing users, posts, categories and comments. It supports user authentication, registration, content creation and editing, and token-based distributed access.

#Requirements and dependencies:
```json
{
  "scripts": {
    "dev": "nodemon app.js"
  },
  "dependencies": {
    "@adminjs/express": "^6.1.0",
    "adminjs": "^7.8.13",
    "bcrypt": "^5.1.1",
    "cookie-parser": "^1.4.7",
    "express": "^4.21.0",
    "express-session": "^1.18.0",
    "express-validator": "^7.2.0",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "mysql2": "^3.11.3",
    "nodemailer": "^6.9.15",
    "uuid": "^11.0.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.7"
  }
}
```

# Installation and startup

## 1.Clone this repository:

    git clone git@gitlab.ucode.world:connect-khpi/connect-fullstack-usof-backend/mhrytsenko.git
    cd usof-backend

## 2.Install dependencies:

    npm install

## 3.Configure the config.json file:

*If you want to use the project, please change the mail, password, secret keys, database and other data in the config.json file

• Specify secrets for token signing (SECRET_ACCESS, SECRET_REFRESH).
• Configure the credentials for nodemailer if you plan to use the password reset feature.

## 4.Initialize the database:

Use the SQL script provided in db.sql to set up your database.

# Start server<br>
    -npm run dev

The app will start on http://localhost:3000.

# Comprehensive Project Documentation
## Progress Descriptions (CBL Phases)
### Engage:

  Initial planning and defining the project goals,  focusing on user authentication and post management.

### Investigate:

  Research best practices for authentication, token management, and data validation.
  Develop database schema for users, posts, categories, and comments.

### Act:

  Implement routes for handling authentication, user, post, and comment operations.
  Add middleware for input validation and cookie handling.

# Basic Algorithm
  •The project uses JWT authentication to secure routes:

  •Token creation: The generateTokens function creates access and refresh tokens with specific expiry dates.

  •Access control: Middleware validates tokens and manages user sessions.

  •Password Hashing: bcrypt is used to hash passwords before storing them in the database.

# Endpoints:

# •Authentication module:<br>
    –POST - /api/auth/register- registration of a new user, required parameters are[login, password, fullName, email]<br>
    –POST - /api/auth/login - log in user, required parameters are [login, password]. Only users with a confirmed email can sign in<br>
    –POST - /api/auth/logout - log out authorized user
    –POST - /api/auth/password-reset- send a reset link to user email, requiredparameter is [email]<br>
    –POST - /api/auth/password-reset/<confirm_token>- It gets confirm_token in parameters and rewrites the password to the user <br>
    -GET - /api/auth/refresh - refresh web-token<br>
    
# •User module:<br>
    –GET - /api/users- get all users<br>
    –GET - /api/users/<user_id>- get specified user data<br>
    –GET - /api/users/favorite - get all favorite posts for user
    –GET - /api/users/<user_id>/rating - get user rating
    –POST - /api/users- create a new user, required parameters are [login, full_name, password, confirmPassword, email_address, role]. This feature must be accessible only for admins<br>
    –POST - /api/users/favorite/<post_id> - add post to favorite
    –PATCH - /api/users/avatar- upload user avatar<br>
    –PATCH - /api/users/<user_id>- update user data. User have not full rights<br>
    –DELETE - /api/users/<user_id>- delete user<br>
    –DELETE - /api/users/favorite/<favorite_id> - delete favorite post from favourite posts 

# •Post module:<br>
    –GET - /api/posts- get all posts.This endpoint doesn't require any role, it ispublic.
    –GET - /api/posts/with_filter - get all posts with with filter and sorted. This endpoint doesn't require any role, it ispublic.
    –GET - /api/posts/<post_id>- get specified post data.Endpoint is public
    –GET - /api/posts/<post_id>/comments- get all comments for the specified post.Endpoint is public
    –POST - /api/posts/<post_id>/comments- create a new comment, required parameteris [content]
    –GET - /api/posts/<post_id>/categories- get all categories associated with thespecified post
    –GET - /api/posts/<post_id>/like- get all likes under the specified post
    –POST - /api/posts/- create a new post, required parameters are [title, content, categories]
    –POST - /api/posts/<post_id>/like- create a new like under a post
    –PATCH - /api/posts/<post_id>- update the specified post (its title, body orcategory). It's accessible
    –PATCH - /api/posts/<post_id>/status- update the status of post. It's accessible only for the creator of the post or admin
    –DELETE - /api/posts/<post_id>- delete a post
    –DELETE - /api/posts/<post_id>/like- delete a like under a post
    –POST - /api/posts/<post_id>/photos- add a new photos to post
    –GET - /api/posts/<post_id>/photos- get all photos for post. This endpoint doesn't require any role, it ispublic.
    –DELETE - /api/posts/<post_id>/photos- delete a photos under a post
    –POST - /api/posts/<comment_id>/comment_like - add like on post
    –DELETE - /api/posts/<comment_id>/comment_like- delete a like under a comment


# •Categories module:
    –GET - /api/categories- get all categories
    -GET - /api/categories/<category_id>- get specified category data (by category id)
    –GET - /api/categories/<category_id>/posts- get all posts associated with thespecified category
    –POST - /api/categories- create a new category, required parameter is [title]. The combination of name and description must be unique 
    –PATCH - /api/categories/<category_id>- update specified category data
    –DELETE - /api/categories/<category_id>- delete a category

# •Comments module:
    –GET - /api/comments/<comment_id>- get specified comment data
    –GET - /api/comments/<comment_id>/like- get all likes under the specifiedcomment
    –POST - /api/comments/<comment_id>/like- create a new like under a comment
    –PATCH - /api/comments/<comment_id>- update specified comment data
    –DELETE - /api/comments/<comment_id>- delete a comment
    –DELETE - /api/comments/<comment_id>/like- delete a like under a comment
    –PATCH - /api/comments/<comment_id>/status- update comment status data