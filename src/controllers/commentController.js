const Comment = require('../models/Comment');
const { successResponse, errorResponse, paginate, getPaginationMeta } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Create a new comment
 */
exports.createComment = async (req, res) => {
  try {
    const { post_id, content, parent_id } = req.body;
    const user_id = req.user.user_id;
    const ip_address = req.ip;
    const user_agent = req.get('user-agent');

    // Create comment
    const comment = await Comment.create({
      post_id,
      user_id,
      parent_id: parent_id || null,
      content,
      ip_address,
      user_agent
    });

    logger.info(`Comment created: ${comment.comment_id} on post ${post_id}`);

    res.status(201).json(successResponse(comment, 'Comment created successfully'));
  } catch (error) {
    logger.error(`Create comment error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to create comment'));
  }
};

/**
 * Get comments for a post
 */
exports.getPostComments = async (req, res) => {
  try {
    const { post_id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);

    const comments = await Comment.getPostComments(post_id, pageLimit, offset, 'approved');
    const total = await Comment.countPostComments(post_id, 'approved');
    const paginationMeta = getPaginationMeta(total, page, pageLimit);

    res.json(successResponse({
      comments,
      pagination: paginationMeta
    }, 'Comments retrieved successfully'));
  } catch (error) {
    logger.error(`Get post comments error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to retrieve comments'));
  }
};

/**
 * Get all comments (for moderation)
 */
exports.getAllComments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);

    const comments = await Comment.getAll(pageLimit, offset, status || null);
    const total = await Comment.count(status || null);
    const paginationMeta = getPaginationMeta(total, page, pageLimit);

    res.json(successResponse({
      comments,
      pagination: paginationMeta
    }, 'Comments retrieved successfully'));
  } catch (error) {
    logger.error(`Get all comments error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to retrieve comments'));
  }
};

/**
 * Get comment by ID
 */
exports.getCommentById = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json(errorResponse('Comment not found'));
    }

    res.json(successResponse(comment, 'Comment retrieved successfully'));
  } catch (error) {
    logger.error(`Get comment error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to retrieve comment'));
  }
};

/**
 * Update comment
 */
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, status } = req.body;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json(errorResponse('Comment not found'));
    }

    // Check authorization
    if (comment.user_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json(errorResponse('Forbidden: You can only edit your own comments'));
    }

    // Update comment
    const updatedComment = await Comment.update(id, {
      content: content || comment.content,
      status: status || comment.status
    });

    logger.info(`Comment updated: ${id}`);

    res.json(successResponse(updatedComment, 'Comment updated successfully'));
  } catch (error) {
    logger.error(`Update comment error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to update comment'));
  }
};

/**
 * Delete comment
 */
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json(errorResponse('Comment not found'));
    }

    // Check authorization
    if (comment.user_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json(errorResponse('Forbidden: You can only delete your own comments'));
    }

    await Comment.delete(id);

    logger.info(`Comment deleted: ${id}`);

    res.json(successResponse(null, 'Comment deleted successfully'));
  } catch (error) {
    logger.error(`Delete comment error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to delete comment'));
  }
};

/**
 * Approve comment
 */
exports.approveComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json(errorResponse('Comment not found'));
    }

    const approvedComment = await Comment.approve(id);

    logger.info(`Comment approved: ${id}`);

    res.json(successResponse(approvedComment, 'Comment approved successfully'));
  } catch (error) {
    logger.error(`Approve comment error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to approve comment'));
  }
};

/**
 * Reject comment
 */
exports.rejectComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json(errorResponse('Comment not found'));
    }

    const rejectedComment = await Comment.reject(id);

    logger.info(`Comment rejected: ${id}`);

    res.json(successResponse(rejectedComment, 'Comment rejected successfully'));
  } catch (error) {
    logger.error(`Reject comment error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to reject comment'));
  }
};

/**
 * Get comment replies
 */
exports.getCommentReplies = async (req, res) => {
  try {
    const { id } = req.params;

    const replies = await Comment.getReplies(id);

    res.json(successResponse(replies, 'Replies retrieved successfully'));
  } catch (error) {
    logger.error(`Get comment replies error: ${error.message}`);
    res.status(500).json(errorResponse('Failed to retrieve replies'));
  }
};

module.exports = exports;
