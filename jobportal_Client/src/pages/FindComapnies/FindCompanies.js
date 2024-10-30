"use client";

import { useState } from "react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import {
  Search,
  Briefcase,
  Code,
  Building2,
  Globe,
  MapPin,
} from "lucide-react";
import logo from "../../assets/images/common/logo.jpg";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
const categoryStyles = {
  Design: {
    backgroundColor: "rgba(0, 128, 0, 0.1)",
    color: "green",
  },
  Business: {
    backgroundColor: "rgba(128, 0, 128, 0.1)",
    color: "purple",
  },
  Marketing: {
    backgroundColor: "rgba(255, 165, 0, 0.1)",
    color: "orange",
  },
  Technology: {
    backgroundColor: "rgba(0, 0, 255, 0.1)",
    color: "blue",
  },
  Education: {
    backgroundColor: "rgba(255, 192, 203, 0.1)",
    color: "pink",
  },
};

// Sample data for recommended companies
const recommendedCompanies = [
  {
    id: 1,
    name: "Nomad",
    logo: logo,
    jobCount: 3,
    description:
      "Nomad is located in Paris, France. Nomad has generated $728,000 in sales (USD).",
    category: "Business",
  },
  {
    id: 2,
    name: "Discord",
    logo: logo,
    jobCount: 3,
    description:
      "We'd love to work with someone like you. We care about creating a delightful experience.",
    category: "Technology",
  },
  {
    id: 3,
    name: "Maze",
    logo: logo,
    jobCount: 3,
    description:
      "We're a passionate bunch working from all over the world to build the future of rapid testing together.",
    category: "Design",
  },
  {
    id: 4,
    name: "Udacity",
    logo: logo,
    jobCount: 3,
    description:
      "Udacity is a new type of online university that teaches the actual programming skills.",
    category: "Education",
  },
];

// Sample data for companies list
const companies = [
  {
    id: 7,
    name: "Pentagram",
    logo: logo,
    jobCount: 3,
    description: "One of the best design agencies",
    category: "Design",
  },
  {
    id: 8,
    name: "Square",
    logo: logo,
    jobCount: 3,
    description: "Mobile payment company",
    category: "Business",
  },
];

// Categories
const categories = [
  { id: "all", name: "Tât cả", icon: Briefcase },
  { id: "design", name: "Design", icon: Code },
  { id: "business", name: "Business", icon: Building2 },
  { id: "technology", name: "Technology", icon: Globe },
];

export default function FindCompanies() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [followedCompanies, setFollowedCompanies] = useState([]);

  const filteredCompanies = companies.filter((company) => {
    const matchesCategory =
      selectedCategory === "all" ||
      company.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function handleCompanyClick(companyId) {
    // Implement the logic to handle the company click, e.g., navigate to a detailed page
  }

  const handleFollowClick = (companyId) => {
    setFollowedCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Search Section */}
        <div className="text-center my-8">
          <h1 className="text-3xl font-bold">
            Tìm kiếm{" "}
            <span className="relative inline-block text-primary text-blue-500">
              công ty yêu thích của bạn
              <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-300 opacity-50"></span>
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Tìm công ty mơ ước mà bạn muốn làm việc
          </p>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Nhập tên công ty hoặc từ khóa mong muốn"
              className="pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative w-64">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Select>
              <SelectTrigger className="w-full pl-12 pr-4 py-3 text-left rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Hồ Chí Minh" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Locations</SelectLabel>
                  <SelectItem value="Hồ Chí Minh">Hồ Chí Minh</SelectItem>
                  <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                  <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                  <SelectItem value="Cần Thơ">Cần Thơ</SelectItem>
                  <SelectItem value="Hải Phòng">Hải Phòng</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Button className="bg-purple-600 text-white px-6 py-3 rounded-lg">
            Tìm kiếm
          </Button>
        </div>

        {/* Recommended Companies Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Công ty đề xuất</h2>
          <p className="text-sm text-muted-foreground">
            Based on your profile, company preferences, and recent activity
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedCompanies.map((company) => (
              <Card
                key={company.id}
                className="p-6 space-y-4 transition-transform duration-300 hover:scale-105 cursor-pointer"
                onClick={() => handleCompanyClick(company.id)}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className="h-12 w-12 rounded-lg object-contain"
                  />
                  <div>
                    <h3 className="font-semibold">{company.name}</h3>
                    <p className="text-sm text-primary">
                      {company.jobCount} Jobs
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {company.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    style={categoryStyles[company.category] || {}}
                    className="text-xs"
                  >
                    {company.category}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Company Categories */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Danh mục</h2>
          <div className="flex gap-4 flex-wrap">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              const categoryStyle = categoryStyles[category.name] || {};

              return (
                <Button
                  key={category.id}
                  variant={isActive ? "default" : "outline"}
                  className={`flex items-center gap-2 transition-colors duration-300 ${
                    isActive ? "active" : ""
                  } hover:bg-opacity-80`}
                  style={{
                    backgroundColor: isActive
                      ? categoryStyle.backgroundColor
                      : "transparent",
                    color: isActive ? categoryStyle.color : "inherit",
                    borderColor: isActive ? categoryStyle.color : "inherit",
                  }}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Filtered Companies List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Danh sách công ty theo danh mục bạn chọn</h2>
            <p className="text-muted-foreground">
              {filteredCompanies.length} kết quả
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => {
              const isFollowed = followedCompanies.includes(company.id);
              return (
                <Card key={company.id} className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={company.logo}
                      alt={`${company.name} logo`}
                      className="h-12 w-12 rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold">{company.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {company.jobCount} việc làm
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {company.description}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Xem các công việc
                    </Button>
                    <Button
                      size="sm"
                      className={`transition-transform duration-300 ${
                        isFollowed ? "bg-green-500 text-white" : ""
                      }`}
                      onClick={() => handleFollowClick(company.id)}
                    >
                      {isFollowed ? "Đã theo dõi" : "Theo dõi"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
