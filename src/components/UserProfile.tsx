'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Save, Edit3 } from 'lucide-react';
import supabase from '@/lib/supabaseClient';

interface UserProfileData {
  id: string;
  name: string;
  created_at: string;
}

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError('Not authenticated');
        return;
      }

      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', fetchError);
        setError('Failed to fetch profile');
        return;
      }

      if (existingProfile) {
        setProfile(existingProfile);
        setName(existingProfile.name || '');
      } else {
        // Create a new profile
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: session.user.id,
            name: session.user.email?.split('@')[0] || 'User'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          setError('Failed to create profile');
          return;
        }

        setProfile(newProfile);
        setName(newProfile.name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError('Not authenticated');
        return;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ name: name.trim() })
        .eq('id', session.user.id);

      if (error) {
        console.error('Error updating profile:', error);
        setError('Failed to update profile');
        return;
      }

      setProfile(prev => prev ? { ...prev, name: name.trim() } : null);
      setEditing(false);
      setMessage('Profile updated successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            User Profile
          </CardTitle>
          <CardDescription>
            Manage your profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading profile...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-500" />
          User Profile
        </CardTitle>
        <CardDescription>
          Manage your profile information
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {message && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
            <p className="text-green-700 text-sm">{message}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Display Name</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!editing}
                placeholder="Enter your display name"
              />
              {!editing ? (
                <Button
                  variant="outline"
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={saveProfile}
                    disabled={saving || !name.trim()}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      setName(profile?.name || '');
                      setError(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {profile && (
            <div className="text-sm text-gray-600">
              <p><strong>Member since:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
