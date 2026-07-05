import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Target, Flame, LogOut, User as UserIcon, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userService, foodService } from '../services/api';
import FoodLogger from '../components/FoodLogger';
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userData, historyData] = await Promise.all([
        userService.getMe(),
        foodService.getHistory()
      ]);
      setUser(userData);
      setHistory(historyData);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your entire food logging history? This cannot be undone.")) {
      return;
    }
    try {
      setLoading(true);
      await foodService.clearHistory();
      await fetchData();
    } catch (err) {
      console.error("Clear history error:", err);
      alert("Failed to clear food history.");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toDateString();
  const todayLogs = history.filter(log => new Date(log.logged_at).toDateString() === today);

  const totals = todayLogs.reduce((acc, log) => ({
    calories: acc.calories + log.calories,
    protein: acc.protein + log.protein,
    carbs: acc.carbs + log.carbs,
    fat: acc.fat + log.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const chartData = [
    { name: 'Consumed', value: totals.calories, color: 'var(--primary)' },
    { name: 'Remaining', value: Math.max(0, (user?.daily_calorie_goal || 2000) - totals.calories), color: 'rgba(255,255,255,0.1)' }
  ];

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--primary)' }}>Initializing Engine...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2rem' }}>FitMind AI</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.full_name}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/profile')} className="glass-card" style={{ padding: '0.8rem 1.2rem', borderRadius: '12px', cursor: 'pointer', border: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <UserIcon size={20} />
             <span>Profile</span>
          </button>
          <button onClick={() => {localStorage.removeItem('token'); window.location.href='/';}} className="glass-card" style={{ padding: '0.8rem 1.2rem', borderRadius: '12px', cursor: 'pointer', border: 'none', color: 'var(--accent)' }}>
             <LogOut size={20} />
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        
        {/* Main Content */}
        <main>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="glass-card">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Daily Goal</span>
              <h2 style={{ margin: '0.5rem 0' }}>{user?.daily_calorie_goal || '---'} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kcal</span></h2>
              <Target size={20} color="var(--primary)" />
            </div>
            <div className="glass-card">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Consumed</span>
              <h2 style={{ margin: '0.5rem 0' }}>{totals.calories} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kcal</span></h2>
              <Flame size={20} color="var(--accent)" />
            </div>
            <div className="glass-card">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Remaining</span>
              <h2 style={{ margin: '0.5rem 0' }}>{Math.max(0, (user?.daily_calorie_goal || 2000) - totals.calories)} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kcal</span></h2>
              <Zap size={20} color="var(--primary)" />
            </div>
          </div>

          {/* AI Logger */}
          <FoodLogger onLogSuccess={fetchData} />

          {/* History */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Recent History</h3>
              {history.length > 0 && (
                <button 
                  onClick={handleClearHistory} 
                  className="glass-card" 
                  style={{ 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    border: 'none', 
                    color: 'var(--accent)',
                    fontSize: '0.8rem',
                    background: 'rgba(255, 0, 84, 0.05)',
                    transition: 'all 0.2s ease',
                    boxShadow: 'none'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 0, 84, 0.15)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 0, 84, 0.05)'}
                >
                  Clear History
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <AnimatePresence>
                {history.map((log) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedLog(log)}
                    style={{ 
                      padding: '1rem', 
                      background: 'rgba(255,255,255,0.02)', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer'
                    }}
                    whileHover={{ scale: 1.01, borderColor: 'rgba(142, 249, 243, 0.2)' }}
                  >
                    <div>
                      <h4 style={{ color: 'var(--primary)' }}>{log.food_name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(log.logged_at).toLocaleTimeString()}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 'bold' }}>{log.calories} kcal</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>P: {log.protein}g | C: {log.carbs}g | F: {log.fat}g</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside>
          <div className="glass-card" style={{ height: '300px', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Daily Balance</h3>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" hide />
                <Tooltip 
                  contentStyle={{ background: '#1a1a1f', border: '1px solid var(--glass-border)', borderRadius: '8px' }} 
                  itemStyle={{ color: 'var(--primary)' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

        </aside>

      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedLog && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedLog(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
              padding: '1rem'
            }}
          >
            <motion.div 
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card"
              style={{
                width: '100%',
                maxWidth: '500px',
                position: 'relative',
                border: '1px solid rgba(142, 249, 243, 0.2)',
                padding: '2.5rem'
              }}
            >
              <button 
                onClick={() => setSelectedLog(null)} 
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <X size={24} />
              </button>

              <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Meal Details</span>
              <h2 style={{ fontSize: '1.8rem', margin: '0.5rem 0 1.5rem 0', color: '#fff' }}>{selectedLog.food_name}</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Calories</span>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '0.25rem' }}>{selectedLog.calories} kcal</p>
                </div>
                <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Protein</span>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '0.25rem', color: 'var(--primary)' }}>{selectedLog.protein}g</p>
                </div>
                <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Carbs</span>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '0.25rem', color: '#ffd166' }}>{selectedLog.carbs}g</p>
                </div>
                <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fat</span>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '0.25rem', color: 'var(--accent)' }}>{selectedLog.fat}g</p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-muted)' }}>Micronutrients & Details</h4>
                {selectedLog.micronutrients && Object.keys(selectedLog.micronutrients).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {Object.entries(selectedLog.micronutrients).map(([key, val]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', paddingBottom: '0.4rem', borderBottom: '1px dashed rgba(255,255,255,0.04)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{key}</span>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No additional micronutrients recorded for this entry.</p>
                )}
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2rem', textAlign: 'right' }}>
                Logged at {new Date(selectedLog.logged_at).toLocaleString()}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
