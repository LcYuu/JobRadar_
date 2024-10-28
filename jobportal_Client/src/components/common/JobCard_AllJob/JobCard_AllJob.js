import { Button } from "../../../ui/button";
import { Card, CardContent } from "../../../ui/card";

function JobCard_AllJob({ job }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-xl mr-4 flex items-center justify-center text-xl font-bold">
            {job.company[0]}
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold text-lg">{job.title}</h3>
            <p className="text-sm text-gray-500">{job.company} • {job.location}</p>
            <div className="flex space-x-2 mt-2">
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">{job.type}</span>
              {job.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">{tag}</span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <Button className="bg-purple-600 text-white">Apply</Button>
            <p className="text-xs text-gray-500 mt-1">{job.applied} applied of {job.capacity} capacity</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default JobCard_AllJob;
