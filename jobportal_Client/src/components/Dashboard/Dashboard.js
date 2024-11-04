import React, { useState } from 'react';
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { FileText,  MoreVertical, ChevronRight, Pin } from 'lucide-react';
import { Link } from 'react-router-dom';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
export default function Dashboard_Seeker() {
  
  const initialApplications = [
    { id: 1, company: 'ABCDEFG', logo: '🟩', position: 'Social Media Assistant', location: 'Q2, Ho Chi Minh', type: 'Full-Time', date: '24 July 2021', pinned: false },
    { id: 2, company: 'ABCDEFG', logo: '🔵', position: 'Social Media Assistant', location: 'Q5, Ho Chi Minh', type: 'Full-Time', date: '23 July 2021', pinned: false },
    { id: 3, company: 'ABCDEFG', logo: '🟧', position: 'Social Media Assistant', location: 'Thanh Xuan, Ha Noi', type: 'Full-Time', date: '22 July 2021', pinned: false },
  ];
  const [applications, setApplications] = useState(initialApplications);
  const handleDelete = (id) => {
    try {
      const elementToRemove = document.getElementById(id);
      if (elementToRemove) {
        elementToRemove.remove();
      }
      // Thực hiện các hành động xóa khác
    } catch (error) {
      console.error('Error removing element:', error);
    }
  };

  const handlePin = (id) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, pinned: !app.pinned } : app
    ));
  };
  const sortedApplications = applications.sort((a, b) => {
    return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
  });
  return (
    <div>
      <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-2">Tổng đơn đã ứng tuyển</h2>
            <div className="flex items-center">
              <span className="text-5xl font-bold mr-4">45</span>
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">Lịch sử ứng tuyển</h2>
            <div className="space-y-4">
              {sortedApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl mr-4">
                      {app.logo}
                    </div>
                    <div>
                      <h3 className="font-medium">{app.position}</h3>
                      <p className="text-sm text-gray-500">{app.company} • {app.location} • {app.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-4">Ngày nộp<br />{app.date}</span>
                    {app.pinned && <Pin className="text-yellow-500 h-5 w-5 mr-2" />}
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenu.Trigger>
                      
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content className="min-w-[120px] bg-white rounded-md shadow-md">
                          <DropdownMenu.Item 
                            className="cursor-pointer p-2 hover:bg-gray-200" 
                            onClick={() => handleDelete(app.id)}
                          >
                            Xóa
                          </DropdownMenu.Item>
                          <DropdownMenu.Item 
                            className="cursor-pointer p-2 hover:bg-gray-200" 
                            onClick={() => handlePin(app.id)}
                          >
                            {app.pinned ? 'Bỏ ghim' : 'Ghim'}
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link to="/my-applications" className="text-primary font-medium inline-flex items-center">
                Xem toàn bộ lịch sử
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
