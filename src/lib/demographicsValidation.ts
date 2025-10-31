import { z } from 'zod';

/**
 * Validation schemas for demographics and consent form
 */

// Section 1: Basic Information
export const basicInfoSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(100, "Name must be less than 100 characters"),
  phone_number: z.string().optional(),
});

// Section 2: Professional Background
export const professionalBackgroundSchema = z.object({
  job_role: z.string().min(1, "Current role/title is required"),
  organization_type: z.string().min(1, "Organization type is required"),
  organization_size: z.string().optional(),
  industry_sector: z.string().min(1, "Industry/sector is required"),
  years_experience: z.string().min(1, "Years of experience is required"),
});

// Section 3: AI Experience
export const aiExperienceSchema = z.object({
  ai_familiarity: z.string().min(1, "AI familiarity level is required"),
  ai_tools_used: z.array(z.string()).min(1, "Please select at least one AI tool option"),
  ai_usage_frequency: z.string().min(1, "AI usage frequency is required"),
  ai_use_cases: z.array(z.string()).optional(),
  ai_training: z.string().min(1, "AI training level is required"),
});

// Section 4: Assessment Purpose
export const assessmentPurposeSchema = z.object({
  assessment_reasons: z.array(z.string()).min(1, "Please select at least one reason for taking the assessment"),
  assessment_tier: z.string().min(1, "Assessment tier is required"),
  results_usage: z.array(z.string()).optional(),
});

// Section 5: Optional Demographics
export const optionalDemographicsSchema = z.object({
  age_range: z.string().optional(),
  education_level: z.string().optional(),
  country: z.string().optional(),
  primary_language: z.string().optional(),
  technical_background: z.string().optional(),
});

// Section 6: Consent
export const consentSchema = z.object({
  consent_assessment: z.literal(true, { errorMap: () => ({ message: "You must consent to participate in the assessment" }) }),
  consent_data_usage: z.literal(true, { errorMap: () => ({ message: "You must consent to data usage" }) }),
  consent_results_access: z.literal(true, { errorMap: () => ({ message: "You must consent to results access" }) }),
  consent_research: z.boolean().optional(),
  consent_communications: z.boolean().optional(),
});

// Complete demographics data schema
export const completeDemographicsSchema = z.object({
  ...basicInfoSchema.shape,
  ...professionalBackgroundSchema.shape,
  ...aiExperienceSchema.shape,
  ...assessmentPurposeSchema.shape,
  ...optionalDemographicsSchema.shape,
  ...consentSchema.shape,
});

export type DemographicsData = z.infer<typeof completeDemographicsSchema>;

/**
 * Validate complete demographics data
 */
export const validateDemographics = (data: any) => {
  try {
    const result = completeDemographicsSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Invalid form data",
        errors: error.errors,
      };
    }
    return { success: false, error: "Unknown validation error" };
  }
};

/**
 * Validate individual sections
 */
export const validateSection = (section: string, data: any) => {
  const schemas: Record<string, z.ZodSchema> = {
    basicInfo: basicInfoSchema,
    professionalBackground: professionalBackgroundSchema,
    aiExperience: aiExperienceSchema,
    assessmentPurpose: assessmentPurposeSchema,
    optionalDemographics: optionalDemographicsSchema,
    consent: consentSchema,
  };

  const schema = schemas[section];
  if (!schema) return { success: false, error: "Invalid section" };

  try {
    schema.parse(data);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors,
      };
    }
    return { success: false, error: "Unknown validation error" };
  }
};
