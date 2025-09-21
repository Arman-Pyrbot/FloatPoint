'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import supabase from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Waves, Thermometer, Droplets, Gauge, Beaker, Leaf } from 'lucide-react';

interface PredictionResult {
  '🌡️ Temperature': string;
  '🧂 Salinity': string;
  '📊 Pressure': string;
  '💨 Dissolved Oxygen': string;
  '🧪 Nitrate': string;
  '🌱 Chlorophyll-a': string;
}

interface PredictionResponse {
  success: boolean;
  prediction: PredictionResult;
  input: {
    temperature: number;
    salinity: number;
    pressure: number;
    dissolvedOxygen?: number | null;
    nitrate?: number | null;
    chlorophyll?: number | null;
  };
  timestamp: string;
  error?: string;
}

export default function PredictionForm() {
  const [formData, setFormData] = useState({
    temperature: '25.5',
    salinity: '35.2',
    pressure: '100.0',
    dissolvedOxygen: '',
    nitrate: '',
    chlorophyll: ''
  });
  
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreset = (preset: 'surface' | 'deep' | 'upwelling') => {
    const presets = {
      surface: {
        temperature: '28.5',
        salinity: '36.2',
        pressure: '5.0',
        dissolvedOxygen: '',
        nitrate: '',
        chlorophyll: ''
      },
      deep: {
        temperature: '15.2',
        salinity: '34.8',
        pressure: '150.0',
        dissolvedOxygen: '',
        nitrate: '',
        chlorophyll: ''
      },
      upwelling: {
        temperature: '22.1',
        salinity: '35.5',
        pressure: '50.0',
        dissolvedOxygen: '',
        nitrate: '',
        chlorophyll: ''
      }
    };
    
    setFormData(presets[preset]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
        },
        body: JSON.stringify({
          temperature: parseFloat(formData.temperature),
          salinity: parseFloat(formData.salinity),
          pressure: parseFloat(formData.pressure),
          dissolvedOxygen: formData.dissolvedOxygen ? parseFloat(formData.dissolvedOxygen) : null,
          nitrate: formData.nitrate ? parseFloat(formData.nitrate) : null,
          chlorophyll: formData.chlorophyll ? parseFloat(formData.chlorophyll) : null,
        }),
      });

      const data: PredictionResponse = await response.json();

      if (data.success) {
        setPrediction(data.prediction);
      } else {
        setError(data.error || 'Prediction failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">BGC Parameter Prediction</h3>
        {/* Input Form */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Core Parameters */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-700">Core Parameters (Required)</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="temperature" className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3" />
                    Temperature (°C)
                  </Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => handleInputChange('temperature', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="salinity" className="flex items-center gap-1">
                    <Droplets className="h-3 w-3" />
                    Salinity (PSU)
                  </Label>
                  <Input
                    id="salinity"
                    type="number"
                    step="0.1"
                    value={formData.salinity}
                    onChange={(e) => handleInputChange('salinity', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="pressure" className="flex items-center gap-1">
                    <Gauge className="h-3 w-3" />
                    Pressure (dbar)
                  </Label>
                  <Input
                    id="pressure"
                    type="number"
                    step="0.1"
                    value={formData.pressure}
                    onChange={(e) => handleInputChange('pressure', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* BGC Parameters */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-700">Biogeochemical Parameters (Optional)</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dissolvedOxygen" className="flex items-center gap-1">
                    <Beaker className="h-3 w-3" />
                    Dissolved O₂ (umol/kg)
                  </Label>
                  <Input
                    id="dissolvedOxygen"
                    type="number"
                    step="0.1"
                    value={formData.dissolvedOxygen}
                    onChange={(e) => handleInputChange('dissolvedOxygen', e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                
                <div>
                  <Label htmlFor="nitrate" className="flex items-center gap-1">
                    <Beaker className="h-3 w-3" />
                    Nitrate (umol/kg)
                  </Label>
                  <Input
                    id="nitrate"
                    type="number"
                    step="0.1"
                    value={formData.nitrate}
                    onChange={(e) => handleInputChange('nitrate', e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                
                <div>
                  <Label htmlFor="chlorophyll" className="flex items-center gap-1">
                    <Leaf className="h-3 w-3" />
                    Chlorophyll-a (mg/m³)
                  </Label>
                  <Input
                    id="chlorophyll"
                    type="number"
                    step="0.01"
                    value={formData.chlorophyll}
                    onChange={(e) => handleInputChange('chlorophyll', e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Preset Buttons */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-gray-700">Quick Presets</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreset('surface')}
                >
                  Surface Waters
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreset('deep')}
                >
                  Deep Waters
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreset('upwelling')}
                >
                  Upwelling Region
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Predicting...
                </>
              ) : (
                'Predict Next Step'
              )}
            </Button>
          </form>
      </div>

      {/* Results */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {prediction && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Prediction Results</h4>
          <div className="space-y-3">
            {Object.entries(prediction).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                <span className="font-medium text-sm">{key}</span>
                <span className="text-sm text-gray-600">{value}</span>
              </div>
            ))}
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-xs">
                Predictions generated using FloatPoint BGC LSTM model trained on Indian Ocean data.
                Average accuracy: 67.7% R² score.
              </p>
            </div>
          </div>
        </div>
      )}

      {!prediction && !error && !loading && (
        <div className="text-center py-12 text-gray-500">
          <Waves className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Enter parameters and click predict to see results</p>
        </div>
      )}
      </div>
    </div>
  );
}