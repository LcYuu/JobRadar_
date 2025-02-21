import { Notebook } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import cvImage from '../../assets/images/common/cv.png';

const CVCardItem = ({ cv }) => {
  return (
    <Link to={'/create-cv/detail-cv/' + cv.generatedCvId}>
      <div
        className="p-14 bg-gradient-to-b from-pink-100 via-purple-200 to-blue-200 h-[280px] rounded-t-lg border-t-4"
        style={{
          borderColor: cv?.themeColor,
        }}
      >
        <div className="flex items-center justify-center h-[180px]">
          <img src={cvImage} width={80} height={80} alt="CV Image" />
        </div>
      </div>
      <h2 className="text-sm text-center my-1 pt-2">{cv.cvName}</h2>
    </Link>
  );
};

export default CVCardItem;
