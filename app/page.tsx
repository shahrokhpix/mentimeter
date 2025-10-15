import React from 'react';
import Link from 'next/link';

const HomePage = () => {
  return (
    <div>
      <h1>Mentimeter Clone</h1>
      <Link href="/presentations">Go to Presentations</Link>
    </div>
  );
};

export default HomePage;