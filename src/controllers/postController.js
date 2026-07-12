const Post = require('../models/Post');
const Tag = require('../models/Tag');
const { successResponse, errorResponse, paginate, getPaginationMeta, generateSlug, calculateReadingTime } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Create a new post
 */
exports.createPost = async (req, res) => {
  try {
    const { title, content, excerpt, category_id, meta_title, meta_description, meta_keywords, tags } = req.body;
    const author_id = req.user.user_id;

    // Generate slug
    const slug = generateSlug(title);

    // Check if slug already exists
    const slugExists = await Post.slugExists(slug);
    if (slugExists) {
      return res.status(400).json(errorResponse('A post with this title already exists'));
    }

    // Calculate reading time
    const reading_time = calculateReadingTime(content);

    // Create post
    const post = await Post.create({
      title,
      slug,
      content,
      excerpt: excerpt || '',
      author_id,
      category_id: category_id || null,
      meta_title: meta_title || title,
      meta_description: meta_description || excerpt || '',
      meta_keywords: meta_keywords || '',
      reading_time
    });

    // Add tags if provided
    if (tags && Array.isArray(tags)) {
      for (const tagId of tags) {
        await Tag.addToPost(post.post_id, tagId);
      }
    }

    logger.info(`Post created: ${post.post_id} by user ${author_id}`);

    res.status(201).json(successResponse(post, 'Post created successfully'));
  } catch (error) {
    logger.error(`Create post error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to create post'));
  }
};

/**
 * Get all posts
 */
exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category_id, author_id, search } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);

    const posts = await Post.getAll(pageLimit, offset, {
      category_id: category_id ? parseInt(category_id) : null,
      author_id: author_id ? parseInt(author_id) : null,
      search
    });

    const total = await Post.count({
      category_id: category_id ? parseInt(category_id) : null,
      author_id: author_id ? parseInt(author_id) : null,
      search
    });

    const paginationMeta = getPaginationMeta(total, page, pageLimit);

    res.json(successResponse({
      posts,
      pagination: paginationMeta
    }, 'Posts retrieved successfully'));
  } catch (error) {
    logger.error(`Get posts error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to retrieve posts'));
  }
};

/**
 * Get post by ID
 */
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json(errorResponse('Post not found'));
    }

    // Increment view count
    await Post.incrementViewCount(id);

    // Get tags
    const tags = await Tag.getPostTags(id);
    post.tags = tags;

    res.json(successResponse(post, 'Post retrieved successfully'));
  } catch (error) {
    logger.error(`Get post error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to retrieve post'));
  }
};

/**
 * Get post by slug
 */
exports.getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await Post.findBySlug(slug);
    if (!post) {
      return res.status(404).json(errorResponse('Post not found'));
    }

    // Increment view count
    await Post.incrementViewCount(post.post_id);

    // Get tags
    const tags = await Tag.getPostTags(post.post_id);
    post.tags = tags;

    res.json(successResponse(post, 'Post retrieved successfully'));
  } catch (error) {
    logger.error(`Get post by slug error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to retrieve post'));
  }
};

/**
 * Update post
 */
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, category_id, meta_title, meta_description, meta_keywords, status, tags } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json(errorResponse('Post not found'));
    }

    // Check authorization
    if (post.author_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json(errorResponse('Forbidden: You can only edit your own posts'));
    }

    // Generate new slug if title changed
    let slug = post.slug;
    if (title && title !== post.title) {
      slug = generateSlug(title);
      const slugExists = await Post.slugExists(slug, id);
      if (slugExists) {
        return res.status(400).json(errorResponse('A post with this title already exists'));
      }
    }

    // Calculate reading time if content changed
    let reading_time = post.reading_time;
    if (content && content !== post.content) {
      reading_time = calculateReadingTime(content);
    }

    // Update post
    const updatedPost = await Post.update(id, {
      title: title || post.title,
      slug,
      content: content || post.content,
      excerpt: excerpt !== undefined ? excerpt : post.excerpt,
      category_id: category_id !== undefined ? category_id : post.category_id,
      meta_title: meta_title || post.meta_title,
      meta_description: meta_description || post.meta_description,
      meta_keywords: meta_keywords || post.meta_keywords,
      status: status || post.status,
      reading_time
    });

    // Update tags if provided
    if (tags && Array.isArray(tags)) {
      // Remove old tags
      const oldTags = await Tag.getPostTags(id);
      for (const tag of oldTags) {
        await Tag.removeFromPost(id, tag.tag_id);
      }
      // Add new tags
      for (const tagId of tags) {
        await Tag.addToPost(id, tagId);
      }
    }

    logger.info(`Post updated: ${id}`);

    res.json(successResponse(updatedPost, 'Post updated successfully'));
  } catch (error) {
    logger.error(`Update post error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to update post'));
  }
};

/**
 * Delete post
 */
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json(errorResponse('Post not found'));
    }

    // Check authorization
    if (post.author_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json(errorResponse('Forbidden: You can only delete your own posts'));
    }

    await Post.delete(id);

    logger.info(`Post deleted: ${id}`);

    res.json(successResponse(null, 'Post deleted successfully'));
  } catch (error) {
    logger.error(`Delete post error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to delete post'));
  }
};

module.exports = exports;
