import React from 'react';

const Events = () => {
  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800">Events</h1>
      <p className="text-lg text-gray-700 mt-2">
        Here are the upcoming alumni events.
      </p>
      <ul className="list-none p-0 mt-4">
        <li className="mb-2 text-gray-600">Event 1: July 15th</li>
        <li className="mb-2 text-gray-600">Event 2: August 20th</li>
      </ul>
    </div>
  );
};

export default Events;