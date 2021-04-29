/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const mongodb = require("mongodb");
const mongoose = require("mongoose");

let uri = process.env.DB;

module.exports = function (app) {
  mongoose.connect(
    uri,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
      console.log(mongoose.connection.readyState);
    }
  );
  let db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error"));

  let bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    comments: [String],
  });

  let Book = mongoose.model("Book", bookSchema);

  app
    .route("/api/books")
    .get(async function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      let arrayOfBooks = [];
      Book.find({}, function (err, results) {
        if (!err && results) {
          results.forEach((result) => {
            let book = result.toJSON();
            book["commentcount"] = book.comments.length;
            arrayOfBooks.push(book);
          });
          return res.json(arrayOfBooks);
        }
      });
    })

    .post(async function (req, res) {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) {
        return res.json("missing required field title");
      }
      let newBook = new Book({
        title: title,
        comments: [],
      });
      newBook.save((err, data) => {
        if (!err && data) {
          return res.json(data);
        }
      });
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'
      Book.remove({}, function (error, status) {
        if (error) {
          console.log(error);
        } else {
          return res.json("complete delete successful");
        }
      });
    });

  app
    .route("/api/books/:id")
    .get(function (req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      Book.findById(bookid, function (err, results) {
        if (!err && results) {
          return res.json(results);
        } else if (!results) {
          return res.json("no book exists");
        }
      });
    })

    .post(function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      if (!comment) {
        return res.json("missing required field comment");
      }
      //json res format same as .get
      Book.findByIdAndUpdate(
        bookid,
        { $push: { comments: comment } },
        { new: true },
        function (err, results) {
          if (!err && results) {
            return res.json(results);
          } else if (!results) {
            return res.json("no book exists");
          }
        }
      );
    })

    .delete(function (req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      Book.findByIdAndDelete(bookid, function (err, result) {
        if (!err && result) {
          return res.json("delete successful");
        } else if (!result) {
          return res.json("no book exists");
        }
      });
    });
};
