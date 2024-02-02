import React, { useEffect, useState } from 'react';
import GoogleMap from './GoogleMap';

function HomeSearchBar() {
  const [books, setBooks] = useState([]);
  const [searchBook, setSearchBook] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookAddress, setBookAddress] = useState('');
  const [user, setUser] = useState({});

  useEffect(() => {
    fetch('/library/action/globalLibrary')
      .then((res) => res.json())
      .then((data) => {
        // console.log(data);
        setBooks(data);
      });

    fetch('/action/getUser')
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.log('App error getting user:', err));
  }, []);

  // useEffect(() => {
  //   console.log('SEARCHBOOK->', searchBook);
  // }, []);

  const filteredBooks = books.filter((book) => {
    return book.title.toLowerCase().includes(searchBook.toLowerCase());
  });

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    setSearchBook('');
    fetch('library/action/retrieveBook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: book.title }),
    })
      .then((data) => data.json())
      .then((data) => {
        console.log('address data ->', data);
        setBookAddress(data);
      });
  };

  const handleRequestBook = (book, reqUsername, resUsername) => {
    console.log(`book is ${book}, requsername is ${reqUsername}, resUsenrame is ${resUsername}`)
    fetch('/library/action/sendSwapRequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ book: book, reqUsername: reqUsername, resUsername: resUsername })
    })
      .then((data) => data.json())
      .catch((err) => console.log('error requesting book: ', err));
  };

  return (
    <div className='home-container w-11/12 px-16 ptb-20 h-dvh bg-parchment '>
      <div className='w-1/4 h-full flex flex-col '>
        {/* <h1>Search for a book</h1> */}
          <input 
            className='rounded border-0 border-b-4 h-12 bg-parchment fixed'
            type='text'
            placeholder='Find a book'
            value={searchBook}
            onChange={(e) => setSearchBook(e.target.value)}
          />
          <div className='rounded mt-10 h-7/8 overflow-y-auto'>
            {searchBook &&
              filteredBooks.map((book, index) => (
                <ul key={index} className={'p-3 px-0 border-b-2 border-parchment flex flex-col justify-center items-center'}>
                  <img className='rounded object-cover w-full h-full' src={book.previewUrl} onClick={() => handleBookSelect(book)}/>
                  <li className={'font-bold text-lg mt-2'}>{book.title}</li>
                  <li className='italic text-sm'>{book.author}</li>
                  {/* <li>{book.genre}</li> */}
                  <li>{book.fullAddress}</li>
                  
                </ul>
              ))}
          </div>
          <div>
            {selectedBook && (
              <ul>
                <img src={selectedBook.previewUrl} />
                <li>{selectedBook.title}</li>
                <li>{selectedBook.author}</li>
              </ul>
            )}
          </div>
      </div>
      <GoogleMap
        bookAddress={bookAddress[0]}
        selectedBook={selectedBook}
        className='google-map w-3/4'
        handleRequestBook={handleRequestBook}
        reqUsername={user.username}
      />
    </div>
  );
}

// Route to request a swap: post /library/action/sendSwapRequest
// Request body should include: { book, reqUsername and resUsername }
// The book should be an object i.e. include title, author, previewUrl

export default HomeSearchBar;

// fetch('library/action/retrieveBook', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   body: JSON.stringify({ title: book }),
// })
//   .then((data) => data.json())
//   .then((data) => {
//     console.log(data);
