import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { Plus, Briefcase, MapPin, Calendar, LayoutGrid, Sparkles, LogOut } from 'lucide-react';
import ApplicationModal from '../components/ApplicationModal';

const columns: { id: string; label: string; color: string; accent: string; glow: string }[] = [
  { id: 'Applied', label: 'Applied', color: 'rgba(99,102,241,0.12)', accent: '#818cf8', glow: 'rgba(99,102,241,0.25)' },
  { id: 'Phone Screen', label: 'Phone Screen', color: 'rgba(245,158,11,0.10)', accent: '#fbbf24', glow: 'rgba(245,158,11,0.20)' },
  { id: 'Interview', label: 'Interview', color: 'rgba(59,130,246,0.10)', accent: '#60a5fa', glow: 'rgba(59,130,246,0.20)' },
  { id: 'Offer', label: 'Offer', color: 'rgba(16,185,129,0.10)', accent: '#34d399', glow: 'rgba(16,185,129,0.20)' },
  { id: 'Rejected', label: 'Rejected', color: 'rgba(239,68,68,0.08)', accent: '#f87171', glow: 'rgba(239,68,68,0.15)' },
];

function StatBadge({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="stat-badge" style={{ '--accent': accent } as any}>
      <span className="stat-value" style={{ color: accent }}>{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export default function Board() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => { setMounted(true); }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const res = await api.get('/applications');
      return res.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.put(`/applications/${id}`, { status });
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['applications'] });
      const previousApps = queryClient.getQueryData(['applications']);
      queryClient.setQueryData(['applications'], (old: any) =>
        old.map((app: any) => app._id === id ? { ...app, status } : app)
      );
      return { previousApps };
    },
    onError: (_err, _newApp, context: any) => {
      if (context?.previousApps) {
        queryClient.setQueryData(['applications'], context.previousApps);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    }
  });

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;
    updateStatusMutation.mutate({ id: draggableId, status: destination.droppableId });
  };

  const getAppsByStatus = (status: string) => applications.filter((app: any) => app.status === status);

  const totalApps = applications.length;
  const activeApps = applications.filter((a: any) => !['Rejected'].includes(a.status)).length;
  const offerCount = getAppsByStatus('Offer').length;

  if (isLoading) {
    return (
      <div className="board-loading">
        <div className="loading-spinner" />
        <p>Loading your board…</p>
        <style>{baseStyles}</style>
      </div>
    );
  }

  return (
    <div className={`board-root ${mounted ? 'visible' : ''}`}>
      <style>{baseStyles}</style>

      {/* Ambient background */}
      <div className="board-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
      </div>

      {/* Header */}
      <header className="board-header">
        <div className="header-left">
          <div className="header-brand">
            <div className="header-icon"><Sparkles size={16} /></div>
            <span className="header-title">JobFlow</span>
          </div>
          <div className="header-stats">
            <StatBadge label="Total" value={totalApps} accent="#818cf8" />
            <StatBadge label="Active" value={activeApps} accent="#60a5fa" />
            <StatBadge label="Offers" value={offerCount} accent="#34d399" />
          </div>
        </div>
        <div className="header-right">
          <button
            onClick={() => setIsModalOpen(true)}
            className="new-btn"
          >
            <Plus size={16} />
            <span>New Application</span>
          </button>

          <button
            onClick={handleLogout}
            className="logout-btn"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Board */}
      <div className="board-body">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="columns-wrap">
            {columns.map((col) => {
              const apps = getAppsByStatus(col.id);
              return (
                <div key={col.id} className="column" style={{ '--col-color': col.color, '--col-accent': col.accent, '--col-glow': col.glow } as any}>
                  {/* Column header */}
                  <div className="col-header">
                    <div className="col-dot" style={{ background: col.accent, boxShadow: `0 0 8px ${col.accent}` }} />
                    <span className="col-label">{col.label}</span>
                    <span className="col-count" style={{ color: col.accent, borderColor: `${col.accent}33`, background: `${col.accent}11` }}>
                      {apps.length}
                    </span>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`col-body ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                        style={{ '--col-accent': col.accent } as any}
                      >
                        {apps.length === 0 && !snapshot.isDraggingOver && (
                          <div className="empty-state">
                            <LayoutGrid size={20} className="empty-icon" />
                            <p>Drop cards here</p>
                          </div>
                        )}

                        {apps.map((app: any, index: number) => (
                          <Draggable key={app._id} draggableId={app._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`app-card ${snapshot.isDragging ? 'dragging' : ''}`}
                                style={{
                                  ...provided.draggableProps.style,
                                  '--card-accent': col.accent,
                                  '--card-glow': col.glow,
                                } as any}
                              >
                                <div className="card-accent-bar" style={{ background: col.accent }} />

                                <div className="card-body">
                                  <div className="card-top">
                                    <div className="card-company-icon">
                                      <Briefcase size={13} />
                                    </div>
                                    <span className="card-company">{app.company}</span>
                                  </div>
                                  <h4 className="card-role">{app.role}</h4>

                                  <div className="card-meta">
                                    {app.location && (
                                      <div className="meta-item">
                                        <MapPin size={11} />
                                        <span>{app.location}</span>
                                      </div>
                                    )}
                                    <div className="meta-item">
                                      <Calendar size={11} />
                                      <span>{new Date(app.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                  </div>
                                </div>

                                {snapshot.isDragging && (
                                  <div className="drag-glow" style={{ background: `radial-gradient(circle at 50% 0%, ${col.glow}, transparent 70%)` }} />
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {isModalOpen && <ApplicationModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .board-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background: #040507;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow-x: auto;
    overflow-y: hidden;
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  .board-root.visible { opacity: 1; }

  /* Loading */
  .board-loading {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh; background: #040507;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: rgba(255,255,255,0.4);
  }
  .loading-spinner {
    width: 32px; height: 32px;
    border: 2px solid rgba(255,255,255,0.08); border-top-color: #818cf8;
    border-radius: 50%; animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Background */
  .board-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
  .bg-orb { position: absolute; border-radius: 50%; filter: blur(100px); }
  .bg-orb-1 {
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
    top: -200px; left: -200px;
  }
  .bg-orb-2 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%);
    bottom: -150px; right: -150px;
  }

  /* Header */
  .board-header {
    position: relative; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 28px;
    background: rgba(4,5,7,0.8);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(20px);
  }
  .header-left { display: flex; align-items: center; gap: 24px; }
  .header-brand { display: flex; align-items: center; gap: 10px; }
  .header-icon {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 9px; display: flex; align-items: center; justify-content: center; color: white;
    box-shadow: 0 0 16px rgba(99,102,241,0.35);
  }
  .header-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: white; letter-spacing: -0.3px; }

  .header-stats { display: flex; align-items: center; gap: 8px; }
  .stat-badge {
    display: flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px; padding: 5px 12px;
  }
  .stat-value { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; }
  .stat-label { font-size: 11px; color: rgba(255,255,255,0.3); }

  .header-right { display: flex; align-items: center; }
  .new-btn {
    display: flex; align-items: center; gap: 8px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none; border-radius: 10px; color: white;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    padding: 9px 18px; cursor: pointer;
    box-shadow: 0 4px 20px rgba(99,102,241,0.3);
    transition: transform 0.15s, box-shadow 0.2s, opacity 0.15s;
  }
  .new-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(99,102,241,0.4); }
  .new-btn:active { transform: scale(0.98); opacity: 0.9; }

  .logout-btn {
    display: flex; align-items: center; justify-content: center;
    width: 38px; height: 38px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px; color: rgba(255,255,255,0.4);
    margin-left: 12px; cursor: pointer;
    transition: all 0.2s;
  }
  .logout-btn:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.2); color: #f87171; }
  .logout-btn:active { transform: scale(0.95); }

  /* Board body */
  .board-body {
    position: relative; z-index: 1;
    flex: 1; overflow-x: auto; overflow-y: hidden;
    padding: 24px 28px 32px;
  }
  .columns-wrap {
    display: flex; gap: 16px;
    height: calc(100vh - 100px);
    min-width: fit-content;
  }

  /* Column */
  .column {
    width: 290px; min-width: 290px;
    display: flex; flex-direction: column;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .column:hover { border-color: rgba(255,255,255,0.09); }

  .col-header {
    display: flex; align-items: center; gap: 8px;
    padding: 16px 16px 12px;
    background: rgba(255,255,255,0.02);
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .col-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .col-label { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.75); flex: 1; }
  .col-count {
    font-size: 11px; font-weight: 600;
    padding: 2px 8px; border-radius: 20px;
    border: 1px solid;
  }

  .col-body {
    flex: 1; overflow-y: auto; padding: 12px;
    display: flex; flex-direction: column; gap: 10px;
    min-height: 100px;
    transition: background 0.2s;
  }
  .col-body.dragging-over {
    background: color-mix(in srgb, var(--col-accent) 6%, transparent);
  }
  .col-body::-webkit-scrollbar { width: 4px; }
  .col-body::-webkit-scrollbar-track { background: transparent; }
  .col-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

  /* Empty state */
  .empty-state {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
    color: rgba(255,255,255,0.12); padding: 32px 16px; text-align: center;
  }
  .empty-icon { margin-bottom: 4px; }
  .empty-state p { font-size: 12px; }

  /* App card */
  .app-card {
    position: relative;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    overflow: hidden;
    cursor: grab;
    transition: transform 0.15s, box-shadow 0.2s, border-color 0.2s, background 0.15s;
  }
  .app-card:hover {
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.12);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }
  .app-card.dragging {
    cursor: grabbing;
    transform: rotate(1.5deg) scale(1.03);
    box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px var(--card-accent, rgba(255,255,255,0.2));
    border-color: var(--card-accent, rgba(255,255,255,0.2));
    z-index: 999;
  }

  .card-accent-bar {
    position: absolute; top: 0; left: 0; right: 0;
    height: 2px; opacity: 0.7;
    transition: opacity 0.2s;
  }
  .app-card:hover .card-accent-bar { opacity: 1; }

  .card-body { padding: 14px 14px 12px; }
  .card-top { display: flex; align-items: center; gap: 7px; margin-bottom: 6px; }
  .card-company-icon {
    width: 22px; height: 22px;
    background: rgba(255,255,255,0.07);
    border-radius: 6px; display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.4); flex-shrink: 0;
  }
  .card-company { font-size: 12px; color: rgba(255,255,255,0.45); font-weight: 400; }
  .card-role { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.9); line-height: 1.3; margin-bottom: 10px; }

  .card-meta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .meta-item { display: flex; align-items: center; gap: 4px; font-size: 11px; color: rgba(255,255,255,0.25); }

  .drag-glow { position: absolute; inset: 0; pointer-events: none; opacity: 0.5; }

  @media (max-width: 768px) {
    .board-header { padding: 16px; flex-wrap: wrap; gap: 12px; }
    .header-left { width: 100%; justify-content: space-between; order: 1; }
    .header-right { width: 100%; justify-content: flex-end; order: 2; gap: 8px; }
    .header-stats { gap: 4px; }
    .stat-badge { padding: 4px 8px; }
    .stat-label { display: none; }
    .board-body { padding: 12px 16px 20px; }
    .columns-wrap { height: calc(100vh - 150px); gap: 12px; }
    .column { width: 260px; min-width: 260px; }
  }

  @media (max-width: 480px) {
    .header-brand { gap: 8px; }
    .header-title { font-size: 16px; }
    .new-btn span { display: none; }
    .new-btn { padding: 10px; border-radius: 12px; }
    .column { width: 240px; min-width: 240px; }
    .card-body { padding: 12px; }
    .card-role { font-size: 13px; }
  }
`;
