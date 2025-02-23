import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { getGenCVBySeeker } from "../../redux/GeneratedCV/generated_cv.thunk";
import CVCardItem from "../../components/CV/CVCardItem";
import AddCV from "../../components/CV/AddCV";


const CVSelection = () => {
  const dispatch = useDispatch()
  const { genCvs = [] } = useSelector((store) => store.genCV);

  useEffect(() => {
      dispatch(getGenCVBySeeker());
    }, [dispatch]);
  return (
    // <div className="cv-selection">
    //   <h1>Chọn mẫu CV</h1>
    //   <div className="cv-list">
    //     {templates.map((tpl) => (
    //       <div key={tpl.id} className="cv-item" onClick={() => navigate(`/create-cv/${tpl.id}`)}>
    //         <img src={tpl.preview} alt={tpl.name} />
    //         <p>{tpl.name}</p>
    //       </div>
    //     ))}
    //   </div>
    // </div>
    <div className="p-10 md:px-20 lg:px-32">
      <h2 className="font-bold text-3xl">My Resume</h2>
      <p>Tạo CV</p>
      <div
        className="grid grid-cols-2 
        md:grid-cols-3 lg:grid-cols-5 gap-5 mt-10"
      >
        <AddCV />
        {genCvs.length > 0 && genCvs.map((cv, index)=>(
          <CVCardItem cv={cv} key={index}/>
        ))}
      </div>
    </div>
  );
};

export default CVSelection;
