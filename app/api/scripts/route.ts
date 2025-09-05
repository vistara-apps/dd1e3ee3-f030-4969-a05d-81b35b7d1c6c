import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { SAMPLE_SCRIPTS } from '@/lib/constants';
import { z } from 'zod';

const GetScriptsSchema = z.object({
  scenario: z.string().optional(),
  language: z.enum(['en', 'es']).optional(),
  state: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  try {
    const params = {
      scenario: searchParams.get('scenario') || undefined,
      language: searchParams.get('language') || undefined,
      state: searchParams.get('state') || undefined,
    };

    const { scenario, language, state } = GetScriptsSchema.parse(params);

    // Build query
    let query = supabaseAdmin.from('scripts').select('*');

    if (scenario) {
      query = query.eq('scenario', scenario);
    }
    if (language) {
      query = query.eq('language', language);
    }
    if (state) {
      query = query.contains('state_applicability', [state]);
    }

    const { data: scripts, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      
      // Fallback to sample data if database is not available
      let fallbackScripts = SAMPLE_SCRIPTS;
      
      if (scenario) {
        fallbackScripts = fallbackScripts.filter(script => script.scenario === scenario);
      }
      if (language) {
        fallbackScripts = fallbackScripts.filter(script => script.language === language);
      }
      if (state) {
        fallbackScripts = fallbackScripts.filter(script => 
          script.stateApplicability.includes('ALL') || script.stateApplicability.includes(state)
        );
      }

      return NextResponse.json({
        success: true,
        data: fallbackScripts,
        source: 'fallback'
      });
    }

    // Transform database format to app format
    const transformedScripts = scripts.map(script => ({
      scriptId: script.script_id,
      scenario: script.scenario,
      language: script.language,
      content: script.content,
      stateApplicability: script.state_applicability,
    }));

    return NextResponse.json({
      success: true,
      data: transformedScripts,
      source: 'database'
    });

  } catch (error) {
    console.error('Get scripts error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    // Return sample data as fallback
    return NextResponse.json({
      success: true,
      data: SAMPLE_SCRIPTS,
      source: 'fallback'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const ScriptSchema = z.object({
      scriptId: z.string(),
      scenario: z.string(),
      language: z.enum(['en', 'es']),
      content: z.object({
        title: z.string(),
        situation: z.string(),
        doSay: z.array(z.string()),
        dontSay: z.array(z.string()),
        keyPoints: z.array(z.string())
      }),
      stateApplicability: z.array(z.string()),
    });

    const script = ScriptSchema.parse(body);

    const { data, error } = await supabaseAdmin
      .from('scripts')
      .insert({
        script_id: script.scriptId,
        scenario: script.scenario,
        language: script.language,
        content: script.content,
        state_applicability: script.stateApplicability,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating script:', error);
      return NextResponse.json(
        { error: 'Failed to create script' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        scriptId: data.script_id,
        scenario: data.scenario,
        language: data.language,
        content: data.content,
        stateApplicability: data.state_applicability,
      }
    });

  } catch (error) {
    console.error('Create script error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid script data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
