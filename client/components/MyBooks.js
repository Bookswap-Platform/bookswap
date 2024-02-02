import React, { useState, useEffect } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

const MyBooks = ({ books, deleteBook }) => {
  // const [myBooks, setMyBooks] = useState([]);

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1024 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 1024, min: 800 },
      items: 4,
    },
    tablet: {
      breakpoint: { max: 800, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  // useEffect(() => {
  //   setMyBooks(mockBooks);
  // }, [mockBooks]);

  const retrievedBooks = books.map((item) => item.book);
  console.log('my retrieved books are', retrievedBooks);

  return (
    <div className='min-w-96'>
      {/* <Carousel responsive={responsive}> */}
        {retrievedBooks.map(
          (book, index) =>
            book && (
              <div
                className='flex justify-start items-center w-full mb-14'
                key={index}>
                <img src={book.previewUrl} style={{ height: '200px' }}></img>
                <div className='flex flex-col ml-8'>
                  <li>
                    <b>{book.title}</b>
                  </li>
                  <li>{book.author}</li>
                  
                <button
                  className='w-24'
                  onClick={() => {
                    const confirmDelete = window.confirm(
                      'Are you sure you want to delete this book?'
                    );
                    if (confirmDelete) deleteBook({ title: book.title });
                  }}
                >
                  Delete
                </button>
                </div>
                {/* <li>{book.genre}</li> */}
                {/* Add other book details as needed */}
              </div>
            )
        )}
      {/* </Carousel> */}
    </div>
  );
};

export default MyBooks;
