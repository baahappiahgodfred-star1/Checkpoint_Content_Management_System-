-- =====================================================
-- EDUCMS DATABASE SCHEMA
-- =====================================================
-- Drop existing tables if they exist (for fresh start)
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS post_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
   user_id SERIAL PRIMARY KEY,
   username VARCHAR(50) UNIQUE NOT NULL,
   email VARCHAR(100) UNIQUE NOT NULL,
   password_hash VARCHAR(255) NOT NULL,
   first_name VARCHAR(50),
   last_name VARCHAR(50),
   role VARCHAR(20) DEFAULT 'subscriber' CHECK (role IN ('admin', 'editor', 'author', 'subscriber')),
   bio TEXT,
   avatar VARCHAR(255),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   last_login TIMESTAMP,
   is_active BOOLEAN DEFAULT true,
   email_verified BOOLEAN DEFAULT false,
   verification_token VARCHAR(255)
);

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE categories (
   category_id SERIAL PRIMARY KEY,
   name VARCHAR(100) NOT NULL,
   slug VARCHAR(100) UNIQUE NOT NULL,
   description TEXT,
   parent_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
   display_order INTEGER DEFAULT 0,
   is_active BOOLEAN DEFAULT true,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- POSTS TABLE
-- =====================================================
CREATE TABLE posts (
   post_id SERIAL PRIMARY KEY,
   title VARCHAR(255) NOT NULL,
   slug VARCHAR(255) UNIQUE NOT NULL,
   content TEXT NOT NULL,
   excerpt TEXT,
   author_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
   category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
   status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
   featured_image VARCHAR(255),
   view_count INTEGER DEFAULT 0,
   like_count INTEGER DEFAULT 0,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   published_at TIMESTAMP,
   
   -- SEO Fields
   meta_title VARCHAR(255),
   meta_description TEXT,
   meta_keywords TEXT,
   
   -- Additional Fields
   is_featured BOOLEAN DEFAULT false,
   allow_comments BOOLEAN DEFAULT true,
   reading_time INTEGER,
   
   CONSTRAINT valid_published_date CHECK (
       (status = 'published' AND published_at IS NOT NULL) OR 
       (status != 'published')
   )
);

-- =====================================================
-- TAGS TABLE
-- =====================================================
CREATE TABLE tags (
   tag_id SERIAL PRIMARY KEY,
   name VARCHAR(50) UNIQUE NOT NULL,
   slug VARCHAR(50) UNIQUE NOT NULL,
   description TEXT,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- POST-TAGS RELATIONSHIP (Many-to-Many)
-- =====================================================
CREATE TABLE post_tags (
   post_id INTEGER REFERENCES posts(post_id) ON DELETE CASCADE,
   tag_id INTEGER REFERENCES tags(tag_id) ON DELETE CASCADE,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (post_id, tag_id)
);

-- =====================================================
-- COMMENTS TABLE
-- =====================================================
CREATE TABLE comments (
   comment_id SERIAL PRIMARY KEY,
   post_id INTEGER REFERENCES posts(post_id) ON DELETE CASCADE,
   user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
   parent_id INTEGER REFERENCES comments(comment_id) ON DELETE CASCADE,
   content TEXT NOT NULL,
   status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam', 'trash')),
   ip_address VARCHAR(45),
   user_agent TEXT,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MEDIA TABLE
-- =====================================================
CREATE TABLE media (
   media_id SERIAL PRIMARY KEY,
   filename VARCHAR(255) NOT NULL,
   original_name VARCHAR(255) NOT NULL,
   file_path VARCHAR(500) NOT NULL,
   file_type VARCHAR(50),
   file_size INTEGER,
   mime_type VARCHAR(100),
   uploaded_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
   alt_text VARCHAR(255),
   caption TEXT,
   width INTEGER,
   height INTEGER,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ACTIVITY LOG TABLE
-- =====================================================
CREATE TABLE activity_log (
   log_id SERIAL PRIMARY KEY,
   user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
   action VARCHAR(100) NOT NULL,
   entity_type VARCHAR(50),
   entity_id INTEGER,
   description TEXT,
   ip_address VARCHAR(45),
   user_agent TEXT,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- Post indexes
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published ON posts(published_at);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_featured ON posts(is_featured);

-- Category indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- Comment indexes
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_status ON comments(status);

-- Tag indexes
CREATE INDEX idx_tags_slug ON tags(slug);

-- Media indexes
CREATE INDEX idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX idx_media_file_type ON media(file_type);

-- Activity log indexes
CREATE INDEX idx_activity_user ON activity_log(user_id);
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_created ON activity_log(created_at);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =====================================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA FOR TESTING
-- =====================================================
-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active, email_verified)
VALUES 
   ('admin', 'admin@educms.com', '$2a$10$8K1p/a0dL3.R.Q4Vqkj1weJH.8H8j4LQ0Uq0QZ0X0X0X0X0X0X0X0', 'Admin', 'User', 'admin', true, true),
   ('editor', 'editor@educms.com', '$2a$10$8K1p/a0dL3.R.Q4Vqkj1weJH.8H8j4LQ0Uq0QZ0X0X0X0X0X0X0X0', 'Editor', 'User', 'editor', true, true),
   ('author', 'author@educms.com', '$2a$10$8K1p/a0dL3.R.Q4Vqkj1weJH.8H8j4LQ0Uq0QZ0X0X0X0X0X0X0X0', 'Author', 'User', 'author', true, true),
   ('student', 'student@educms.com', '$2a$10$8K1p/a0dL3.R.Q4Vqkj1weJH.8H8j4LQ0Uq0QZ0X0X0X0X0X0X0X0', 'Student', 'User', 'subscriber', true, true);

-- Insert sample categories
INSERT INTO categories (name, slug, description, display_order, is_active)
VALUES 
   ('Web Development', 'web-development', 'Learn web development technologies', 1, true),
   ('Mobile Development', 'mobile-development', 'Mobile app development courses', 2, true),
   ('Data Science', 'data-science', 'Data science and analytics', 3, true),
   ('Cloud Computing', 'cloud-computing', 'Cloud platforms and services', 4, true);

-- Insert sample tags
INSERT INTO tags (name, slug, description)
VALUES 
   ('JavaScript', 'javascript', 'JavaScript programming language'),
   ('React', 'react', 'React.js library'),
   ('Node.js', 'nodejs', 'Node.js runtime'),
   ('Python', 'python', 'Python programming language'),
   ('Database', 'database', 'Database management'),
   ('API', 'api', 'API development');

-- =====================================================
-- DATABASE SCHEMA COMPLETED
-- =====================================================
