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
    
    // Extract oceanographic parameters
    const { temperature, salinity, pressure, dissolvedOxygen, nitrate, chlorophyll } = body;
    
    // Validate required parameters
    if (temperature === undefined || salinity === undefined || pressure === undefined) {
      return NextResponse.json(
        { error: 'Temperature, salinity, and pressure are required parameters' },
        { status: 400 }
      );
    }
    
    // Prepare data for the HF model
    const modelInput = [
      temperature,
      salinity, 
      pressure,
      dissolvedOxygen || null,
      nitrate || null,
      chlorophyll || null
    ];
    
    // Call the Hugging Face Space API using gradio client
    const { Client } = await import('@gradio/client');
    const client = await Client.connect(HF_SPACE_URL);
    
    const prediction = await client.predict("/predict_oceanographic_parameters", {
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

export async function GET() {
  return NextResponse.json({
    message: 'FloatPoint BGC Prediction API',
    version: '1.0.0',
    endpoints: {
      POST: '/api/predict - Make oceanographic predictions'
    },
    parameters: {
      required: ['temperature', 'salinity', 'pressure'],
      optional: ['dissolvedOxygen', 'nitrate', 'chlorophyll']
    }
  });
}