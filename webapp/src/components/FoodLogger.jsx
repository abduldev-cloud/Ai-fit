import React, { useState } from 'react';
import { Send, Loader2, X, Check, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { foodService } from '../services/api';

const FoodLogger = ({ onLogSuccess }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [estimatedData, setEstimatedData] = useState(null);

  const handleEstimate = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      const data = await foodService.estimateFood(text);
      setEstimatedData(data);
    } catch (err) {
      console.error("Failed to estimate food:", err);
      alert("Failed to connect to AI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!estimatedData) return;
    setLoading(true);
    try {
      await foodService.logFoodDirect(estimatedData);
      setText('');
      setEstimatedData(null);
      if (onLogSuccess) onLogSuccess();
    } catch (err) {
      console.error("Failed to log food:", err);
      alert("Failed to save food log.");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    setEstimatedData(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(',')[1]; // Strip data:image/...;base64, prefix
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/api/v1/food/estimate/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_base64: base64 })
        });
        const data = await response.json();
        setEstimatedData(data);
      } catch (err) {
        console.error("Failed to estimate from image:", err);
        alert("Failed to analyze image. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="glass-card" style={{ marginBottom: '2rem' }}>
      <h3>Log your meal with <span className="gradient-text">AI</span></h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Type anything: "3 eggs and avocado" or upload a photo of your food
      </p>
      
      <AnimatePresence mode="wait">
        {!estimatedData ? (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <form onSubmit={handleEstimate} style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="What did you eat today?" 
                className="input-field" 
                style={{ paddingRight: '120px', marginBottom: '1rem' }}
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={loading}
              />
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ 
                  position: 'absolute', 
                  right: '6px', 
                  top: '6px', 
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                disabled={loading || !text.trim()}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {loading ? 'Analyzing...' : 'Calculate'}
              </button>
            </form>

            {/* Image Upload */}
            <label 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '8px',
                padding: '12px', 
                borderRadius: '12px', 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px dashed rgba(255,255,255,0.1)', 
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
            >
              <Camera size={18} />
              Upload Food Photo
              <input 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleImageUpload}
                disabled={loading}
              />
            </label>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ 
              background: 'rgba(142,249,243,0.03)', 
              borderRadius: '16px', 
              padding: '2rem', 
              border: '1px solid rgba(142,249,243,0.15)',
              textAlign: 'center'
            }}
          >
            <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{estimatedData.food_name}</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0' }}>
              {estimatedData.calories} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>kcal</span>
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span>Protein: <strong style={{color: '#fff'}}>{estimatedData.protein}g</strong></span>
              <span>Carbs: <strong style={{color: '#fff'}}>{estimatedData.carbs}g</strong></span>
              <span>Fat: <strong style={{color: '#fff'}}>{estimatedData.fat}g</strong></span>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={handleDiscard}
                className="glass-card"
                style={{ 
                  flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer', 
                  border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: 'transparent'
                }}
                disabled={loading}
              >
                <X size={18} /> Discard
              </button>
              <button 
                onClick={handleConfirm}
                className="btn-primary"
                style={{ 
                  flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                {loading ? 'Saving...' : 'Add to Goal'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FoodLogger;
