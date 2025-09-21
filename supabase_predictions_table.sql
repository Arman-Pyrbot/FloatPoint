-- Create predictions table for storing BGC model predictions
CREATE TABLE IF NOT EXISTS predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Input parameters
    input_temperature DECIMAL(5,2) NOT NULL,
    input_salinity DECIMAL(5,2) NOT NULL,
    input_pressure DECIMAL(6,2) NOT NULL,
    input_dissolved_oxygen DECIMAL(6,2),
    input_nitrate DECIMAL(5,2),
    input_chlorophyll DECIMAL(6,3),
    
    -- Predicted parameters
    predicted_temperature DECIMAL(5,2) NOT NULL,
    predicted_salinity DECIMAL(5,2) NOT NULL,
    predicted_pressure DECIMAL(6,2) NOT NULL,
    predicted_dissolved_oxygen DECIMAL(6,2) NOT NULL,
    predicted_nitrate DECIMAL(5,2) NOT NULL,
    predicted_chlorophyll DECIMAL(6,3) NOT NULL,
    
    -- Metadata
    model_version VARCHAR(50) DEFAULT 'FloatPoint BGC LSTM v1.0',
    confidence_score DECIMAL(4,3),
    region VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_predictions_region ON predictions(region);

-- Enable Row Level Security (RLS)
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own predictions
CREATE POLICY "Users can view their own predictions" ON predictions
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own predictions
CREATE POLICY "Users can insert their own predictions" ON predictions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own predictions
CREATE POLICY "Users can update their own predictions" ON predictions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own predictions
CREATE POLICY "Users can delete their own predictions" ON predictions
    FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_predictions_updated_at 
    BEFORE UPDATE ON predictions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON predictions TO authenticated;
GRANT ALL ON predictions TO service_role;