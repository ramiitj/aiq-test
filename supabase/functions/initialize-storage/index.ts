import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UploadResult {
  fileName: string;
  success: boolean;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase.rpc('check_admin_constant_time', {
      _user_id: user.id,
    });

    if (roleError || !roleData) {
      throw new Error('Admin access required');
    }

    console.log('Starting batch storage initialization for admin:', user.email);

    // List of all 34 assessment files that should be uploaded
    const assessmentFiles = [
      // General assessments
      'general-beginner.json',
      'general-advanced.json',
      // Adolescent assessments
      'adolescent-14-15.json',
      'adolescent-16-17.json',
      // Professional assessments (30 files: 15 roles × 2 levels)
      'ac-beginner.json',
      'ac-advanced.json',
      'ba-beginner.json',
      'ba-advanced.json',
      'ds-beginner.json',
      'ds-advanced.json',
      'dm-beginner.json',
      'dm-advanced.json',
      'doc-beginner.json',
      'doc-advanced.json',
      'fa-beginner.json',
      'fa-advanced.json',
      'ha-beginner.json',
      'ha-advanced.json',
      'hr-beginner.json',
      'hr-advanced.json',
      'lawyer-beginner.json',
      'lawyer-advanced.json',
      'mc-beginner.json',
      'mc-advanced.json',
      'ops-beginner.json',
      'ops-advanced.json',
      'pm-beginner.json',
      'pm-advanced.json',
      'sales-beginner.json',
      'sales-advanced.json',
      'sde-beginner.json',
      'sde-advanced.json',
      'teachers-beginner.json',
      'teachers-advanced.json',
    ];

    const results: UploadResult[] = [];

    // Process each file
    for (const fileName of assessmentFiles) {
      try {
        // Read file from the storage-uploads directory
        const filePath = `./storage-uploads/${fileName}`;
        
        let fileContent: string;
        try {
          fileContent = await Deno.readTextFile(filePath);
        } catch (readError) {
          console.error(`Failed to read file ${fileName}:`, readError);
          results.push({
            fileName,
            success: false,
            error: `File not found in storage-uploads directory`,
          });
          continue;
        }

        // Validate JSON
        try {
          JSON.parse(fileContent);
        } catch (parseError) {
          console.error(`Invalid JSON in ${fileName}:`, parseError);
          results.push({
            fileName,
            success: false,
            error: 'Invalid JSON format',
          });
          continue;
        }

        // Upload to storage bucket
        const { error: uploadError } = await supabase.storage
          .from('aiq-items')
          .upload(fileName, new Blob([fileContent], { type: 'application/json' }), {
            upsert: true,
            contentType: 'application/json',
          });

        if (uploadError) {
          console.error(`Failed to upload ${fileName}:`, uploadError);
          results.push({
            fileName,
            success: false,
            error: uploadError.message,
          });
        } else {
          console.log(`Successfully uploaded ${fileName}`);
          results.push({
            fileName,
            success: true,
          });
        }
      } catch (error: any) {
        console.error(`Error processing ${fileName}:`, error);
        results.push({
          fileName,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Batch upload complete: ${successCount} succeeded, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Uploaded ${successCount}/${assessmentFiles.length} files`,
        results,
        summary: {
          total: assessmentFiles.length,
          succeeded: successCount,
          failed: failCount,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in initialize-storage function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
