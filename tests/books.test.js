const request = require("supertest");
const app = require("../app");
const Book = require("../models/book");

process.env.NODE_ENV = "test";

const db = require("../db");

let b1;

describe("Book Routes Test", function () {

    beforeEach(async function () {
        await db.query("DELETE FROM books");

        b1 = await Book.create({
            isbn: "0590353403",
            amazon_url: "https://a.co/d/9xbC0He",
            author: "J.K. Rowling",
            language: "english",
            pages: 309,
            publisher: "Scholastic Press",
            title: "Harry Potter and the Sorcerer's Stone",
            year: 1998
        });
    });

    /** GET / => {books: [book, ...]}  */
    describe("GET /books/", function () {
        test("can get a list of books", async function () {
            const response = await request(app).get("/books");
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ books: [b1] });
        });
    });

    /** GET /[id]  => {book: book} */
    describe("GET /books/:isbn", function () {
        test("can get details for a single book", async function () {
            const response = await request(app).get(`/books/${b1.isbn}`);
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ book: b1 });
        });
    });

    /** POST /   bookData => {book: newBook}  */
    describe("POST /books/", function () {
        test("can add a new book", async function () {
            const response = await request(app).post("/books")
                .send({
                    isbn: "0439064866",
                    amazon_url: "https://a.co/d/0iYWYn4",
                    author: "J.K. Rowling",
                    language: "english",
                    pages: 352,
                    publisher: "Scholastic Press",
                    title: "Harry Potter and the Chamber of Secrets",
                    year: 1999
                });
            expect(response.statusCode).toBe(201);
            expect(response.body).toEqual({
                book: {
                    isbn: "0439064866",
                    amazon_url: "https://a.co/d/0iYWYn4",
                    author: "J.K. Rowling",
                    language: "english",
                    pages: 352,
                    publisher: "Scholastic Press",
                    title: "Harry Potter and the Chamber of Secrets",
                    year: 1999
                }
            });
        });

        test("invalid data gets validation error", async function () {
            const response = await request(app).post("/books")
                .send({
                    isbn: 439064866,
                    amazon_url: "a.co/d/0iYWYn4",
                    language: "english",
                    pages: "352",
                    publisher: "Scholastic Press",
                    title: "Harry Potter and the Chamber of Secrets",
                    year: 1999
                });
            expect(response.statusCode).toBe(400);
        })
    });

    /** PUT /[isbn]   bookData => {book: updatedBook}  */
    describe("PUT /books/:isbn", function () {
        test("can update a book", async function () {
            const response = await request(app).put(`/books/${b1.isbn}`)
                .send({
                    isbn: "0590353403",
                    amazon_url: "https://a.co/d/9xbC0He",
                    author: "J.K. Rowling",
                    language: "english",
                    pages: 309,
                    publisher: "Scholastic Press",
                    title: "Harry Potter and the Philosopher's Stone",
                    year: 1998
                });
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                book: {
                    isbn: "0590353403",
                    amazon_url: "https://a.co/d/9xbC0He",
                    author: "J.K. Rowling",
                    language: "english",
                    pages: 309,
                    publisher: "Scholastic Press",
                    title: "Harry Potter and the Philosopher's Stone",
                    year: 1998
                }
            });
        });
    });

    /** DELETE /[isbn]   => {message: "Book deleted"} */
    describe("DELETE /books/:isbn", function () {
        test("can delete a book", async function () {
            const response = await request(app).delete(`/books/${b1.isbn}`);
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ message: "Book deleted" });
        });
    });

    afterAll(async function () {
        // close db connection
        await db.end();
    });
});