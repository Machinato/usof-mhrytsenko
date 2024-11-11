-- Create new DB
CREATE DATABASE usof_backend;

USE usof_backend;

-- Creating a user and granting privileges
CREATE USER 'mhrytsenko'@'localhost' IDENTIFIED BY 'securepass';
GRANT ALL PRIVILEGES ON usof_backend.* TO 'mhrytsenko'@'localhost';
FLUSH PRIVILEGES;

DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS post_categories;
DROP TABLE IF EXISTS post_images;
DROP TABLE IF EXISTS post_categories;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS jwt_tokens;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS favorite_posts;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY UNIQUE NOT NULL,
    login VARCHAR(30) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(30) NOT NULL,
    email_address  VARCHAR(30) NOT NULL,
    profile_picture VARCHAR(255),
    rating INT NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    is_activated TINYINT(1) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS posts  (
    id INT AUTO_INCREMENT PRIMARY KEY UNIQUE,
    author_id INT NOT NULL,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    publish_date DATETIME,
    status ENUM('active ', 'inactive') DEFAULT 'active',
    content TEXT
);

CREATE TABLE IF NOT EXISTS tokens(
    id INT AUTO_INCREMENT PRIMARY KEY UNIQUE NOT NULL,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expiration_date DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE 
);

CREATE TABLE IF NOT EXISTS jwt_tokens(
    id INT AUTO_INCREMENT PRIMARY KEY UNIQUE NOT NULL,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE 
);

CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    UNIQUE (name, description(255))  -- Уникальность на комбинацию name и description
);

CREATE TABLE IF NOT EXISTS post_categories (
    post_id INT,
    categories_id INT,
    PRIMARY KEY (post_id, categories_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (categories_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY UNIQUE,
    author_id INT NOT NULL,
    post_id INT NOT NULL,
    publish_date DATE,
    content TEXT,
    -- image_path VARCHAR(255),
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE post_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE likes (
    id INT AUTO_INCREMENT PRIMARY KEY,                                           -- Уникальный идентификатор лайка
    author_id INT NOT NULL,                                                      -- ID пользователя, который поставил лайк/дизлайк
    target_id INT NOT NULL,                                                      -- ID поста или комментария, к которому относится лайк/дизлайк
    target_type ENUM('post', 'comment') NOT NULL,                                -- Тип цели: 'post' или 'comment'
    type ENUM('like', 'dislike') NOT NULL,                                       -- Тип: "like" или "dislike"
    publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                            -- Дата добавления лайка/дизлайка
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,              -- Связь с таблицей пользователей
    -- Неявно предполагается, что target_id может ссылаться либо на посты, либо на комментарии,
    -- поэтому внешние ключи не применяются к target_id (если таблицы постов и комментариев разные).
    UNIQUE KEY unique_like (author_id, target_id, target_type) -- Уникальный лайк для одной цели от одного пользователя
);

CREATE TABLE favorite_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

INSERT INTO users (login, password, full_name, email_address, profile_picture, rating, role)
VALUES
('jdoe', '$2b$04$Mr0AH7VMQQcuQ8JkBkkMX.viY1Q0XSBuex5b5d71JSaU/3NxoMBZ2', 'John Doe', 'johndoe@example.com', NULL, 120, 'user'),
('asmith', '$2b$04$Mr0AH7VMQQcuQ8JkBkkMX.viY1Q0XSBuex5b5d71JSaU/3NxoMBZ2', 'Alice Smith', 'alicesmith@example.com', NULL, 95, 'user'),
('rbrown', '$2b$04$Mr0AH7VMQQcuQ8JkBkkMX.viY1Q0XSBuex5b5d71JSaU/3NxoMBZ2', 'Robert Brown', 'robertbrown@example.com', NULL, 80, 'admin'),
('lwilson', '$2b$04$Mr0AH7VMQQcuQ8JkBkkMX.viY1Q0XSBuex5b5d71JSaU/3NxoMBZ2', 'Laura Wilson', 'laurawilson@example.com', NULL, 110, 'user'),
('bmiller', '$2b$04$Mr0AH7VMQQcuQ8JkBkkMX.viY1Q0XSBuex5b5d71JSaU/3NxoMBZ2', 'Benjamin Miller', 'benjaminmiller@example.com', NULL, 70, 'user');

-- Добавляем категории
INSERT INTO categories (name, description)
VALUES
('General Discussion', 'General discussions about various IT topics.'),
('Programming', 'Discussion on programming languages and best practices.'),
('Hardware', 'All about hardware components and configurations.'),
('Networking', 'Discussions on network configurations, protocols, and troubleshooting.'),
('Security', 'Discuss cybersecurity and protection techniques.');

-- Добавляем посты
INSERT INTO posts (author_id, title, publish_date, status, content)
VALUES
(1, 'What is the best programming language?', '2024-11-01 12:00:00', 'active', 'Looking for opinions on the best programming language for a beginner.'),
(2, 'How to improve cybersecurity?', '2024-11-02 15:45:00', 'active', 'I am looking for ways to improve my systems security. Any tips?'),
(3, 'Top 5 coding practices', '2024-11-03 08:30:00', 'active', 'Sharing my top coding practices to help new developers.'),
(4, 'Choosing the right motherboard', '2024-11-04 17:20:00', 'active', 'Trying to choose the best motherboard for a high-end PC build.'),
(5, 'Setting up a home network', '2024-11-05 14:10:00', 'active', 'Need advice on setting up a home network with multiple devices.');

-- Связываем посты с категориями
INSERT INTO post_categories (post_id, categories_id)
VALUES
(1, 1), (1, 2),
(2, 1), (2, 5),
(3, 1), (3, 2),
(4, 1), (4, 3),
(5, 1), (5, 4);

-- Добавляем комментарии
INSERT INTO comments (author_id, post_id, publish_date, content)
VALUES
(2, 1, '2024-11-01', 'I think Python is a great choice for beginners.'),
(3, 1, '2024-11-01', 'JavaScript is also widely used and has many resources.'),
(1, 2, '2024-11-02', 'Start with firewalls and use strong passwords.'),
(5, 3, '2024-11-03', 'Always keep code modular and document it well.'),
(4, 4, '2024-11-04', 'Consider ASUS or MSI for high-quality motherboards.');

-- Добавляем избранные посты
INSERT INTO favorite_posts (user_id, post_id)
VALUES
(1, 3),
(2, 1),
(3, 2),
(4, 5),
(5, 4);

-- Добавляем лайки и дизлайки
INSERT INTO likes (author_id, target_id, target_type, type, publish_date)
VALUES
(1, 1, 'post', 'like', '2024-11-01 12:30:00'),
(2, 1, 'post', 'dislike', '2024-11-01 12:45:00'),
(3, 2, 'post', 'like', '2024-11-02 16:00:00'),
(4, 3, 'post', 'like', '2024-11-03 09:00:00'),
(5, 4, 'post', 'dislike', '2024-11-04 17:30:00');