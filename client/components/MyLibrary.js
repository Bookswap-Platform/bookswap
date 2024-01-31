import React, { useState, useEffect } from 'react';
import HomeNavBar from './HomeNavBar';
import AddBook from './AddBook';
//import BorrowedBooks from '../components/BorrowedBooks';
//import CheckedOut from '../components/CheckedOut';
import MyBooks from './MyBooks';
import { useSelector } from 'react-redux';

const MyLibrary = () => {
  // pull library data from DB here and pass to search bar as props.

  const [myLibraryBooks, setMyLibraryBooks] = useState([]);

  useEffect(() => {
    fetch('/action/getLibrary')
      .then((data) => data.json())
      .then((data) => {
        setMyLibraryBooks(data);
      });
  }, []);

  const deleteBook = ({title}) => {
    fetch('/library/action/deleteBook', {
      method: 'DELETE',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({title})
    })
    .then(data => data.json())
    .then(data => setMyLibraryBooks(data.books))
    .catch(err => console.log('App error deleting book: ', err));
  }

  return (
    <div >
      <HomeNavBar />
      {/* <MyBooks books={myLibraryBooks} /> */}
      <div className='flex justify-center items-start w-11/12 min-h-dvh bg-parchment mx-auto pt-20 px-6'>
        
      <div className='flex flex-col justify-center items-center w-1/2'>
          <h1 className='font-bold'>Add more books</h1>
          <AddBook updateBooks={(data) => setMyLibraryBooks(data)}/>
        </div>

        <div className='flex flex-col justify-center items-center w-4/12'>
          <h1
            className='mb-12 font-bold'
          >You currently have {myLibraryBooks.length > 1 ? `${myLibraryBooks.length} books` : `${myLibraryBooks.length} book`}.</h1>

          {myLibraryBooks.length > 0 ? <MyBooks books={myLibraryBooks} deleteBook={deleteBook} /> : <div>No books yet.</div>}
        </div>

        
      </div>

    </div>
  );
};

export default MyLibrary;
