import React, { useState } from "react";

import { Loader2, PlusSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

import { Input } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createCV, getGenCVBySeeker } from "../../redux/GeneratedCV/generated_cv.thunk";
import { useDispatch } from "react-redux";

const AddCV = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const [openDialog, setOpenDialog] = useState(false);
  const [cvName, setCVName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateCV = async (event) => {
    event.preventDefault();
    setLoading(true);
  
    const cvData = { cvName: cvName };
    const response = await dispatch(createCV(cvData));
  
    // Đảm bảo loader hiển thị ít nhất 2 giây
    setTimeout(() => {
      setLoading(false);
      if (response?.payload) {
        navigate(`/create-cv/detail-cv/${response.payload.generatedCvId}`);
      }
    }, 2000);
  };
  
  return (
    <div>
      <div
        className="p-14 py-24 border items-center flex 
      justify-center bg-gray-100 rounded-lg h-[280px]
      hover:scale-105 transition-all hover:shadow-md
      cursor-pointer border-dashed"
        onClick={() => setOpenDialog(true)}
      >
        <PlusSquare />
      </div>

      <Dialog isOpen={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogContent className="sm:max-w-[425px] bg-white shadow-lg rounded-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-lg text-center font-semibold">
              Tạo CV mới
            </DialogTitle>
            <div className="text-sm text-muted-foreground">
              Đặt tên cho CV
              <Input className="my-2 w-full" placeholder="VD: CV số 1" 
              value={cvName}
              onChange={(e) => setCVName(e.target.value)} />
            </div>
          </DialogHeader>

          <DialogFooter>
            <button
              onClick={() => setOpenDialog(false)}
              className="bg-white text-black px-4 py-2 rounded"
            >
              Đóng
            </button>
            <button disabled={!cvName||loading}
            onClick={handleCreateCV} className="bg-purple-500 text-white px-4 py-2 rounded">
              {loading?
              <Loader2 className="animate-spin"/>:
              "Tạo CV"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddCV;
