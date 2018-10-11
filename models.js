"use strict";

const mongoose = require('mongoose');

/*   Schemas   */

const authorSchema = mongoose.Schema({
    firstName: 'string',
    lastName: 'string',
    userName: {
        type: 'string',
        unique: true
    }
});

const commentSchema = mongoose.Schema({
    content: 'string'
});

const blogPostSchema = mongoose.Schema({
    title: 'string',
    content: 'string',
    author: { type: mongoose.Schema.Types.ObjectId, ref: "Author" },
    comments: [commentSchema]
});

/*   Virtuals   */

blogPostSchema.virtual('authorName').get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogPostSchema.methods.serialize = function () {
    return {
        id: this._id,
        title: this.title,
        content: this.content,
        author: this.authorName
    }
}

blogPostSchema.methods.serializeWithComments = function () {
    return {
        id: this._id,
        title: this.title,
        content: this.content,
        author: this.authorName,
        comments: this.comments
    }
}

/*   Middleware to populate author on .find() and findOne()  */

blogPostSchema.pre('findOne', function(next) {
    this.populate('author');
    next();
})

blogPostSchema.pre('find', function(next){
    this.populate('author');
    next();
});

/*   Models   */

const Author = mongoose.model('Author', authorSchema);
const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = {BlogPost, Author};