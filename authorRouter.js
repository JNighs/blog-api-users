const express = require('express');
const router = express.Router();

const { BlogPost, Author } = require('./models');

router.post("/", (req, res) => {
    //Check if body contains required content
    const requiredFields = ["firstName", "lastName", "userName"];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }
    //Check if author_id is valid
    const inputUser = req.body.userName;
    Author.count({ userName: inputUser }, function (err, count) {
        if (count > 0) {
            const message = `Author name \`${inputUser}\` already exists`;
            console.error(message);
            return res.status(400).send(message);
        }
    });
    //Create post
    Author.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
    }).then(author => res.status(201).json(author))
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
    const updateableFields = ["firstName", "lastName", "userName"];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    Author
        .findByIdAndUpdate(req.params.id, { $set: toUpdate })
        .then(author => res.status(200).json(author))
        .catch(err => res.status(500).json({ message: "Internal server error" }));
});

router.delete("/:id", (req, res) => {
    BlogPost.remove({ author: req.params.id })
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: "Internal server error" });
        })

    Author.findByIdAndRemove(req.params.id)
        .then(post => res.status(204).end())
        .catch(err => res.status(500).json({ message: "Internal server error" }));

});

module.exports = router;