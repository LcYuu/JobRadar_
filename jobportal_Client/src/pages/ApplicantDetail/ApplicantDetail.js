import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "../../ui/button";
import { ChevronLeft, Mail, Phone, Instagram, Twitter, Globe, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tab";

const ApplicantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("applicant-profile");

  // Mock data - thay thế bằng API call thực tế
  const applicant = {
    id: 1,
    fullName: "Jerome Bell",
    avatar: "/avatars/jerome.jpg",
    rating: 4.0,
    position: "Product Designer",
    appliedJob: {
      title: "Product Development",
      department: "Marketing",
      type: "Full-Time",
      appliedDate: "2 days ago",
      stage: "Interview",
      progress: 75
    },
    contact: {
      email: "jeromeBell45@email.com",
      phone: "+44 1245 572 135",
      instagram: "instagram.com/jeromebell",
      twitter: "twitter.com/jeromebell",
      website: "www.jeromebell.com"
    },
    personalInfo: {
      gender: "Male",
      dateOfBirth: "March 23, 1995",
      age: "26 y.o",
      language: "English, French, Bahasa",
      address: "4517 Washington Ave. Manchester, Kentucky 39495"
    },
    professionalInfo: {
      aboutMe: "I'm a product designer + filmmaker currently working remotely at Twitter from beautiful Manchester, United Kingdom. I'm passionate about designing digital products that have a positive impact on the world.",
      experience: "For 10 years, I've specialised in interface, experience & interaction design as well as working in user research and product strategy for product agencies, big tech companies & start-ups.",
      currentJob: "Product Designer",
      experienceYears: "4 Years",
      education: "Bachelors in Engineering",
      skills: ["Project Management", "Copywriting", "English"]
    }
  };

  const contactIcons = {
    email: <Mail className="w-4 h-4 text-gray-500" />,
    phone: <Phone className="w-4 h-4 text-gray-500" />,
    instagram: <Instagram className="w-4 h-4 text-gray-500" />,
    twitter: <Twitter className="w-4 h-4 text-gray-500" />,
    website: <Globe className="w-4 h-4 text-gray-500" />
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Applicant Details
        </Button>
        <Button variant="outline">More Action</Button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="col-span-1">
            <div className="text-center">
              <img 
                src={applicant.avatar} 
                alt={applicant.fullName}
                className="w-24 h-24 rounded-full mx-auto mb-3"
              />
              <h1 className="text-xl font-semibold">{applicant.fullName}</h1>
              <p className="text-gray-600">{applicant.position}</p>
              <div className="flex items-center justify-center mt-2">
                <span className="text-yellow-500">★</span>
                <span className="ml-1">{applicant.rating}</span>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-2">Applied Jobs</h3>
                <p className="text-sm text-gray-600">{applicant.appliedJob.title}</p>
                <p className="text-sm text-gray-500">
                  {applicant.appliedJob.department} • {applicant.appliedJob.type}
                </p>
                <p className="text-xs text-gray-400 mt-1">{applicant.appliedJob.appliedDate}</p>
              </div>

              <div className="mt-4">
                <p className="text-sm mb-2">Stage: {applicant.appliedJob.stage}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{width: `${applicant.appliedJob.progress}%`}}
                  />
                </div>
              </div>

              <Button 
                variant="default" 
                className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Schedule Interview
              </Button>

              <div className="mt-8">
                <h3 className="font-medium text-left mb-4">Contact</h3>
                <div className="space-y-3">
                  {Object.entries(applicant.contact).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3 text-left">
                      {contactIcons[key]}
                      <a href="#" className="text-sm text-gray-600 hover:text-indigo-600">
                        {value}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-2">
            <Tabs defaultValue="applicant-profile" className="w-full">
              <TabsList className="border-b border-gray-200">
                <TabsTrigger 
                  value="applicant-profile"
                  className={`px-4 py-2 -mb-px ${
                    activeTab === "applicant-profile" 
                      ? "text-indigo-600 border-b-2 border-indigo-600" 
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("applicant-profile")}
                >
                  Applicant Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="resume"
                  className={`px-4 py-2 -mb-px ${
                    activeTab === "resume" 
                      ? "text-indigo-600 border-b-2 border-indigo-600" 
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("resume")}
                >
                  Resume
                </TabsTrigger>
              </TabsList>

              <TabsContent value="applicant-profile" className="pt-6">
                <div className="grid grid-cols-3 gap-6">
                  {/* Left Column */}
                  {/* <div className="col-span-1 space-y-6"> */}
                    {/* <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h2 className="font-semibold mb-4">Applied Jobs</h2>
                      <div className="space-y-2">
                        <p className="font-medium">{applicant.appliedJob.title}</p>
                        <p className="text-sm text-gray-600">
                          {applicant.appliedJob.department} • {applicant.appliedJob.type}
                        </p>
                        <p className="text-sm text-gray-500">{applicant.appliedJob.appliedDate}</p>
                        <div className="mt-4">
                          <p className="text-sm mb-2">Stage: {applicant.appliedJob.stage}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{width: `${applicant.appliedJob.progress}%`}}
                            />
                          </div>
                        </div>
                      </div>
                    </div> */}

                    {/* <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h2 className="font-semibold mb-4">Contact</h2>
                      <div className="space-y-4">
                        {Object.entries(applicant.contact).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-3">
                            {contactIcons[key]}
                            <div>
                              <p className="text-sm">{value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div> */}
                  {/* </div> */}

                  {/* Right Column */}
                  <div className="col-span-3 space-y-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h2 className="font-semibold mb-4">Personal Info</h2>
                      <div className="grid grid-cols-2 gap-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Full Name</p>
                          <p className="text-sm">{applicant.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Gender</p>
                          <p className="text-sm">{applicant.personalInfo.gender}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Date of Birth</p>
                          <p className="text-sm">{applicant.personalInfo.dateOfBirth} ({applicant.personalInfo.age})</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Language</p>
                          <p className="text-sm">{applicant.personalInfo.language}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="text-sm">{applicant.personalInfo.address}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h2 className="font-semibold mb-4">Professional Info</h2>
                      <div className="space-y-6">
                        <div>
                          <p className="text-sm text-gray-600">About Me</p>
                          <p className="text-sm mt-1">{applicant.professionalInfo.aboutMe}</p>
                          <p className="text-sm mt-2">{applicant.professionalInfo.experience}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Current Job</p>
                            <p className="text-sm">{applicant.professionalInfo.currentJob}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Experience in Years</p>
                            <p className="text-sm">{applicant.professionalInfo.experienceYears}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Highest Qualification Held</p>
                            <p className="text-sm">{applicant.professionalInfo.education}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Skill set</p>
                            <div className="flex gap-2 mt-1">
                              {applicant.professionalInfo.skills.map((skill, index) => (
                                <span 
                                  key={index}
                                  className="text-sm text-indigo-600"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="resume">
                <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
                  <h2 className="font-semibold mb-4">Resume</h2>
                  <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Resume preview will be displayed here</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetail; 