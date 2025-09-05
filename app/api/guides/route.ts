import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { SAMPLE_GUIDES } from '@/lib/constants';
import { z } from 'zod';

const GetGuidesSchema = z.object({
  state: z.string().optional(),
  language: z.enum(['en', 'es']).optional(),
  type: z.enum(['basic', 'premium']).optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  try {
    const params = {
      state: searchParams.get('state') || undefined,
      language: searchParams.get('language') || undefined,
      type: searchParams.get('type') || undefined,
    };

    const { state, language, type } = GetGuidesSchema.parse(params);

    // Build query
    let query = supabaseAdmin.from('guides').select('*');

    if (state) {
      query = query.eq('state', state);
    }
    if (language) {
      query = query.eq('language', language);
    }
    if (type) {
      query = query.eq('type', type);
    }

    const { data: guides, error } = await query.order('last_updated', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      
      // Fallback to sample data if database is not available
      let fallbackGuides = SAMPLE_GUIDES;
      
      if (state) {
        fallbackGuides = fallbackGuides.filter(guide => guide.state === state);
      }
      if (language) {
        fallbackGuides = fallbackGuides.filter(guide => guide.language === language);
      }
      if (type) {
        fallbackGuides = fallbackGuides.filter(guide => guide.type === type);
      }

      return NextResponse.json({
        success: true,
        data: fallbackGuides,
        source: 'fallback'
      });
    }

    // Transform database format to app format
    const transformedGuides = guides.map(guide => ({
      guideId: guide.guide_id,
      state: guide.state,
      language: guide.language,
      content: guide.content,
      type: guide.type,
      lastUpdated: guide.last_updated,
    }));

    return NextResponse.json({
      success: true,
      data: transformedGuides,
      source: 'database'
    });

  } catch (error) {
    console.error('Get guides error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    // Return sample data as fallback
    return NextResponse.json({
      success: true,
      data: SAMPLE_GUIDES,
      source: 'fallback'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const GuideSchema = z.object({
      guideId: z.string(),
      state: z.string(),
      language: z.enum(['en', 'es']),
      content: z.object({
        title: z.string(),
        summary: z.string(),
        sections: z.array(z.object({
          title: z.string(),
          content: z.string(),
          importance: z.enum(['critical', 'important', 'helpful'])
        }))
      }),
      type: z.enum(['basic', 'premium']),
      lastUpdated: z.string(),
    });

    const guide = GuideSchema.parse(body);

    const { data, error } = await supabaseAdmin
      .from('guides')
      .insert({
        guide_id: guide.guideId,
        state: guide.state,
        language: guide.language,
        content: guide.content,
        type: guide.type,
        last_updated: guide.lastUpdated,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating guide:', error);
      return NextResponse.json(
        { error: 'Failed to create guide' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        guideId: data.guide_id,
        state: data.state,
        language: data.language,
        content: data.content,
        type: data.type,
        lastUpdated: data.last_updated,
      }
    });

  } catch (error) {
    console.error('Create guide error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid guide data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
