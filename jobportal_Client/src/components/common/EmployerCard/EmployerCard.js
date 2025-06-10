import { Link } from "react-router-dom"
import { Building2, Users, ArrowRight } from "lucide-react"
import ImageCarousel from "../../layout/ImageCarousel"

const EmployerCard = ({ company }) => {
  return (
    <Link to={`/companies/${company.companyId}`} className="block group">
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
        {/* Card header with logo */}
        <div className="relative h-48 flex items-center justify-center overflow-hidden bg-gray-50">
          <div className="flex items-center justify-center w-full h-full">
            <ImageCarousel logo={company.logo} className="object-contain max-h-32" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-purple-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Card content */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <h3 className="flex-1 truncate text-xl font-bold text-gray-800 group-hover:text-primary transition-colors duration-300">
              {company.companyName}
            </h3>
            <span className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">Đang tuyển</span>
          </div>

          <p className="text-gray-600 mb-4 line-clamp-3 flex-1">{company.description}</p>

          <div className="mt-auto space-y-3">
            {/* Stats */}
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-1.5 text-gray-400" />
              <span>{company.applicationCount} người đã ứng tuyển</span>
            </div>

            {/* View details button */}
            <div className="pt-3 border-t border-gray-100 mt-2">
              <div className="flex items-center justify-between text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
                <span>Chi tiết</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default EmployerCard