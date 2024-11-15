import React from 'react';
import { Card } from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { useNavigate, Link } from "react-router-dom";

const CompanyCard = ({ company, variant = "default" }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/companies/${company.companyId}`);
  };

  if (variant === "suggested") {
    return (
      <Link 
        to={`/companies/${company.companyId}`} 
        className="block"
        onClick={(e) => {
          console.log("Clicked company:", company.companyId);
        }}
      >
        <Card key={company.companyId} className="p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-4">
            <img
              src={company.logo}
              alt={`${company.companyName} logo`}
              className="h-12 w-12 rounded-lg shadow-md"
            />
            <div>
              <h3 className="font-semibold">{company.companyName}</h3>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{company.description}</p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="transition duration-200 hover:bg-gray-200"
              onClick={handleCardClick}
            >
              Xem các công việc
            </Button>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link 
      to={`/company-profile/${company.companyId}`} 
      className="block"
      onClick={(e) => {
        console.log("Clicked company:", company.companyId);
      }}
    >
      <Card 
        onClick={handleCardClick}
        className="p-6 space-y-4 transition-transform duration-300 hover:scale-105 cursor-pointer shadow-lg"
      >
        <div className="flex items-center gap-4">
          <img
            src={company.logo}
            alt={`${company.companyName} logo`}
            className="h-16 w-16 rounded-lg shadow-md"
          />
          <div>
            <h3 className="font-semibold text-lg">{company.companyName}</h3>
            <p className="text-sm text-primary">{company.countJob} Jobs</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{company.description}</p>
        <div className="flex flex-wrap gap-2">
          <Badge className="text-xs">{company.industryName}</Badge>
        </div>
      </Card>
    </Link>
  );
};

export default CompanyCard; 