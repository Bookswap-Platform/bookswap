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

  const borderStyle = searchBook ?  'border-2' : '';

  return (
    <div className='home-container w-11/12 px-16 pt-16 h-dvh bg-parchment box-border'>
      <div className=''>

      </div>
      <div className='w-1/3 h-4/5 flex flex-col'>
        <div className='font-bold'>Search for a book</div>
          <input 
            className='rounded mt-0 border-0 border-b-4 h-12 w-full bg-parchment '
            type='text'
            placeholder='Find a book'
            value={searchBook}
            onChange={(e) => setSearchBook(e.target.value)}
          />
          <div className={'rounded mt-2 full overflow-y-auto ' + borderStyle +  ' border-solid border-parchmentDark'}>
            {searchBook &&
              filteredBooks.map((book, index) => (
                <div 
                  key={index} 
                  onClick={() => handleBookSelect(book)}
                  className={'p-3 border-1 outline-1 border-b-darkGreen border-b-2 bg-parchment hover:cursor-pointer hover:bg-parchmentDark flex items-center'}>
                  
                  <img 
                    className='rounded object-cover w-20 mr-8' 
                    src={book.previewUrl} 
                    />
                  <div className=''>

                    <div className={'font-bold text-lg mt-2'}>{book.title}</div>
                    <div className='italic text-sm'>{book.author}</div>
                    {/* <li>{book.genre}</li> */}
                    <div>{book.fullAddress}</div>
                  </div>
                  
                </div>
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
        className='google-map w-5/6 h-dvh'
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
