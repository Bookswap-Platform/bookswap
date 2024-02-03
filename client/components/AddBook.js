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
      <div className="w-11/12">
        <div>
          {" "}
          <input
            className="add-search-bar block mx-auto"
            type="text"
            placeholder="Search a book title to add to your library"
            value={searchBook}
            onChange={(e) => setSearchBook(e.target.value)}
          />
        </div>

        <div>
          <button className="block mx-auto w-full" onClick={buttonOnClick}>
            Search Book
          </button>
          {/* <Modal isOpen={isModalOpen} onClose={closeModal}>
                    {selectedBook && (
                        <ul>
                            <img src={selectedBook.previewUrl} className="resized-image"></img>
                            <p>Title: {selectedBook.title}</p>
                            <p>Author: {selectedBook.author}</p>
                            <button onClick={() => {
                                addButtonOnClick();
                                closeModal();
                            }} >
                                Add Book
                            </button>
                        </ul>
                    )}
                </Modal> */}
          {isModalOpen && selectedBook.length > 0 && (
            <Modal isOpen={isModalOpen} onClose={closeModal}>
              <ul style={booklist}>
                {selectedBook.map((book, index) => (
                  <li key={index} className="hover:bg-parchment py-8">
                    <div className="flex justify-start items-center">
                      <img
                        src={book.previewUrl}
                        className="resized-image h-32 max-w-20 mx-8"
                        alt={`Book cover for ${book.title}`}
                      />
                      <div className="w-48">
                        <p>Title: {book.title}</p>
                        <p>Author: {book.author}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-between">
                      <button
                        className="mb-0 w-10/12"
                        onClick={() => {
                          console.log(">>> click this book: ", book);
                          addButtonOnClick(book);
                          closeModal();
                        }}
                      >
                        Add Book
                      </button>
                      <button
                        className="w-10/12"
                        onClick={() => openModal(index)}
                      >
                        View Details
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </Modal>
          )}
        </div>
      </div>
    );
}

export default AddBook;
