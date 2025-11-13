import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { validateSection, type DemographicsData } from "@/lib/demographicsValidation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ConsentFormProps {
  open: boolean;
  onConsent: (data: DemographicsData) => void;
  onDecline: () => void;
  testVersion: string;
}

export const ConsentForm = ({ open, onConsent, onDecline, testVersion }: ConsentFormProps) => {
  // Detect if this is an adolescent assessment
  const isAdolescentAssessment = testVersion?.includes('adolescent') || false;
  
  const [currentTab, setCurrentTab] = useState("basic");
  
  // Section 1: Basic Information
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  // Section 2: Professional Background
  const [jobRole, setJobRole] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [organizationSize, setOrganizationSize] = useState("");
  const [industrySector, setIndustrySector] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  
  // Section 3: AI Experience
  const [aiFamiliarity, setAiFamiliarity] = useState("");
  const [aiToolsUsed, setAiToolsUsed] = useState<string[]>([]);
  const [aiUsageFrequency, setAiUsageFrequency] = useState("");
  const [aiUseCases, setAiUseCases] = useState<string[]>([]);
  const [aiTraining, setAiTraining] = useState("");
  
  // Section 4: Assessment Purpose
  const [assessmentReasons, setAssessmentReasons] = useState<string[]>([]);
  const [resultsUsage, setResultsUsage] = useState<string[]>([]);
  
  // Section 5: Optional Demographics
  const [ageRange, setAgeRange] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [country, setCountry] = useState("");
  const [primaryLanguage, setPrimaryLanguage] = useState("");
  const [technicalBackground, setTechnicalBackground] = useState("");
  
  // Section 6: Consent
  const [consentAssessment, setConsentAssessment] = useState(false);
  const [consentDataUsage, setConsentDataUsage] = useState(false);
  const [consentResultsAccess, setConsentResultsAccess] = useState(false);
  const [consentSecurityMonitoring, setConsentSecurityMonitoring] = useState(false);
  const [consentResearch, setConsentResearch] = useState(false);
  const [consentCommunications, setConsentCommunications] = useState(false);
  
  // Section completion tracking
  const [sectionsCompleted, setSectionsCompleted] = useState({
    basic: false,
    professional: false,
    aiExperience: false,
    purpose: false,
    demographics: true, // Optional section
    consent: false,
  });

  // Toggle checkbox in array
  const toggleInArray = (array: string[], value: string, setter: (arr: string[]) => void) => {
    if (array.includes(value)) {
      setter(array.filter(item => item !== value));
    } else {
      setter([...array, value]);
    }
  };

  // Validate and move to next section
  const handleContinue = (fromTab: string) => {
    // Skip validation for professional section if adolescent
    if (fromTab === "professional" && isAdolescentAssessment) {
      return;
    }
    
    const sectionData = getSectionData(fromTab);
    const validation = validateSection(getSectionKey(fromTab), sectionData, isAdolescentAssessment);
    
    if (!validation.success) {
      toast({
        title: "Incomplete Section",
        description: "Please fill in all required fields before continuing.",
        variant: "destructive",
      });
      return;
    }
    
    // Mark section as completed
    setSectionsCompleted(prev => ({ ...prev, [fromTab]: true }));
    
    // Move to next tab
    const tabs = isAdolescentAssessment 
      ? ["basic", "aiExperience", "purpose", "demographics", "consent"]
      : ["basic", "professional", "aiExperience", "purpose", "demographics", "consent"];
    const currentIndex = tabs.indexOf(fromTab);
    if (currentIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentIndex + 1]);
    }
  };

  const getSectionKey = (tab: string) => {
    const keyMap: Record<string, string> = {
      basic: "basicInfo",
      professional: "professionalBackground",
      aiExperience: "aiExperience",
      purpose: "assessmentPurpose",
      demographics: "optionalDemographics",
      consent: "consent",
    };
    return keyMap[tab];
  };

  const getSectionData = (tab: string) => {
    switch (tab) {
      case "basic":
        return { full_name: fullName, phone_number: phoneNumber };
      case "professional":
        return { job_role: jobRole, organization_type: organizationType, organization_size: organizationSize, industry_sector: industrySector, years_experience: yearsExperience };
      case "aiExperience":
        return { ai_familiarity: aiFamiliarity, ai_tools_used: aiToolsUsed, ai_usage_frequency: aiUsageFrequency, ai_use_cases: aiUseCases, ai_training: aiTraining };
      case "purpose":
        return { assessment_reasons: assessmentReasons, assessment_tier: testVersion, results_usage: resultsUsage };
      case "demographics":
        return { age_range: ageRange, education_level: educationLevel, country, primary_language: primaryLanguage, technical_background: technicalBackground };
      case "consent":
        return { consent_assessment: consentAssessment, consent_data_usage: consentDataUsage, consent_results_access: consentResultsAccess, consent_security_monitoring: consentSecurityMonitoring, consent_research: consentResearch, consent_communications: consentCommunications };
      default:
        return {};
    }
  };

  const handleSubmit = () => {
    // Validate all required sections
    const allData: any = {
      full_name: fullName,
      phone_number: phoneNumber,
      job_role: jobRole,
      organization_type: organizationType,
      organization_size: organizationSize,
      industry_sector: industrySector,
      years_experience: yearsExperience,
      ai_familiarity: aiFamiliarity,
      ai_tools_used: aiToolsUsed,
      ai_usage_frequency: aiUsageFrequency,
      ai_use_cases: aiUseCases,
      ai_training: aiTraining,
      assessment_reasons: assessmentReasons,
      assessment_tier: testVersion,
      results_usage: resultsUsage,
      age_range: ageRange,
      education_level: educationLevel,
      country,
      primary_language: primaryLanguage,
      technical_background: technicalBackground,
      consent_assessment: consentAssessment,
      consent_data_usage: consentDataUsage,
      consent_results_access: consentResultsAccess,
      consent_security_monitoring: consentSecurityMonitoring,
      consent_research: consentResearch,
      consent_communications: consentCommunications,
    };

    // Check all required consents
    if (!consentAssessment || !consentDataUsage || !consentResultsAccess || !consentSecurityMonitoring) {
      toast({
        title: "Consent Required",
        description: "Please check all four required consent boxes to proceed.",
        variant: "destructive",
      });
      return;
    }

    onConsent(allData as DemographicsData);
  };

  const getAssessmentTierDisplay = () => {
    if (testVersion === "beginner") return "Beginner (90 minutes)";
    if (testVersion === "professional") return "Professional (120 minutes)";
    if (testVersion === "expert") return "Advanced (150 minutes)";
    return testVersion;
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">AIQ Demographics & Consent Form</DialogTitle>
          <DialogDescription className="text-base">
            Completion time: {isAdolescentAssessment ? '2-3' : '3-5'} minutes • {Object.values(sectionsCompleted).filter(Boolean).length}/{isAdolescentAssessment ? '5' : '6'} sections completed
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className={`grid w-full ${isAdolescentAssessment ? 'grid-cols-5' : 'grid-cols-6'}`}>
            <TabsTrigger value="basic" className="text-xs">
              {sectionsCompleted.basic && <CheckCircle2 className="w-3 h-3 mr-1" />}
              Basic
            </TabsTrigger>
            {!isAdolescentAssessment && (
              <TabsTrigger value="professional" className="text-xs">
                {sectionsCompleted.professional && <CheckCircle2 className="w-3 h-3 mr-1" />}
                Professional
              </TabsTrigger>
            )}
            <TabsTrigger value="aiExperience" className="text-xs">
              {sectionsCompleted.aiExperience && <CheckCircle2 className="w-3 h-3 mr-1" />}
              AI Experience
            </TabsTrigger>
            <TabsTrigger value="purpose" className="text-xs">
              {sectionsCompleted.purpose && <CheckCircle2 className="w-3 h-3 mr-1" />}
              Purpose
            </TabsTrigger>
            <TabsTrigger value="demographics" className="text-xs">
              {sectionsCompleted.demographics && <CheckCircle2 className="w-3 h-3 mr-1" />}
              Demographics
            </TabsTrigger>
            <TabsTrigger value="consent" className="text-xs">
              {sectionsCompleted.consent && <CheckCircle2 className="w-3 h-3 mr-1" />}
              Consent
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[50vh] mt-4 pr-4">
            {/* SECTION 1: Basic Information */}
            <TabsContent value="basic" className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  This name will appear on your certificate and be used for results verification
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
                <p className="text-xs text-muted-foreground">Optional - for research follow-up only if you consent</p>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleContinue("basic")}>Continue</Button>
              </div>
            </TabsContent>

            {/* SECTION 2: Professional Background */}
            <TabsContent value="professional" className="space-y-4">
              <h3 className="font-semibold text-lg">Professional Background</h3>
              
              <div className="space-y-2">
                <Label htmlFor="jobRole">Current Role/Title <span className="text-destructive">*</span></Label>
                <Input
                  id="jobRole"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g., Marketing Manager, Software Developer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationType">Organization Type <span className="text-destructive">*</span></Label>
                <Select value={organizationType} onValueChange={setOrganizationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corporate">Corporate/Enterprise</SelectItem>
                    <SelectItem value="smb">Small-Medium Business (SMB)</SelectItem>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="nonprofit">Non-Profit/NGO</SelectItem>
                    <SelectItem value="government">Government/Public Sector</SelectItem>
                    <SelectItem value="education">Education/Academic Institution</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="consulting">Consulting/Professional Services</SelectItem>
                    <SelectItem value="self-employed">Self-Employed/Freelancer</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="transition">Between Jobs/Career Transition</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationSize">Organization Size (Optional)</Label>
                <Select value={organizationSize} onValueChange={setOrganizationSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-1000">201-1,000 employees</SelectItem>
                    <SelectItem value="1001-5000">1,001-5,000 employees</SelectItem>
                    <SelectItem value="5001-10000">5,001-10,000 employees</SelectItem>
                    <SelectItem value="10000+">10,000+ employees</SelectItem>
                    <SelectItem value="na">Not applicable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industrySector">Industry/Sector <span className="text-destructive">*</span></Label>
                <Select value={industrySector} onValueChange={setIndustrySector}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology/Software</SelectItem>
                    <SelectItem value="finance">Finance/Banking</SelectItem>
                    <SelectItem value="healthcare">Healthcare/Medical</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retail">Retail/E-commerce</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="marketing">Marketing/Advertising</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="media">Media/Entertainment</SelectItem>
                    <SelectItem value="legal">Legal/Law</SelectItem>
                    <SelectItem value="real-estate">Real Estate</SelectItem>
                    <SelectItem value="transportation">Transportation/Logistics</SelectItem>
                    <SelectItem value="energy">Energy/Utilities</SelectItem>
                    <SelectItem value="telecom">Telecommunications</SelectItem>
                    <SelectItem value="hospitality">Hospitality/Tourism</SelectItem>
                    <SelectItem value="agriculture">Agriculture</SelectItem>
                    <SelectItem value="government">Government/Public Administration</SelectItem>
                    <SelectItem value="nonprofit">Non-Profit/Social Services</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Professional Experience <span className="text-destructive">*</span></Label>
                <Select value={yearsExperience} onValueChange={setYearsExperience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select years of experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<1">Less than 1 year</SelectItem>
                    <SelectItem value="1-2">1-2 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="6-10">6-10 years</SelectItem>
                    <SelectItem value="11-15">11-15 years</SelectItem>
                    <SelectItem value="16-20">16-20 years</SelectItem>
                    <SelectItem value="20+">20+ years</SelectItem>
                    <SelectItem value="na">Not applicable (Student)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentTab("basic")}>Back</Button>
                <Button onClick={() => handleContinue("professional")}>Continue</Button>
              </div>
            </TabsContent>

            {/* SECTION 3: AI Experience */}
            <TabsContent value="aiExperience" className="space-y-4">
              <h3 className="font-semibold text-lg">AI Experience & Context</h3>
              
              <div className="space-y-2">
                <Label>How familiar are you with AI tools? <span className="text-destructive">*</span></Label>
                <Select value={aiFamiliarity} onValueChange={setAiFamiliarity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select familiarity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never used AI tools</SelectItem>
                    <SelectItem value="aware">Aware but haven't used much (&lt; 1 month)</SelectItem>
                    <SelectItem value="occasional">Occasional user (1-3 months)</SelectItem>
                    <SelectItem value="regular">Regular user (3-6 months)</SelectItem>
                    <SelectItem value="frequent">Frequent user (6-12 months)</SelectItem>
                    <SelectItem value="daily">Daily user (1-2 years)</SelectItem>
                    <SelectItem value="power">Power user (2+ years)</SelectItem>
                    <SelectItem value="professional">AI professional/developer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Which AI tools have you used? <span className="text-destructive">*</span></Label>
                <div className="grid grid-cols-2 gap-2">
                  {isAdolescentAssessment 
                    ? ["ChatGPT", "Claude", "Google Gemini/Bard", "Microsoft Copilot", "Snapchat AI", "Character.AI", "Midjourney/DALL-E", "Grammarly", "Other AI tools", "None yet"].map(tool => (
                      <div key={tool} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tool-${tool}`}
                          checked={aiToolsUsed.includes(tool)}
                          onCheckedChange={() => toggleInArray(aiToolsUsed, tool, setAiToolsUsed)}
                        />
                        <Label htmlFor={`tool-${tool}`} className="text-sm cursor-pointer">{tool}</Label>
                      </div>
                    ))
                    : ["ChatGPT", "Claude", "Google Gemini/Bard", "Microsoft Copilot", "Midjourney/DALL-E", "GitHub Copilot", "Jasper/Copy.ai", "Notion AI", "Grammarly", "Other AI tools", "None yet"].map(tool => (
                      <div key={tool} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tool-${tool}`}
                          checked={aiToolsUsed.includes(tool)}
                          onCheckedChange={() => toggleInArray(aiToolsUsed, tool, setAiToolsUsed)}
                        />
                        <Label htmlFor={`tool-${tool}`} className="text-sm cursor-pointer">{tool}</Label>
                      </div>
                    ))
                  }
                </div>
              </div>

              <div className="space-y-2">
                <Label>How often do you currently use AI tools? <span className="text-destructive">*</span></Label>
                <Select value={aiUsageFrequency} onValueChange={setAiUsageFrequency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never/Not yet</SelectItem>
                    <SelectItem value="rarely">Rarely (once a month or less)</SelectItem>
                    <SelectItem value="occasionally">Occasionally (few times per month)</SelectItem>
                    <SelectItem value="weekly">Weekly (1-3 times per week)</SelectItem>
                    <SelectItem value="regularly">Regularly (4-6 times per week)</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="multiple">Multiple times per day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>What do you primarily use AI for? (Optional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {isAdolescentAssessment
                    ? ["Homework help", "Learning/Education", "Creative projects", "Writing help", "Research", "Image generation", "Brainstorming", "Fun/Entertainment", "Other"].map(useCase => (
                      <div key={useCase} className="flex items-center space-x-2">
                        <Checkbox
                          id={`use-${useCase}`}
                          checked={aiUseCases.includes(useCase)}
                          onCheckedChange={() => toggleInArray(aiUseCases, useCase, setAiUseCases)}
                        />
                        <Label htmlFor={`use-${useCase}`} className="text-sm cursor-pointer">{useCase}</Label>
                      </div>
                    ))
                    : ["Writing/Content creation", "Research", "Data analysis", "Coding/Programming", "Brainstorming", "Learning/Education", "Translation", "Summarization", "Email drafting", "Image generation", "Problem-solving", "Decision support", "Automation", "Creative projects", "Personal productivity", "Other"].map(useCase => (
                      <div key={useCase} className="flex items-center space-x-2">
                        <Checkbox
                          id={`use-${useCase}`}
                          checked={aiUseCases.includes(useCase)}
                          onCheckedChange={() => toggleInArray(aiUseCases, useCase, setAiUseCases)}
                        />
                        <Label htmlFor={`use-${useCase}`} className="text-sm cursor-pointer">{useCase}</Label>
                      </div>
                    ))
                  }
                </div>
              </div>

              <div className="space-y-2">
                <Label>Have you received any formal AI training? <span className="text-destructive">*</span></Label>
                <Select value={aiTraining} onValueChange={setAiTraining}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select training level" />
                  </SelectTrigger>
                  <SelectContent>
                    {isAdolescentAssessment ? (
                      <>
                        <SelectItem value="none">No formal training</SelectItem>
                        <SelectItem value="self-taught">Self-taught (online resources, videos)</SelectItem>
                        <SelectItem value="school-lesson">School lesson or class</SelectItem>
                        <SelectItem value="workshop">Workshop or camp</SelectItem>
                        <SelectItem value="online-course">Online course</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="none">No formal training</SelectItem>
                        <SelectItem value="self-taught">Self-taught (online resources, videos)</SelectItem>
                        <SelectItem value="workshop">Company workshop/training (1-2 hours)</SelectItem>
                        <SelectItem value="short-course">Short course (1-2 days)</SelectItem>
                        <SelectItem value="extended">Extended course/bootcamp (1+ weeks)</SelectItem>
                        <SelectItem value="university">University course/certification</SelectItem>
                        <SelectItem value="degree">Degree in AI/ML/Data Science</SelectItem>
                        <SelectItem value="professional">Professional AI certification</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentTab(isAdolescentAssessment ? "basic" : "professional")}>Back</Button>
                <Button onClick={() => handleContinue("aiExperience")}>Continue</Button>
              </div>
            </TabsContent>

            {/* SECTION 4: Assessment Purpose */}
            <TabsContent value="purpose" className="space-y-4">
              <h3 className="font-semibold text-lg">Assessment Purpose</h3>
              
              <div className="space-y-2">
                <Label>Why are you taking this assessment? <span className="text-destructive">*</span></Label>
                <div className="grid grid-cols-2 gap-2">
                  {isAdolescentAssessment
                    ? ["Personal learning", "School assignment", "Curiosity", "College preparation", "Recommended by teacher", "Recommended by parent", "Career exploration", "Other"].map(reason => (
                      <div key={reason} className="flex items-center space-x-2">
                        <Checkbox
                          id={`reason-${reason}`}
                          checked={assessmentReasons.includes(reason)}
                          onCheckedChange={() => toggleInArray(assessmentReasons, reason, setAssessmentReasons)}
                        />
                        <Label htmlFor={`reason-${reason}`} className="text-sm cursor-pointer">{reason}</Label>
                      </div>
                    ))
                    : ["Personal learning", "Job requirement", "Career advancement", "Hiring process", "Team assessment", "Training program", "Professional certification", "Academic requirement", "Curiosity", "Benchmark skills", "Recommended by colleague", "Other"].map(reason => (
                      <div key={reason} className="flex items-center space-x-2">
                        <Checkbox
                          id={`reason-${reason}`}
                          checked={assessmentReasons.includes(reason)}
                          onCheckedChange={() => toggleInArray(assessmentReasons, reason, setAssessmentReasons)}
                        />
                        <Label htmlFor={`reason-${reason}`} className="text-sm cursor-pointer">{reason}</Label>
                      </div>
                    ))
                  }
                </div>
              </div>

              <div className="space-y-2">
                <Label>Assessment Tier</Label>
                <Input value={getAssessmentTierDisplay()} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label>How do you plan to use your results? (Optional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["Identify learning gaps", "Development plan", "Share with employer", "Job applications", "Resume/LinkedIn", "Compare with colleagues", "Track progress", "Organizational reporting", "Just curious", "Other"].map(usage => (
                    <div key={usage} className="flex items-center space-x-2">
                      <Checkbox
                        id={`usage-${usage}`}
                        checked={resultsUsage.includes(usage)}
                        onCheckedChange={() => toggleInArray(resultsUsage, usage, setResultsUsage)}
                      />
                      <Label htmlFor={`usage-${usage}`} className="text-sm cursor-pointer">{usage}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentTab("aiExperience")}>Back</Button>
                <Button onClick={() => handleContinue("purpose")}>Continue</Button>
              </div>
            </TabsContent>

            {/* SECTION 5: Optional Demographics */}
            <TabsContent value="demographics" className="space-y-4">
              <h3 className="font-semibold text-lg">Optional Demographics</h3>
              <p className="text-sm text-muted-foreground">All fields in this section are optional</p>
              
              <div className="space-y-2">
                <Label>Age Range</Label>
                <Select value={ageRange} onValueChange={setAgeRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    {isAdolescentAssessment ? (
                      <>
                        <SelectItem value="14-15">14-15 years</SelectItem>
                        <SelectItem value="16-17">16-17 years</SelectItem>
                        <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="<18">Under 18</SelectItem>
                        <SelectItem value="18-24">18-24</SelectItem>
                        <SelectItem value="25-34">25-34</SelectItem>
                        <SelectItem value="35-44">35-44</SelectItem>
                        <SelectItem value="45-54">45-54</SelectItem>
                        <SelectItem value="55-64">55-64</SelectItem>
                        <SelectItem value="65+">65+</SelectItem>
                        <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Highest Education Level</Label>
                <Select value={educationLevel} onValueChange={setEducationLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {isAdolescentAssessment ? (
                      <>
                        <SelectItem value="grade-9-10">Currently in Grade 9-10</SelectItem>
                        <SelectItem value="grade-11-12">Currently in Grade 11-12</SelectItem>
                        <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="high-school">High school or equivalent</SelectItem>
                        <SelectItem value="some-college">Some college/Associate degree</SelectItem>
                        <SelectItem value="bachelors">Bachelor's degree</SelectItem>
                        <SelectItem value="masters">Master's degree</SelectItem>
                        <SelectItem value="doctoral">Doctoral degree (PhD, MD, JD, etc.)</SelectItem>
                        <SelectItem value="professional">Professional certification</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Country/Region</Label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Enter your country"
                />
              </div>

              <div className="space-y-2">
                <Label>Primary Language</Label>
                <Select value={primaryLanguage} onValueChange={setPrimaryLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="mandarin">Mandarin Chinese</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                    <SelectItem value="arabic">Arabic</SelectItem>
                    <SelectItem value="portuguese">Portuguese</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="japanese">Japanese</SelectItem>
                    <SelectItem value="korean">Korean</SelectItem>
                    <SelectItem value="russian">Russian</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Technical Background</Label>
                <Select value={technicalBackground} onValueChange={setTechnicalBackground}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select technical background" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non-technical">Non-technical</SelectItem>
                    <SelectItem value="somewhat">Somewhat technical</SelectItem>
                    <SelectItem value="technical">Technical (work with technology)</SelectItem>
                    <SelectItem value="highly-technical">Highly technical (developer/engineer)</SelectItem>
                    <SelectItem value="specialist">Data/AI specialist</SelectItem>
                    <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentTab("purpose")}>Back</Button>
                <Button onClick={() => setCurrentTab("consent")}>Continue</Button>
              </div>
            </TabsContent>

            {/* SECTION 6: Consent */}
            <TabsContent value="consent" className="space-y-4">
              <h3 className="font-semibold text-lg">Consent & Privacy</h3>
              
              {isAdolescentAssessment && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Note for Students:</strong> If you are under 18, please ensure you have parental or guardian consent before taking this assessment.
                  </p>
                </div>
              )}
              
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold">Required Consents</h4>
                
                <div className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                  <Checkbox
                    id="consent1"
                    checked={consentAssessment}
                    onCheckedChange={(checked) => setConsentAssessment(checked as boolean)}
                  />
                  <Label htmlFor="consent1" className="text-sm cursor-pointer leading-relaxed">
                    <span className="text-destructive">*</span> I {isAdolescentAssessment ? 'have parental/guardian permission and' : ''} consent to taking this <span className="whitespace-nowrap">AI Quotient (AIQ)</span> assessment and understand that my responses will be used to evaluate my AI competency across 8 dimensions.
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                  <Checkbox
                    id="consent2"
                    checked={consentDataUsage}
                    onCheckedChange={(checked) => setConsentDataUsage(checked as boolean)}
                  />
                  <Label htmlFor="consent2" className="text-sm cursor-pointer leading-relaxed">
                    <span className="text-destructive">*</span> I understand that my demographic information and assessment results may be used in aggregate form to improve the assessment and generate insights. My individual responses will remain confidential.
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                  <Checkbox
                    id="consent3"
                    checked={consentResultsAccess}
                    onCheckedChange={(checked) => setConsentResultsAccess(checked as boolean)}
                  />
                  <Label htmlFor="consent3" className="text-sm cursor-pointer leading-relaxed">
                    <span className="text-destructive">*</span> I understand that my assessment results and certificate will be available for download as a PDF from my dashboard.
                  </Label>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <Checkbox
                    id="consentSecurity"
                    checked={consentSecurityMonitoring}
                    onCheckedChange={(checked) => setConsentSecurityMonitoring(checked as boolean)}
                  />
                  <Label htmlFor="consentSecurity" className="text-sm cursor-pointer leading-relaxed">
                    <span className="text-destructive">*</span> I consent to security monitoring during the assessment, including AI assistant detection, copy/paste blocking, tab switching monitoring, and violation logging. I understand that 3 violations will result in test termination.
                  </Label>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold">Optional Consents</h4>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent4"
                    checked={consentResearch}
                    onCheckedChange={(checked) => setConsentResearch(checked as boolean)}
                  />
                  <Label htmlFor="consent4" className="text-sm cursor-pointer leading-relaxed">
                    I consent to my anonymized data being used for research purposes to advance <span className="whitespace-nowrap">AI Quotient (AIQ)</span> understanding and improve educational resources.
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent5"
                    checked={consentCommunications}
                    onCheckedChange={(checked) => setConsentCommunications(checked as boolean)}
                  />
                  <Label htmlFor="consent5" className="text-sm cursor-pointer leading-relaxed">
                    I would like to receive occasional updates about AI literacy resources, new assessments, and educational opportunities.
                  </Label>
                </div>
              </div>

              {(!consentAssessment || !consentDataUsage || !consentResultsAccess || !consentSecurityMonitoring) && (
                <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                  <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Please check all three required consent boxes to proceed
                  </p>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentTab("demographics")}>Back</Button>
                <Button variant="outline" onClick={onDecline}>Decline</Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!consentAssessment || !consentDataUsage || !consentResultsAccess}
                >
                  Submit & Start Test
                </Button>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
