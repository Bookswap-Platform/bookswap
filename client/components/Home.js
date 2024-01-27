import React from 'react';
import HomeNavBar from './HomeNavBar';
import HomeSearchBar from './HomeSearchBar';
import GoogleMap from './GoogleMap';

function Home() {
  return (
    <div className='home flex items-center flex-col justify-start bg-parchmentDark'>
      <HomeNavBar />
      <HomeSearchBar />
    </div>
  );
}

export default Home;
