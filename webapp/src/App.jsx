import React from 'react';
import { motion } from 'framer-motion';
import { Target, Activity, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './index.css';

function App() {
  const navigate = useNavigate();
  return (
    <div className="landing-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Hero Section */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}
      >
        <h1 className="gradient-text" style={{ fontSize: '1.8rem' }}>FitMind AI</h1>
        <div>
          <button className="btn-primary" onClick={() => navigate('/auth')}>Get Started</button>
        </div>
      </motion.nav>

      <main style={{ textAlign: 'center' }}>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '4rem', marginBottom: '1.5rem', lineHeight: '1.2' }}
        >
          Your Personal <span className="gradient-text">AI Coach</span> <br /> 
          For Smarter Living.
        </motion.h2>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '3rem', maxWidth: '600px', marginInline: 'auto' }}>
          Real-time calorie tracking, personalized coaching, and a smarter engine that adapts to your body.
        </p>

        <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginTop: '4rem' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ background: 'rgba(142, 249, 243, 0.1)', padding: '12px', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem' }}>
              <Zap color="var(--primary)" size={32} />
            </div>
            <h3>AI Logging</h3>
            <p style={{ color: 'var(--text-muted)' }}>Log your food via text. Our GPT-4o engine handles the rest.</p>
          </div>
          
          <div style={{ textAlign: 'left' }}>
            <div style={{ background: 'rgba(255, 0, 84, 0.1)', padding: '12px', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem' }}>
              <Target color="var(--accent)" size={32} />
            </div>
            <h3>Smart Goals</h3>
            <p style={{ color: 'var(--text-muted)' }}>Daily calorie targets that adjust based on your daily activity.</p>
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem' }}>
              <Activity color="#fff" size={32} />
            </div>
            <h3>Progress</h3>
            <p style={{ color: 'var(--text-muted)' }}>Beautiful interactive charts that visualize your path to success.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
