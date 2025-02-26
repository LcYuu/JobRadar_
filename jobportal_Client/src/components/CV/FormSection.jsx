import React, { useEffect, useState } from "react";
import PersonalDetail from "./Forms/PersonalDetail";
import ExperienceForm from "./Forms/ExperienceForm";
import EducationForm from "./Forms/EducationForm";
import SkillsForm from "./Forms/SkillsForm";

import { ArrowLeft, ArrowRight, Home, LayoutGrid } from "lucide-react";
import { Button } from "../../ui/button";
import SummeryForm from "./Forms/SummeryForm";
import { Link, Navigate, useParams } from "react-router-dom";
import ThemeColor from "./ThemeColor";

const FormSection = () => {
  const [activeFormIndex, setActiveFormIndex] = useState(1)
  const [enabledNext, setEnabledNext] = useState(true);
  const { genCvId } = useParams();

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="flex gap-5">
          <Link to="/create-cv">
            <Button>
              <Home />
            </Button>
          </Link>
          <ThemeColor/>
        </div>

        <div className="flex gap-2">
          {activeFormIndex > 1 && (
            <Button
              size="sm"
              onClick={() => setActiveFormIndex(activeFormIndex - 1)}
            >
              <ArrowLeft />
            </Button>
          )}
          <Button
            disabled={!enabledNext}
            className="flex gap-2"
            size="sm"
            onClick={() => setActiveFormIndex(activeFormIndex + 1)}
          >
            Next <ArrowRight />
          </Button>
        </div>
      </div>

      {activeFormIndex === 1 ? (
        <PersonalDetail enabledNext={setEnabledNext} />
      ) : activeFormIndex === 2 ? (
        <SummeryForm enabledNext={setEnabledNext} />
      ) : activeFormIndex === 3 ? (
        <ExperienceForm />
      ) : activeFormIndex === 4 ? (
        <EducationForm />
      ) : activeFormIndex === 5 ? (
        <SkillsForm />
      ) : activeFormIndex === 6 ? (
        <Navigate to={`/create-cv/view/${genCvId}`} />
      ) : null}
    </div>
  );
};

export default FormSection;
