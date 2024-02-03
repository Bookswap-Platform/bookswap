import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BookSwapLogo from '../assets/images/BookSwap_02.png';
// import BookSwapLogo from '../assets/images/BookSwap.png';

function HomeNavBar() {
  const [unread, setUnread] = useState('');
  useEffect(() => {
    fetch('/action/getNotifications')
      .then((data) => data.json())
      .then((data) => {
        const newUnread = data.filter((item) => item.read === false);
        // console.log(newUnread);
        setUnread(newUnread.length);
      })
      .catch((err) =>
        console.log('App error getting number of unread notifications: ', err)
      );
  });

  const linkClasses = 'text-parchment hover:text-yellow hover:bg-darkGreenHover font-light flex items-center h-14 px-5 mx-4';

  const h2Classes = ''

  const logoClasses = 'p-2 hover:bg-darkGreenHover'

  return (
    <div className='flex justify-center bg-darkGreen w-full'>

      <nav className='flex flex-row justify-center items-center px-20 border-b-1 border-solid border-gray-500 bg-darkGreen text-parchment h-15 w-4/5'>

        <Link to='/home'>
          <img
            src={BookSwapLogo}
            style={{ width: '70px' }}
            className={'bookswap-logo ' + logoClasses}
            />
        </Link>

        <Link to='/myLibrary' className={linkClasses}>
          <h2 className={h2Classes}>My Library</h2>
        </Link>

        <Link to='/requests' className={linkClasses}>
          <h2 className={h2Classes}>Requests</h2>
        </Link>

        <Link to='/notifications' className={linkClasses}>
          <h2 className={h2Classes}>Notifications ({unread} unread)</h2>
        </Link>

        <Link to='/profile' className={linkClasses}>
          <h2 className={h2Classes}>Profile</h2>
        </Link>

        <h2>
          <a href='/action/logout' className={linkClasses}>Log out</a>
        </h2>
        
      </nav>
    </div>
  );
}

export default HomeNavBar;
