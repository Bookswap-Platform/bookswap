/**
 * ************************************
 *
 * @module  AddBook.js
 * @author
 * @date
 * @description search bar that takes input and adds book to personal library
 *
 * ************************************
 */

import React from 'react'
import { useState, useEffect } from 'react';
import MyBooks from './MyBooks';
import Modal from './modal';


const AddBook = ({ updateBooks }) => {
    const [books, setBooks] = useState([]);
    const [searchBook, setSearchBook] = useState('');
    const [selectedBook, setSelectedBook] = useState([]);

    const [isModalOpen, setModalOpen] = useState(false);
    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    //make POST request for book data: /library/addBook
    //checks global library first before making API call, for performance

    const handleBookSelect = (book) => {
        console.log(`>>> book in handleBookSelect: ${book}`)
        fetch('/library/action/findBook', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title: book }),
        })
            .then(data => data.json())
            .then(data => {
                setSelectedBook(data); // >>>>>>>>>>>>>>>>>>>>>>>   there are five books
                setSearchBook('');
            })
    };
    // throw handler here for adding book
    // POST to library/action/addBook

    const handleAddBook = (book) => {
        console.log(">>> book is selected: ", book);
        fetch('/library/action/addBook', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(book),
        })
            .then(data => data.json())
            .then(data => updateBooks(data))
            .then(data => console.log(">>> selected book to library: ", data))
            .catch(err => console.log('APP error adding book: ', err))
    }

    const addButtonOnClick = (book) => {
        handleAddBook(book);
    }

    const buttonOnClick = () => {
        openModal();
        handleBookSelect(searchBook);
    }

    const booklist = {
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
      height:"50dvh"
    };

    return (
      <>
        <div>
          {" "}
          <input
            className="add-search-bar"
            type="text"
            placeholder="Search a book title to add to your library"
            value={searchBook}
            onChange={(e) => setSearchBook(e.target.value)}
          />
        </div>

        <div>
          <button onClick={buttonOnClick}>Search Book</button>
          {isModalOpen && selectedBook.length > 0 && (
          <Modal isOpen={isModalOpen} onClose={closeModal}>
            <ul style={booklist}>
              {selectedBook.map((book, index) => (
                <li key={index}>
                  <img
                    src={book.previewUrl}
                    className="resized-image"
                    alt={`Book cover for ${book.title}`}
                  />
                  <p>Title: {book.title}</p>
                  <p>Author: {book.author}</p>
                  <button
                    onClick={() => {
                      console.log(">>> click this book: ", book)
                      addButtonOnClick(book);
                      closeModal();
                    }}
                  >
                    Add Book
                  </button>
                  <button onClick={() => openModal(index)}>View Details</button>
                </li>
              ))}
            </ul>
          </Modal>
          )}
        </div>
      </>
    );
}

export default AddBook;
