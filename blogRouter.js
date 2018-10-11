const express = require('express');
const router = express.Router();

const { BlogPost, Author } = require('./models');

router.get("/", (req, res) => {
    BlogPost.find().limit(10).then(blogPosts => {
        res.json({
            blogPosts: blogPosts.map(post => post.serialize())
        })
    })
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: "Internal server error" });
        })
});

router.get("/:id", (req, res) => {
    BlogPost
        .findById(req.params.id)
        .then(post => res.json(post.serializeWithComments()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        });
});

router.post("/", (req, res) => {
    //Check if body contains required content
    const requiredFields = ["title", "content", "author_id"];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }
    //Check if author_id is valid
    const inputID = req.body.author_id;
    Author.count({ _id: inputID }, function (err, count) {
        if (err) {
            const message = `No author found by ID: ${inputID}`;
            console.error(message);
            return res.status(400).send(message);
        }
    });
    //Create post
    BlogPost.create({
        title: req.body.title,
        content: req.body.content,
        author: inputID,
    }).then(post => res.status(201).json(post.serializeWithComments()))
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: "Internal server error" });
        })
});

router.put("/:id", (req, res) => {
    // ensure that the id in the request path and the one in request body match
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message =
            `Request path id (${req.params.id}) and request body id ` +
            `(${req.body.id}) must match`;
        console.error(message);
        return res.status(400).json({ message: message });
    }

    const toUpdate = {};
    const updateableFields = ["title", "content"];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    BlogPost
        .findByIdAndUpdate(req.params.id, { $set: toUpdate })
        .then(post => res.status(200).json(post.serializeWithComments()))
        .catch(err => res.status(500).json({ message: "Internal server error" }));
});

router.delete("/:id", (req, res) => {
    BlogPost.findByIdAndRemove(req.params.id)
        .then(post => res.status(204).end())
        .catch(err => res.status(500).json({ message: "Internal server error" }));
});

module.exports = router;