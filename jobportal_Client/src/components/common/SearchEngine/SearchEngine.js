import React, { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { Input } from "../../../ui/input"
import { Button } from "../../../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select"
import { Slider } from "../../../ui/slider"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../ui/accordion"

const cities = ["Ho Chi Minh City", "Hanoi", "Da Nang", "Can Tho", "Hai Phong"]
const districts = {
  "Ho Chi Minh City": ["District 1", "District 2", "District 3", "Binh Thanh", "Thu Duc"],
  "Hanoi": ["Ba Dinh", "Hoan Kiem", "Hai Ba Trung", "Dong Da", "Cau Giay"],
  // Add districts for other cities...
}
const jobTypes = ["Full-time", "Part-time", "Contract", "Internship", "Remote"]
const categories = ["Technology", "Finance", "Healthcare", "Education", "Marketing", "Sales"]

export default function JobSearchBar() {
  const [keyword, setKeyword] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [salaryRange, setSalaryRange] = useState([0, 100])
  const [selectedJobType, setSelectedJobType] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  const handleSearch = () => {
    // Implement search logic here
    console.log("Searching with:", { keyword, selectedCity, selectedDistrict, salaryRange, selectedJobType, selectedCategory })
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 p-4 bg-background rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
        <Input
          type="text"
          placeholder="Nhập từ khóa hoặc tên công việc"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-grow"
        />
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="md:w-1/3">
            <SelectValue placeholder="Chọn thành phố" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} className="w-full md:w-auto">
          <Search className="w-4 h-4 mr-2" />
          Tìm kiếm
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="text-primary"
        >
          <Filter className="w-4 h-4 mr-2" />
          {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
        </Button>
      </div>

      {showFilters && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="district">
            <AccordionTrigger>Quận/Huyện</AccordionTrigger>
            <AccordionContent>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn quận/huyện" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCity && districts[selectedCity]?.map((district) => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="salary">
            <AccordionTrigger>Mức lương (triệu VND)</AccordionTrigger>
            <AccordionContent>
              <Slider
                min={0}
                max={100}
                step={1}
                value={salaryRange}
                onValueChange={setSalaryRange}
                className="my-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{salaryRange[0]} triệu</span>
                <span>{salaryRange[1]} triệu</span>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="jobType">
            <AccordionTrigger>Hình thức làm việc</AccordionTrigger>
            <AccordionContent>
              <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn hình thức làm việc" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="category">
            <AccordionTrigger>Ngành nghề</AccordionTrigger>
            <AccordionContent>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn ngành nghề" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  )
}