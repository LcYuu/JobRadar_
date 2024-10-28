import { useState } from 'react'
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Card, CardContent } from "../..//ui/card"
import { Checkbox } from "../../ui/checkbox"
import JobList_AllJob from '../../components/common/JobList_AllJob/JobList_AllJob'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import { Search, MapPin, ChevronDown, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react'

export default function JobSearchPage() {
    const [jobs, setJobs] = useState([
      { id: 1, title: "Social Media Assistant", company: "Nomad", location: "Paris, France", type: "Full-Time", tags: ["Marketing", "Design"], applied: 5, capacity: 10 },
      { id: 2, title: "Brand Designer", company: "Dropbox", location: "San Francisco, USA", type: "Full-Time", tags: ["Marketing", "Design"], applied: 2, capacity: 10 },
      { id: 3, title: "Interactive Developer", company: "Terraform", location: "Hamburg, Germany", type: "Full-Time", tags: ["Marketing", "Design"], applied: 8, capacity: 12 },
      { id: 4, title: "Email Marketing", company: "Revolut", location: "Madrid, Spain", type: "Full-Time", tags: ["Marketing", "Design"], applied: 0, capacity: 10 },
      { id: 5, title: "Lead Engineer", company: "Canva", location: "Ankara, Turkey", type: "Full-Time", tags: ["Marketing", "Design"], applied: 5, capacity: 10 },
      { id: 6, title: "Product Designer", company: "ClassPass", location: "Berlin, Germany", type: "Full-Time", tags: ["Marketing", "Design"], applied: 5, capacity: 10 },
      { id: 7, title: "Customer Manager", company: "Pitch", location: "Berlin, Germany", type: "Full-Time", tags: ["Marketing", "Design"], applied: 5, capacity: 10 },
    ])
  
    const [filters, setFilters] = useState({
      employmentType: { fullTime: false, partTime: false, remote: false, internship: false, contract: false },
      categories: { design: false, sales: false, marketing: false, business: false, humanResource: false, finance: false, engineering: false, technology: false },
      jobLevel: { entryLevel: false, midLevel: false, seniorLevel: false, director: false, vpOrAbove: false },
      salaryRange: { range1: false, range2: false, range3: false, range4: false }
    })
  
    const handleFilterChange = (category, item) => {
      setFilters(prevFilters => ({
        ...prevFilters,
        [category]: {
          ...prevFilters[category],
          [item]: !prevFilters[category][item]
        }
      }))
    }
  
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Tim kiếm <span className="text-primary">công việc trong mơ của bạn</span></h1>
          
          <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
            <div className="flex space-x-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input type="text" placeholder="Nhập tên công việc hoặc từ khóa mong muốn" className="pl-10" />
              </div>
             
              <div className="relative w-64">
              {/* <MapPin className="absolute top-1/2 transform -translate-y-1/2 text-gray-400" /> */}
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder= "Select a location" />
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
              
              <Button className="bg-primary bg-purple-600 text-white">Tìm kiếm</Button>
            </div>
          </div>
  
          <div className="flex space-x-8 mt-52">
            <aside className="w-64 space-y-6">
              <div>
                <h3 className="font-semibold mb-2 flex justify-between items-center">
                  Type of Employment
                  <ChevronDown size={20} />
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox id="full-time" checked={filters.employmentType.fullTime} onCheckedChange={() => handleFilterChange('employmentType', 'fullTime')} />
                    <label htmlFor="full-time" className="ml-2 text-sm">Full-time (3)</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="part-time" checked={filters.employmentType.partTime} onCheckedChange={() => handleFilterChange('employmentType', 'partTime')} />
                    <label htmlFor="part-time" className="ml-2 text-sm">Part-Time (5)</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="remote" checked={filters.employmentType.remote} onCheckedChange={() => handleFilterChange('employmentType', 'remote')} />
                    <label htmlFor="remote" className="ml-2 text-sm">Remote (2)</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="internship" checked={filters.employmentType.internship} onCheckedChange={() => handleFilterChange('employmentType', 'internship')} />
                    <label htmlFor="internship" className="ml-2 text-sm">Internship (24)</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="contract" checked={filters.employmentType.contract} onCheckedChange={() => handleFilterChange('employmentType', 'contract')} />
                    <label htmlFor="contract" className="ml-2 text-sm">Contract (3)</label>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex justify-between items-center">
                  Categories
                  <ChevronDown size={20} />
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox id="design" checked={filters.categories.design} onCheckedChange={() => handleFilterChange('categories', 'design')} />
                    <label htmlFor="design" className="ml-2 text-sm">Design (24)</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="sales" checked={filters.categories.sales} onCheckedChange={() => handleFilterChange('categories', 'sales')} />
                    <label htmlFor="sales" className="ml-2 text-sm">Sales (3)</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="marketing" checked={filters.categories.marketing} onCheckedChange={() => handleFilterChange('categories', 'marketing')} />
                    <label htmlFor="marketing" className="ml-2 text-sm">Marketing (3)</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="business" checked={filters.categories.business} onCheckedChange={() => handleFilterChange('categories', 'business')} />
                    <label htmlFor="business" className="ml-2 text-sm">Business (3)</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="human-resource" checked={filters.categories.humanResource} onCheckedChange={() => handleFilterChange('categories', 'humanResource')} />
                    <label htmlFor="human-resource" className="ml-2 text-sm">Human Resource (6)</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="finance" checked={filters.categories.finance} onCheckedChange={() => handleFilterChange('categories', 'finance')} />
                    <label htmlFor="finance" className="ml-2 text-sm">Finance (4)</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="engineering" checked={filters.categories.engineering} onCheckedChange={() => handleFilterChange('categories', 'engineering')} />
                    <label htmlFor="engineering" className="ml-2 text-sm">Engineering (4)</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="technology" checked={filters.categories.technology} onCheckedChange={() => handleFilterChange('categories', 'technology')} />
                    <label htmlFor="technology" className="ml-2 text-sm">Technology (5)</label>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex justify-between items-center">
                  Job Level
                  <ChevronDown size={20} />
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox id="entry-level" checked={filters.jobLevel.entryLevel} onCheckedChange={() => handleFilterChange('jobLevel', 'entryLevel')} />
                    <label htmlFor="entry-level" className="ml-2 text-sm">Entry Level (57)</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="mid-level" checked={filters.jobLevel.midLevel} onCheckedChange={() => handleFilterChange('jobLevel', 'midLevel')} />
                    <label htmlFor="mid-level" className="ml-2 text-sm">Mid Level (3)</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="senior-level" checked={filters.jobLevel.seniorLevel} onCheckedChange={() => handleFilterChange('jobLevel', 'seniorLevel')} />
                    <label htmlFor="senior-level" className="ml-2 text-sm">Senior Level (5)</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="director" checked={filters.jobLevel.director} onCheckedChange={() => handleFilterChange('jobLevel', 'director')} />
                    <label htmlFor="director" className="ml-2 text-sm">Director (12)</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="vp-above" checked={filters.jobLevel.vpOrAbove} onCheckedChange={() => handleFilterChange('jobLevel', 'vpOrAbove')} />
                    <label htmlFor="vp-above" className="ml-2 text-sm">VP or Above (8)</label>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex justify-between items-center">
                  Salary Range
                  <ChevronDown size={20} />
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox id="700-1000" checked={filters.salaryRange.range1} onCheckedChange={() => handleFilterChange('salaryRange', 'range1')} />
                    <label htmlFor="700-1000" className="ml-2 text-sm">$700 - $1000 (4)</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="1000-1500" checked={filters.salaryRange.range2} onCheckedChange={() => handleFilterChange('salaryRange', 'range2')} />
                    <label htmlFor="1000-1500" className="ml-2 text-sm">$1000 - $1500 (6)</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="1500-2000" checked={filters.salaryRange.range3} onCheckedChange={() => handleFilterChange('salaryRange', 'range3')} />
                    <label htmlFor="1500-2000" className="ml-2 text-sm">$1500 - $2000 (10)</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="3000-above" checked={filters.salaryRange.range4} onCheckedChange={() => handleFilterChange('salaryRange', 'range4')} />
                    <label htmlFor="3000-above" className="ml-2 text-sm">$3000 or above (4)</label>
                  </div>
                </div>
              </div>
            </aside>
  
            <div className="flex-grow space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold">All Jobs</h2>
                  <span className="text-sm text-gray-500">Showing 73 results</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select sorting criteria " />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Sort by</SelectLabel>
                      <SelectItem value="Most relevant">Most relevant</SelectItem>
                      <SelectItem value="Newest">Newest</SelectItem>
                      <SelectItem value="Oldest">Oldest</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                 
                  <div className="flex border rounded">
                    <Button variant="ghost" size="icon" className="rounded-r-none"><Grid size={20} /></Button>
                    <Button variant="ghost" size="icon" className="rounded-l-none bg-gray-100"><List size={20} /></Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">All Jobs</h2>
          <span className="text-sm text-gray-500">Showing {jobs.length} results</span>
        </div>
        <JobList_AllJob jobs={jobs} />
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button variant="outline" size="icon"><ChevronLeft size={16} /></Button>
                <Button variant="outline" className="bg-purple-600 text-white">1</Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <Button variant="outline">4</Button>
                <Button variant="outline">5</Button>
                <span>...</span>
                <Button variant="outline">33</Button>
                <Button variant="outline" size="icon"><ChevronRight size={16} /></Button>
              </div>
            </div>
          </div>
        </main>

      
    </div>
  )
}
