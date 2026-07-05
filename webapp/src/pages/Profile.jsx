import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    weight: '',
    height: '',
    gender: 'male',
    activity_level: '1.2',
    goal: 'maintain'
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await userService.getMe();
      setFormData({
        full_name: data.full_name || '',
        age: data.age !== null ? String(data.age) : '',
        weight: data.weight !== null ? String(data.weight) : '',
        height: data.height !== null ? String(data.height) : '',
        gender: data.gender || 'male',
        activity_level: data.activity_level !== null ? String(data.activity_level) : '1.2',
        goal: data.goal || 'maintain'
      });
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    // Convert fields to correct types for API
    const profilePayload = {
      full_name: formData.full_name,
      age: formData.age ? parseInt(formData.age, 10) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      height: formData.height ? parseFloat(formData.height) : null,
      gender: formData.gender,
      activity_level: parseFloat(formData.activity_level),
      goal: formData.goal
    };

    try {
      await userService.updateProfile(profilePayload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please check the inputs.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--primary)' }}>
        Loading Profile Engine...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="glass-card" 
          style={{ 
            padding: '0.8rem 1.2rem', 
            borderRadius: '12px', 
            cursor: 'pointer', 
            border: 'none', 
            color: 'var(--text-muted)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            background: 'var(--glass)'
          }}
        >
          <ArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </button>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '1.8rem' }}>Profile Settings</h1>
        </div>
      </header>

      {/* Main Card */}
      <main className="glass-card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
          <Sparkles color="var(--primary)" size={24} />
          <h2 style={{ fontSize: '1.5rem' }}>Biometric Parameters</h2>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(255, 0, 84, 0.1)', border: '1px solid var(--accent)', borderRadius: '12px', color: 'var(--accent)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '1rem', background: 'rgba(142, 249, 243, 0.1)', border: '1px solid var(--primary)', borderRadius: '12px', color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Profile updated and daily calorie goal recalculated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Full Name
              <input 
                type="text" 
                name="full_name" 
                value={formData.full_name} 
                onChange={handleInputChange} 
                className="input-field" 
                style={{ marginBottom: 0 }}
                placeholder="John Doe"
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Age (years)
              <input 
                type="number" 
                name="age" 
                value={formData.age} 
                onChange={handleInputChange} 
                className="input-field" 
                style={{ marginBottom: 0 }}
                placeholder="25"
                min="1"
                max="120"
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Gender
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleInputChange} 
                className="input-field" 
                style={{ marginBottom: 0, background: '#1c1c24' }}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Height (cm)
              <input 
                type="number" 
                name="height" 
                value={formData.height} 
                onChange={handleInputChange} 
                className="input-field" 
                style={{ marginBottom: 0 }}
                placeholder="175"
                min="50"
                max="250"
                step="0.1"
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Weight (kg)
              <input 
                type="number" 
                name="weight" 
                value={formData.weight} 
                onChange={handleInputChange} 
                className="input-field" 
                style={{ marginBottom: 0 }}
                placeholder="70"
                min="10"
                max="300"
                step="0.1"
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Activity Level
              <select 
                name="activity_level" 
                value={formData.activity_level} 
                onChange={handleInputChange} 
                className="input-field" 
                style={{ marginBottom: 0, background: '#1c1c24' }}
              >
                <option value="1.2">Sedentary (No exercise)</option>
                <option value="1.375">Lightly Active (1-3 days/week)</option>
                <option value="1.55">Moderately Active (3-5 days/week)</option>
                <option value="1.725">Very Active (6-7 days/week)</option>
                <option value="1.9">Extra Active (Intense twice/day)</option>
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Fitness Goal
              <select 
                name="goal" 
                value={formData.goal} 
                onChange={handleInputChange} 
                className="input-field" 
                style={{ marginBottom: 0, background: '#1c1c24' }}
              >
                <option value="lose">Lose Weight (-500 kcal)</option>
                <option value="maintain">Maintain Weight (0 kcal)</option>
                <option value="gain">Gain Weight (+500 kcal)</option>
              </select>
            </label>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ 
              marginTop: '1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px' 
            }}
            disabled={saving}
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Calculating & Saving...' : 'Save & Recalculate Calorie Goal'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default Profile;
