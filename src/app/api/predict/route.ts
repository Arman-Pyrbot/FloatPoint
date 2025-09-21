import { NextRequest, NextResponse } from 'next/server';

const HF_SPACE_URL = 'https://armanpyro-floatpoint.hf.space';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Only handle NLP queries
    if (body.query && typeof body.query === 'string') {
      return handleNLPQuery(body.query);
    }
    
    return NextResponse.json(
      { error: 'Only NLP queries are supported. Please provide a query parameter.' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Request failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

async function handleNLPQuery(query: string) {
  try {
    // Call the Hugging Face Space NLP endpoint
    const { Client } = await import('@gradio/client');
    const client = await Client.connect(HF_SPACE_URL);
    
    // Call the NLP query function
    const response = await client.predict("/process_nlp_query", {
      query: query
    });
    
    return NextResponse.json({
      success: true,
      query: query,
      response: response.data,
      timestamp: new Date().toISOString(),
      type: 'nlp_query'
    });
    
  } catch (error) {
    console.error('NLP query error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'NLP query failed',
        query: query,
        timestamp: new Date().toISOString(),
        type: 'nlp_query'
      },
      { status: 500 }
    );
  }
}


export async function GET() {
  return NextResponse.json({
    message: 'FloatPoint NLP Oceanographic Query API',
    version: '1.0.0',
    endpoints: {
      POST: '/api/predict - Process natural language oceanographic queries'
    },
    usage: {
      description: 'Natural language query processing for oceanographic predictions',
      required: ['query'],
      example: 'What\'s the temperature at 15°N 75°E tomorrow?'
    }
  });
}