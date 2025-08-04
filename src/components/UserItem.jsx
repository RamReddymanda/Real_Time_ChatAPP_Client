// components/UserItem.jsx
import React from 'react';

const UserItem = ({ username, onClick }) => {
  
  
  return (
    <div
      onClick={onClick}
      className="p-4 border-b hover:bg-gray-200 cursor-pointer flex justify-between items-center"
    >
      <span>{username}</span>
      {/* <span className="h-2 w-2 rounded-full bg-green-500"></span> */}
    </div>
  );
};

export default UserItem;
