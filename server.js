const express = require('express');
const mongoose = require('mongoose');
const { DATABASE_URL, PORT } = require('./config');
const blogRouter = require('./blogRouter');
const authorRouter = require('./authorRouter');

mongoose.Promise = global.Promise;

const app = express();
app.use(express.json());

/*   Router   */
app.use("/posts", blogRouter);
app.use("/authors", authorRouter);

app.use("*", function (req, res) {
    res.status(404).json({message: "Not Found"});
});


/*   Server   */

let server;

function runServer(databaseURL, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseURL, err => {
            if (err) { return reject(err); }
            server = app.listen(port, () => {
                console.log(`Listening on port ${port}`);
                resolve();
            }).on("error", err => {
                mongoose.disconnect();
                reject(err);
            })
        })
    });
}


function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log("Closing server");
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            })
        });
    });
}

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => { console.log(err) });
}

module.exports = { app, runServer, closeServer };