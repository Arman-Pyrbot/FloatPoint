import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const HF_SPACE_URL = 'https://armanpyro-floatpoint.hf.space';

// Initialize Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to determine region based on oceanographic parameters
function determineRegion(temperature: number, salinity: number, pressure: number): string {
  // Simple heuristic based on typical Indian Ocean characteristics
  if (temperature > 27 && salinity > 35.5) {
    return 'Arabian Sea (Surface)';
  } else if (temperature < 20 && pressure > 100) {
    return 'Deep Waters';
  } else if (temperature > 25 && pressure < 50) {
    return 'Surface Waters';
  } else if (temperature < 25 && salinity < 35) {
    return 'Bay of Bengal';
  } else {
    return 'Indian Ocean';
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if this is an NLP query or spatial-temporal prediction
    if (body.query && typeof body.query === 'string') {
      return handleNLPQuery(body.query, request);
    }
    
    // Check if this is a spatial-temporal prediction
    if (body.latitude !== undefined && body.longitude !== undefined) {
      return handleSpatialTemporalPrediction(body.latitude, body.longitude, body.datetime_str, request);
    }
    
    // Extract oceanographic parameters for BGC prediction
    const { temperature, salinity, pressure, dissolvedOxygen, nitrate, chlorophyll } = body;
    
    // Validate required parameters
    if (temperature === undefined || salinity === undefined || pressure === undefined) {
      return NextResponse.json(
        { error: 'Temperature, salinity, and pressure are required parameters' },
        { status: 400 }
      );
    }
    
    // Call the Hugging Face Space API using gradio client
    const { Client } = await import('@gradio/client');
    const client = await Client.connect(HF_SPACE_URL);
    
    const prediction = await client.predict("/predict_bgc_parameters", {
      temp: temperature,
      psal: salinity,
      pres: pressure,
      doxy: dissolvedOxygen,
      nitrate: nitrate,
      chla: chlorophyll
    });
    
    const predictionData = Array.isArray(prediction.data) ? prediction.data[0] : prediction.data;
    
    // Extract predicted values from the response
    const extractValue = (str: string | undefined) => {
      if (!str) return 0;
      return parseFloat(str.split(' ')[0]);
    };
    
    const predictedValues = {
      temperature: extractValue(predictionData?.['🌡️ Temperature']),
      salinity: extractValue(predictionData?.['🧂 Salinity']),
      pressure: extractValue(predictionData?.['📊 Pressure']),
      dissolvedOxygen: extractValue(predictionData?.['💨 Dissolved Oxygen']),
      nitrate: extractValue(predictionData?.['🧪 Nitrate']),
      chlorophyll: extractValue(predictionData?.['🌱 Chlorophyll-a'])
    };
    
    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    let userId = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }
    
    // Save prediction to database if user is authenticated
    if (userId) {
      try {
        await supabase.from('predictions').insert({
          user_id: userId,
          input_temperature: temperature,
          input_salinity: salinity,
          input_pressure: pressure,
          input_dissolved_oxygen: dissolvedOxygen,
          input_nitrate: nitrate,
          input_chlorophyll: chlorophyll,
          predicted_temperature: predictedValues.temperature,
          predicted_salinity: predictedValues.salinity,
          predicted_pressure: predictedValues.pressure,
          predicted_dissolved_oxygen: predictedValues.dissolvedOxygen,
          predicted_nitrate: predictedValues.nitrate,
          predicted_chlorophyll: predictedValues.chlorophyll,
          region: determineRegion(temperature, salinity, pressure)
        });
      } catch (dbError) {
        console.error('Failed to save prediction to database:', dbError);
        // Continue without failing the request
      }
    }
    
    // Return the prediction with metadata
    return NextResponse.json({
      success: true,
      input: {
        temperature,
        salinity,
        pressure,
        dissolvedOxygen,
        nitrate,
        chlorophyll
      },
      prediction: predictionData,
      predictedValues,
      timestamp: new Date().toISOString(),
      model: 'FloatPoint BGC LSTM'
    });
    
  } catch (error) {
    console.error('Prediction API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Prediction failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

async function handleNLPQuery(query: string, request: NextRequest) {
  try {
    // Call the Hugging Face Space NLP endpoint
    const { Client } = await import('@gradio/client');
    const client = await Client.connect(HF_SPACE_URL);
    
    // Call the NLP query function
    const response = await client.predict("/process_nlp_query", {
      query: query
    });
    
    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    let userId = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }
    
    // Save query to database if user is authenticated
    if (userId) {
      try {
        await supabase.from('queries').insert({
          user_id: userId,
          query_text: query,
          params: {
            type: 'nlp_query',
            response: response.data,
            timestamp: new Date().toISOString()
          }
        });
      } catch (dbError) {
        console.error('Failed to save query to database:', dbError);
        // Continue without failing the request
      }
    }
    
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

async function handleSpatialTemporalPrediction(latitude: number, longitude: number, datetimeStr?: string, request?: NextRequest) {
  try {
    // Call the Hugging Face Space Spatial-Temporal endpoint
    const { Client } = await import('@gradio/client');
    const client = await Client.connect(HF_SPACE_URL);
    
    // Call the spatial-temporal prediction function
    const response = await client.predict("/predict_spatial_temporal", {
      latitude: latitude,
      longitude: longitude,
      datetime_str: datetimeStr || new Date().toISOString()
    });
    
    // Get user from authorization header
    let userId = null;
    if (request) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id;
      }
    }
    
    // Save query to database if user is authenticated
    if (userId && request) {
      try {
        await supabase.from('queries').insert({
          user_id: userId,
          query_text: `Spatial-temporal prediction at ${latitude}°N, ${longitude}°E`,
          params: {
            type: 'spatial_temporal',
            latitude,
            longitude,
            datetime: datetimeStr || new Date().toISOString(),
            prediction: response.data,
            timestamp: new Date().toISOString()
          }
        });
      } catch (dbError) {
        console.error('Failed to save spatial-temporal query to database:', dbError);
        // Continue without failing the request
      }
    }
    
    return NextResponse.json({
      success: true,
      input: {
        latitude,
        longitude,
        datetime: datetimeStr || new Date().toISOString()
      },
      prediction: response.data,
      timestamp: new Date().toISOString(),
      type: 'spatial_temporal',
      model: 'FloatPoint Spatial-Temporal LSTM'
    });
    
  } catch (error) {
    console.error('Spatial-temporal prediction error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Spatial-temporal prediction failed',
        input: { latitude, longitude, datetime: datetimeStr },
        timestamp: new Date().toISOString(),
        type: 'spatial_temporal'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'FloatPoint Oceanographic Prediction API',
    version: '1.0.0',
    endpoints: {
      POST: '/api/predict - Make oceanographic predictions'
    },
    prediction_types: {
      bgc: {
        description: 'Biogeochemical parameter prediction',
        required: ['temperature', 'salinity', 'pressure'],
        optional: ['dissolvedOxygen', 'nitrate', 'chlorophyll']
      },
      nlp: {
        description: 'Natural language query processing',
        required: ['query'],
        example: 'What\'s the temperature at 15°N 75°E tomorrow?'
      },
      spatial_temporal: {
        description: 'Location and time-based predictions',
        required: ['latitude', 'longitude'],
        optional: ['datetime_str']
      }
    }
  });
}