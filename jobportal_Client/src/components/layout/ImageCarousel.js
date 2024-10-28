// ImageCarousel.js
import React from 'react';

const ImageCarousel = ({ logo }) => {
  return (
    <div className="w-24 h-24 mb-4 rounded-full overflow-hidden">
      <img src={logo} alt="Company logo" className="object-cover w-full h-full" />
    </div>
  );
};

export default ImageCarousel;
