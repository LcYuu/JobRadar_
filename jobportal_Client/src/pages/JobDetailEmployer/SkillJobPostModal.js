import { Button, Modal, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { Checkbox } from "../../ui/checkbox";
import { getAllSkill } from "../../redux/Skills/skill.thunk";
import { getAllIndustries } from "../../redux/Industry/industry.thunk";
import { toast } from "react-toastify";

const commonSkills = [
  "Communication", "Teamwork", "Leadership", "Problem Solving", "Time Management",
  "Critical Thinking", "Creativity", "Adaptability", "Conflict Resolution", "Decision Making",
  "Emotional Intelligence", "Interpersonal Skills", "Negotiation", "Presentation Skills",
  "Work Ethic", "Stress Management", "Self-Motivation", "Attention to Detail",
  "Customer Service", "Project Management"
];

const industrySkillMapping = {
  "Thương mại điện tử": [
    "Digital Marketing", "SEO/SEM", "Customer Relationship Management (CRM)",
    "E-commerce Platforms", "Payment Gateway Integration", "Social Media Management",
    "Market Research", "Content Creation", "Analytics Tools", "Data Analysis"
  ],
  "Marketing/Truyền thông": [
    "Digital Marketing", "SEO/SEM", "Social Media Management", "Content Creation",
    "Market Research", "Graphic Design", "Brand Management", "Public Relations",
    "Advertising Strategy", "Copywriting"
  ],
  "IT phần cứng": [
    "Hardware Troubleshooting", "Network Configuration", "Cybersecurity",
    "Server Maintenance", "Circuit Design", "Storage Management", "Firmware Development",
    "Cloud Infrastructure", "IT Support", "Network Engineering"
  ],
  "Công nghệ ô tô": [
    "Automotive Diagnostics", "Mechanical Engineering", "Electrical Systems",
    "Vehicle Design", "CAD", "Robotics", "Automotive Software", "Battery Technology",
    "Emission Control", "Quality Testing"
  ],
  "IT phần mềm": [
    "Java", "Python", "JavaScript", "SQL", "React", "Docker", "Kubernetes",
    "Machine Learning", "API Development", "Software Testing", "Cloud Computing",
    "DevOps", "Artificial Intelligence", "Blockchain", "Agile Methodology",
    "Data Visualization", "Mobile App Development", "Web Development",
    "Database Management", "Cybersecurity Software"
  ],
  "Nhà hàng/Khách sạn": [
    "Food Safety", "Hospitality Management", "Event Planning", "Menu Design",
    "Inventory Management", "Guest Relations", "Culinary Arts", "Reservation Systems",
    "Staff Training", "Cost Control"
  ],
  "Thiết kế/In ấn": [
    "Adobe Photoshop", "Adobe Illustrator", "Graphic Design", "Typography",
    "Print Production", "Motion Graphics", "Packaging Design", "Branding",
    "Illustration", "UI Prototyping"
  ],
  "Cơ khí/Điện - điện tử": [
    "Mechanical Engineering", "Electrical Engineering", "Circuit Analysis",
    "PLC Programming", "Robotics Engineering", "Quality Assurance", "Prototyping",
    "Material Science", "Control Systems", "Automation"
  ],
  "Kinh doanh": [
    "Business Development", "Sales Strategy", "Financial Analysis", "Market Analysis",
    "Strategic Planning", "Contract Negotiation", "Business Analytics", "Entrepreneurship",
    "Supply Chain Management", "Risk Assessment"
  ],
  "Giáo dục/Đào tạo": [
    "Curriculum Design", "Classroom Management", "Instructional Design",
    "E-learning Platforms", "Assessment Development", "Educational Technology",
    "Student Counseling", "Pedagogy", "Training Facilitation", "Learning Analytics"
  ],
  "Kiến trúc/Xây dựng": [
    "Civil Engineering", "Architectural Design", "BIM Software", "Structural Analysis",
    "Construction Management", "Site Planning", "Sustainability Design", "Cost Estimation",
    "Building Codes", "3D Visualization"
  ],
  "Tài chính/Ngân hàng": [
    "Accounting", "Financial Modeling", "Risk Management", "Investment Analysis",
    "Auditing", "Taxation", "Banking Operations", "Portfolio Management",
    "Regulatory Compliance", "Budgeting"
  ],
  "Viễn thông": [
    "Network Engineering", "Wireless Communication", "Signal Processing",
    "Telecom Systems", "Network Security", "VoIP Technology", "Fiber Optics",
    "Protocol Analysis", "Cloud Networking", "5G Technology"
  ],
  "Y tế": [
    "Patient Care", "Medical Terminology", "Nursing", "First Aid", "Clinical Research",
    "Public Health", "Medical Imaging", "Pharmacy Management", "Health Informatics",
    "Surgical Assistance"
  ],
  "Logistics": [
    "Supply Chain Optimization", "Inventory Control", "Logistics Planning",
    "Freight Management", "Warehouse Operations", "Transport Coordination",
    "Customs Regulations", "Data Analytics", "Route Optimization", "ERP Systems"
  ],
  "Kế toán/Kiểm toán": [
    "Accounting", "Financial Reporting", "Tax Preparation", "Cost Accounting",
    "Forensic Accounting", "Payroll Management", "Compliance Auditing",
    "Accounting Software", "Budget Analysis", "Financial Reconciliation"
  ],
  "Sản xuất": [
    "Lean Manufacturing", "Process Engineering", "Production Planning", "Quality Control",
    "Equipment Maintenance", "Supply Chain Coordination", "Industrial Automation",
    "Safety Management", "Workflow Optimization", "Material Management"
  ],
  "Tài xế": [
    "Safe Driving", "Vehicle Maintenance", "Navigation Skills", "Traffic Regulations",
    "Defensive Driving", "Cargo Handling", "Route Planning", "Driver Safety Training",
    "Logbook Management", "Customer Interaction"
  ],
  "Luật": [
    "Legal Research", "Contract Law", "Litigation", "Regulatory Law",
    "Compliance Management", "Legal Writing", "Dispute Resolution", "Intellectual Property",
    "Corporate Law", "Ethics in Law"
  ],
  "Phiên dịch": [
    "Multilingual Proficiency", "Cultural Competence", "Simultaneous Interpretation",
    "Translation Software", "Technical Translation", "Localization", "Proofreading",
    "Interpreting Ethics", "Document Translation", "Conference Interpretation"
  ],
  "Hệ thống nhúng và IOT": [
    "Embedded Programming", "IoT Protocols", "Microcontroller Programming",
    "Sensor Integration", "Real-time Operating Systems", "Wireless Networking",
    "Edge Computing", "Firmware Design", "IoT Security", "Hardware Interfacing"
  ],
};

const SkillPostModal = ({ open, handleClose, onSave, initialSkills = [], postId }) => {
  const dispatch = useDispatch();
  const { skills } = useSelector((store) => store.skill);
  const { allIndustries } = useSelector((store) => store.industry);
  const [selectedSkills, setSelectedSkills] = useState([]);
  console.log("🚀 ~ SkillPostModal ~ selectedSkills:", selectedSkills)
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    dispatch(getAllSkill());
    dispatch(getAllIndustries());
  }, [dispatch]);

  useEffect(() => {
    // Chuẩn hóa initialSkills
    const normalizedSkills = initialSkills.map((skill) => ({
      skillId: skill.skillId,
      skillName: skill.skillName,
    }));
    console.log("Normalized initial skills:", normalizedSkills); // Debug
    setSelectedSkills(normalizedSkills);
  }, [initialSkills, open]);

  const [commonSkillsList, setCommonSkillsList] = useState([]);
  const [industrySkills, setIndustrySkills] = useState([]);

  useEffect(() => {
    if (skills.length && allIndustries.length) {
      console.log("Skills from store:", skills); // Debug
      console.log("Industries from store:", allIndustries); // Debug

      const formattedCommonSkills = commonSkills
        .map((skillName) => {
          const skill = skills.find((s) => s.skillName === skillName);
          return skill ? { skillId: skill.skillId, skillName, tag: "Kỹ năng chung" } : null;
        })
        .filter((skill) => skill)
        .sort((a, b) => a.skillName.localeCompare(b.skillName));
      console.log("Formatted common skills:", formattedCommonSkills); // Debug
      setCommonSkillsList(formattedCommonSkills);

      const formattedIndustries = allIndustries.map((industry) => {
        const industryName = industry.industryName;
        const specificSkills = industrySkillMapping[industryName] || [];
        const industrySkills = specificSkills
          .map((skillName) => {
            const skill = skills.find((s) => s.skillName === skillName);
            return skill ? { skillId: skill.skillId, skillName, tag: "Kỹ năng chuyên ngành" } : null;
          })
          .filter((skill) => skill)
          .sort((a, b) => a.skillName.localeCompare(b.skillName));
        return {
          industryId: industry.industryId,
          industryName,
          skills: industrySkills,
        };
      });
      console.log("Formatted industries:", formattedIndustries); // Debug
      formattedIndustries.sort((a, b) => a.industryName.localeCompare(b.industryName));
      setIndustrySkills(formattedIndustries);
    }
  }, [skills, allIndustries]);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleSkillChange = (skill, checked) => {
    const update = checked
      ? [...selectedSkills, skill]
      : selectedSkills.filter((selectedSkill) => selectedSkill.skillId !== skill.skillId);
    console.log("Updated selected skills:", update); // Debug
    setSelectedSkills(update);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(selectedSkills);
    } catch (error) {
      console.error("Error saving skills:", error);
    } finally {
      setIsLoading(false);
      handleClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose} className="animate-fadeIn">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Chọn kỹ năng</h2>
          <IconButton onClick={handleClose} className="hover:bg-gray-100">
            <CloseIcon />
          </IconButton>
        </div>

        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto custom-scrollbar">
          <div className="border-b border-gray-200">
            <div
              className="flex items-center p-3 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => toggleSection("common-skills")}
            >
              <span className="font-semibold text-gray-800">Kỹ năng chung</span>
              <span className="ml-auto">{expandedSection === "common-skills" ? "▲" : "▼"}</span>
            </div>
            {expandedSection === "common-skills" && (
              <div className="pl-6 flex flex-col gap-2">
                {commonSkillsList.map((skill) => (
                  <div
                    key={skill.skillId}
                    className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Checkbox
                      checked={selectedSkills.some(
                        (selectedSkill) => selectedSkill.skillId === skill.skillId
                      )}
                      onCheckedChange={(checked) => handleSkillChange(skill, checked)}
                      className="mr-3"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">{skill.skillName}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {skill.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {industrySkills.map((industry) => (
            <div key={industry.industryId} className="border-b border-gray-200">
              <div
                className="flex items-center p-3 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => toggleSection(industry.industryId)}
              >
                <span className="font-semibold text-gray-800">{industry.industryName}</span>
                <span className="ml-auto">{expandedSection === industry.industryId ? "▲" : "▼"}</span>
              </div>
              {expandedSection === industry.industryId && (
                <div className="pl-6 flex flex-col gap-2">
                  {industry.skills.map((skill) => (
                    <div
                      key={skill.skillId}
                      className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Checkbox
                        checked={selectedSkills.some(
                          (selectedSkill) => selectedSkill.skillId === skill.skillId
                        )}
                        onCheckedChange={(checked) => handleSkillChange(skill, checked)}
                        className="mr-3"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700">{skill.skillName}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {skill.tag}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{
              color: "#8B5CF6",
              borderColor: "#8B5CF6",
              "&:hover": {
                backgroundColor: "#E0D9F9",
                borderColor: "#7C3AED",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              backgroundColor: "#8B5CF6",
              "&:hover": {
                backgroundColor: "#7C3AED",
              },
            }}
            disabled={isLoading}
          >
            {isLoading ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SkillPostModal;