import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const CreateIncidentSchema = z.object({
  incidentId: z.string(),
  userId: z.string(),
  timestamp: z.string(),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    address: z.string().optional(),
    state: z.string(),
  }),
  recordingUrl: z.string().optional(),
  summary: z.string(),
  sharedStatus: z.enum(['private', 'shared_contacts', 'shared_legal']).default('private'),
  metadata: z.object({
    duration: z.number().optional(),
    interactionType: z.string(),
    officerBadgeNumbers: z.array(z.string()).optional(),
    vehicleInfo: z.string().optional(),
    notes: z.string().optional(),
  }),
});

const GetIncidentsSchema = z.object({
  userId: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  try {
    const params = {
      userId: searchParams.get('userId') || undefined,
      limit: searchParams.get('limit') || '10',
      offset: searchParams.get('offset') || '0',
    };

    const { userId, limit, offset } = GetIncidentsSchema.parse(params);

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build query
    let query = supabaseAdmin
      .from('incidents')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: incidents, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch incidents' },
        { status: 500 }
      );
    }

    // Transform database format to app format
    const transformedIncidents = incidents.map(incident => ({
      incidentId: incident.incident_id,
      userId: incident.user_id,
      timestamp: incident.timestamp,
      location: incident.location,
      recordingUrl: incident.recording_url,
      summary: incident.summary,
      sharedStatus: incident.shared_status,
      metadata: incident.metadata,
    }));

    return NextResponse.json({
      success: true,
      data: transformedIncidents,
      total: incidents.length,
    });

  } catch (error) {
    console.error('Get incidents error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const incident = CreateIncidentSchema.parse(body);

    const { data, error } = await supabaseAdmin
      .from('incidents')
      .insert({
        incident_id: incident.incidentId,
        user_id: incident.userId,
        timestamp: incident.timestamp,
        location: incident.location,
        recording_url: incident.recordingUrl,
        summary: incident.summary,
        shared_status: incident.sharedStatus,
        metadata: incident.metadata,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating incident:', error);
      return NextResponse.json(
        { error: 'Failed to create incident' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        incidentId: data.incident_id,
        userId: data.user_id,
        timestamp: data.timestamp,
        location: data.location,
        recordingUrl: data.recording_url,
        summary: data.summary,
        sharedStatus: data.shared_status,
        metadata: data.metadata,
      }
    });

  } catch (error) {
    console.error('Create incident error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid incident data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const UpdateIncidentSchema = z.object({
      incidentId: z.string(),
      summary: z.string().optional(),
      sharedStatus: z.enum(['private', 'shared_contacts', 'shared_legal']).optional(),
      metadata: z.object({
        duration: z.number().optional(),
        interactionType: z.string().optional(),
        officerBadgeNumbers: z.array(z.string()).optional(),
        vehicleInfo: z.string().optional(),
        notes: z.string().optional(),
      }).optional(),
    });

    const { incidentId, ...updates } = UpdateIncidentSchema.parse(body);

    const { data, error } = await supabaseAdmin
      .from('incidents')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('incident_id', incidentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating incident:', error);
      return NextResponse.json(
        { error: 'Failed to update incident' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        incidentId: data.incident_id,
        userId: data.user_id,
        timestamp: data.timestamp,
        location: data.location,
        recordingUrl: data.recording_url,
        summary: data.summary,
        sharedStatus: data.shared_status,
        metadata: data.metadata,
      }
    });

  } catch (error) {
    console.error('Update incident error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid update data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
