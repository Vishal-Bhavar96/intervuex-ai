import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PreparationPlan, PreparationTask } from '../types';
import { Map, CheckSquare, Square, BookOpen, Award, CheckCircle } from 'lucide-react';

export const RoadmapPage: React.FC = () => {
  const [plan, setPlan] = useState<PreparationPlan | null>(null);
  const [loading, setLoading] = useState(true);

  // Local state tasks for instant interactive checkboxes
  const [tasks, setTasks] = useState<PreparationTask[]>([
    {
      id: 1, plan_id: 1, week_number: 1,
      topic: 'Week 1: SQL Joins, Indexes & Transaction Isolation Levels',
      resources: ['Review B-Tree indexing mechanics', 'Practice 5 complex multi-table SQL join queries', 'Study ACID transaction properties'],
      is_completed: true
    },
    {
      id: 2, plan_id: 1, week_number: 2,
      topic: 'Week 2: RESTful API Design, JWT Auth & Authorization Guards',
      resources: ['Implement OAuth2/JWT authentication in FastAPI', 'Design multi-tenant API route structures', 'Write API unit tests'],
      is_completed: false
    },
    {
      id: 3, plan_id: 1, week_number: 3,
      topic: 'Week 3: Docker Containerization, Redis Caching & CI/CD Pipelines',
      resources: ['Write multi-stage Dockerfiles', 'Configure Redis caching for slow database endpoints', 'Set up GitHub Actions CI workflow'],
      is_completed: false
    },
    {
      id: 4, plan_id: 1, week_number: 4,
      topic: 'Week 4: Comprehensive Technical Project Defense & Mock Interview',
      resources: ['Conduct timed Hard-difficulty mock interview', 'Refine architectural project defense explanations'],
      is_completed: false
    }
  ]);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getDashboard();
        if (data.active_preparation_plan) {
          setPlan(data.active_preparation_plan);
          if (data.active_preparation_plan.tasks?.length) {
            setTasks(data.active_preparation_plan.tasks);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleTask = (taskId: number) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: !t.is_completed } : t));
  };

  const completedCount = tasks.filter(t => t.is_completed).length;
  const progressPct = Math.round((completedCount / tasks.length) * 100);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Generating Personalized Preparation Roadmap...</div>;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Personalized 4-Week Preparation Roadmap</h2>
        <p>Custom-built study plan tailored to your target job, resume background, and AI interview weak areas.</p>
      </div>

      {/* Progress Header */}
      <div className="card" style={{ marginBottom: '2.5rem', background: '#FFFFFF', padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ color: '#1E3A5F' }}>Roadmap Mastery Progress</h3>
            <span style={{ color: '#64748B', fontSize: '0.9rem' }}>{completedCount} of {tasks.length} Weekly Modules Completed</span>
          </div>
          <h2 style={{ color: '#2563EB' }}>{progressPct}%</h2>
        </div>

        <div className="progress-bar" style={{ height: '12px' }}>
          <div className="progress-fill" style={{ width: `${progressPct}%`, background: '#2563EB' }}></div>
        </div>
      </div>

      {/* Weekly Task Modules */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className="card card-hover" 
            style={{ 
              borderLeft: task.is_completed ? '6px solid #16A34A' : '6px solid #2563EB',
              background: task.is_completed ? '#F0FDF4' : '#FFFFFF'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <button 
                onClick={() => toggleTask(task.id)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '2px', color: task.is_completed ? '#16A34A' : '#94A3B8' }}
              >
                {task.is_completed ? <CheckSquare size={24} /> : <Square size={24} />}
              </button>

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.15rem', color: '#1E3A5F', marginBottom: '0.5rem', textDecoration: task.is_completed ? 'line-through' : 'none' }}>
                  {task.topic}
                </h3>

                <strong style={{ fontSize: '0.85rem', color: '#64748B', display: 'block', marginBottom: '0.5rem' }}>
                  RECOMMENDED ACTIONABLE TASKS:
                </strong>

                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#475569' }}>
                  {task.resources.map((res, i) => (
                    <li key={i} style={{ marginBottom: '0.35rem' }}>{res}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
