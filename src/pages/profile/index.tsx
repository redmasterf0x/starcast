import { useEffect, useState } from 'react';
import { Field } from './components';
import { Profile, ProfileStatus } from './types';

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    display_name: 'Member',
    bio: 'Tell the community what you love about media and culture.',
    interests: 'Film, media, community, live storytelling',
    member_status: 'Member',
  });
  const [status, setStatus] = useState<ProfileStatus>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setStatus('loading');
        const response = await fetch('/api/profile');

        if (!response.ok) {
          if (response.status === 401) {
            setStatus('error');
            setError('Please sign in to create your profile.');
            return;
          }
          throw new Error('Unable to load profile.');
        }

        const data = await response.json();
        setProfile({
          display_name: data.profile?.display_name || 'Member',
          bio: data.profile?.bio || 'Tell the community what you love about media and culture.',
          interests: data.profile?.interests || 'Film, media, community, live storytelling',
          member_status: data.profile?.member_status || 'Member',
          email: data.profile?.email,
        });
        setStatus('saved');
      } catch (loadError) {
        setStatus('error');
        setError(loadError instanceof Error ? loadError.message : 'Unable to load profile.');
      }
    };

    loadProfile();
  }, []);

  const handleChange = (field: keyof Profile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setStatus('saving');
      setError('');

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to save profile.');
      }

      setStatus('saved');
    } catch (saveError) {
      setStatus('error');
      setError(saveError instanceof Error ? saveError.message : 'Unable to save profile.');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: '1.25rem' }}>
      <div>
        <p style={{ margin: 0, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.72rem' }}>Profile</p>
        <h1 style={{ margin: '0.4rem 0 0', fontSize: '2.6rem' }}>Create your member profile</h1>
      </div>

      <div style={{ padding: '1.25rem', borderRadius: 14, background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ margin: 0, color: '#dbeafe' }}>
          {profile.email ? `Profile for ${profile.email}` : 'Build a public profile for the community.'}
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1rem', padding: '1.25rem', borderRadius: 14, background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Field label="Display name" value={profile.display_name} onChange={(value) => handleChange('display_name', value)} />
        <Field label="Bio" value={profile.bio} multiline onChange={(value) => handleChange('bio', value)} />
        <Field label="Interests" value={profile.interests} onChange={(value) => handleChange('interests', value)} />
        <Field label="Member status" value={profile.member_status} onChange={(value) => handleChange('member_status', value)} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={status === 'saving'}
            style={{
              background: '#ff7a18',
              color: '#0b1020',
              border: 0,
              borderRadius: 10,
              padding: '0.8rem 1.1rem',
              fontWeight: 700,
              cursor: status === 'saving' ? 'not-allowed' : 'pointer',
            }}
          >
            {status === 'saving' ? 'Saving...' : 'Save profile'}
          </button>

          {status === 'saved' && <span style={{ color: '#a7f3d0' }}>Profile saved</span>}
          {status === 'error' && <span style={{ color: '#fca5a5' }}>{error}</span>}
        </div>
      </div>
    </div>
  );
}
