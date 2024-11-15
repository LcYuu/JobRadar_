import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import {
  Calendar,
  MapPin,
  Building2,
  Mail,
  Phone,
  PenSquare,
  Plus,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import { updateCompanyProfile, updateCompanyImages, getCompanyProfile } from '../../redux/Company/company.action';

const CompanyProfile_Management = () => {
  const dispatch = useDispatch();
  const { companyProfile, loading, error } = useSelector((store) => store.company);
  
  useEffect(() => {
    // Fetch company profile on component mount
    const fetchProfile = async () => {
      try {
        await dispatch(getCompanyProfile());
      } catch (error) {
        toast.error('Không thể tải thông tin công ty');
      }
    };
    fetchProfile();
  }, [dispatch]);

  const [editMode, setEditMode] = useState({
    basicInfo: false,
    contact: false,
    description: false,
    workspaceImages: false
  });

  const [formData, setFormData] = useState({
    companyName: '',
    establishedTime: '',
    location: '',
    industry: '',
    description: '',
    contact: '',
    email: '',
    logo: null,
    workspaceImages: []
  });

  useEffect(() => {
    if (companyProfile) {
      setFormData({
        companyName: companyProfile.companyName || '',
        establishedTime: companyProfile.establishedTime || '',
        location: companyProfile.address || '', // Match with backend field
        industry: companyProfile.industry?.industryName || '',
        industryId: companyProfile.industry?.industryId || null,
        cityId: companyProfile.city?.cityId || null,
        description: companyProfile.description || '',
        contact: companyProfile.contact || '',
        email: companyProfile.email || '',
        logo: companyProfile.logo || null,
        workspaceImages: companyProfile.images || [] // Match with backend field
      });
    }
  }, [companyProfile]);

  const handleEdit = (section) => {
    setEditMode(prev => ({
      ...prev,
      [section]: true
    }));
  };

  const handleSave = async (section) => {
    try {
      if (section === 'description' || section === 'contact' || section === 'basicInfo') {
        const updateData = {
          companyName: formData.companyName,
          description: formData.description,
          establishedDate: formData.establishedTime,
          address: formData.location,
          industryId: formData.industryId,
          cityId: formData.cityId,
          contact: formData.contact,
          email: formData.email,
          logo: formData.logo
        };

        await dispatch(updateCompanyProfile(updateData));
        toast.success('Cập nhật thông tin thành công!');
      } else if (section === 'workspaceImages') {
        await dispatch(updateCompanyImages(formData.workspaceImages));
        toast.success('Cập nhật hình ảnh thành công!');
      }

      setEditMode(prev => ({
        ...prev,
        [section]: false
      }));
    } catch (error) {
      toast.error(error.response?.data || 'Có lỗi xảy ra khi cập nhật!');
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      workspaceImages: [...prev.workspaceImages, ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      workspaceImages: prev.workspaceImages.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Company Header */}
      <div className="flex items-center gap-6 mb-8">
        <div className="w-24 h-24 bg-emerald-100 rounded-xl overflow-hidden">
          <img 
            src={formData.logo || '/company-placeholder.png'} 
            alt="Company Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{formData.companyName}</h1>
          <div className="flex gap-4 mt-2 text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Thành lập: {formData.establishedTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{formData.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              <span>{formData.industry}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Company Description */}
      <Card className="mb-6 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Hồ sơ công ty</h2>
          {!editMode.description ? (
            <Button onClick={() => handleEdit('description')} variant="ghost">
              <PenSquare className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          ) : (
            <Button onClick={() => handleSave('description')} variant="primary">
              Lưu
            </Button>
          )}
        </div>
        {editMode.description ? (
          <textarea
            className="w-full p-3 border rounded-md"
            rows="4"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
          />
        ) : (
          <p className="text-gray-600">{formData.description}</p>
        )}
      </Card>

      {/* Contact Information */}
      <Card className="mb-6 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Contact</h2>
          {!editMode.contact ? (
            <Button onClick={() => handleEdit('contact')} variant="ghost">
              <PenSquare className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          ) : (
            <Button onClick={() => handleSave('contact')} variant="primary">
              Lưu
            </Button>
          )}
        </div>
        {editMode.contact ? (
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Số điện thoại</label>
              <input
                type="tel"
                className="w-full p-2 border rounded-md"
                value={formData.contact}
                onChange={(e) => setFormData(prev => ({...prev, contact: e.target.value}))}
              />
            </div>
            <div>
              <label className="block mb-2">Email</label>
              <input
                type="email"
                className="w-full p-2 border rounded-md"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span>{formData.contact}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span>{formData.email}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Workspace Images */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Không gian làm việc</h2>
          {!editMode.workspaceImages ? (
            <Button onClick={() => handleEdit('workspaceImages')} variant="ghost">
              <PenSquare className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          ) : (
            <Button onClick={() => handleSave('workspaceImages')} variant="primary">
              Lưu
            </Button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {formData.workspaceImages.map((image, index) => (
            <div key={index} className="relative aspect-video">
              <img
                src={image}
                alt={`Workspace ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              {editMode.workspaceImages && (
                <button
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
                  onClick={() => removeImage(index)}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {editMode.workspaceImages && (
            <button className="aspect-video border-2 border-dashed rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-gray-400" />
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CompanyProfile_Management; 