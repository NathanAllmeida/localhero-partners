import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Edit, Users, Trophy,
  Target, Megaphone, FileText, Send, XCircle, CheckCircle,
} from 'lucide-react'
import {
  getEvent, getEventStats, publishEvent, cancelEvent, completeEvent,
  type Event, type EventStats,
} from '@/services/events'

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  active: 'Ativo',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  published: 'bg-blue-100 text-blue-600',
  active: 'bg-green-100 text-green-600',
  completed: 'bg-purple-100 text-purple-600',
  cancelled: 'bg-red-100 text-red-600',
}

const tabs = [
  { key: 'overview', label: 'Visão geral', icon: FileText },
  { key: 'registrations', label: 'Inscrições', icon: Users },
  { key: 'leaderboard', label: 'Ranking', icon: Trophy },
  { key: 'missions', label: 'Missões', icon: Target },
  { key: 'influencers', label: 'Influenciadores', icon: Megaphone },
]

export function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [stats, setStats] = useState<EventStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadEvent()
  }, [id])

  async function loadEvent() {
    setLoading(true)
    try {
      const [eventRes, statsRes] = await Promise.all([
        getEvent(Number(id)),
        getEventStats(Number(id)).catch(() => null),
      ])
      setEvent(eventRes.data.event)
      if (statsRes) setStats(statsRes.data.stats)
    } catch {
      navigate('/events')
    } finally {
      setLoading(false)
    }
  }

  async function handlePublish() {
    if (!confirm('Publicar este evento?')) return
    setActionLoading(true)
    try {
      await publishEvent(Number(id))
      await loadEvent()
    } catch { /* */ }
    setActionLoading(false)
  }

  async function handleCancel() {
    if (!confirm('Cancelar este evento? Essa ação não pode ser desfeita.')) return
    setActionLoading(true)
    try {
      await cancelEvent(Number(id))
      await loadEvent()
    } catch { /* */ }
    setActionLoading(false)
  }

  async function handleComplete() {
    if (!confirm('Marcar este evento como concluído?')) return
    setActionLoading(true)
    try {
      await completeEvent(Number(id))
      await loadEvent()
    } catch { /* */ }
    setActionLoading(false)
  }

  if (loading || !event) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#07202f] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => navigate('/events')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 cursor-pointer"
      >
        <ArrowLeft size={20} />
        Voltar para eventos
      </button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
              {statusLabels[event.status]}
            </span>
          </div>
          <p className="text-gray-500">
            {event.event_type === 'digital' ? 'Digital' : 'Presencial'} ·{' '}
            {event.participant_count} participantes
          </p>
        </div>

        <div className="flex items-center gap-2">
          {event.status === 'draft' && (
            <button
              onClick={handlePublish}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Send size={16} />
              Publicar
            </button>
          )}
          {(event.status === 'published' || event.status === 'active') && (
            <button
              onClick={handleComplete}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle size={16} />
              Concluir
            </button>
          )}
          {event.status !== 'cancelled' && event.status !== 'completed' && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <XCircle size={16} />
              Cancelar
            </button>
          )}
          <Link
            to={`/events/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-[#07202f] text-white rounded-lg font-medium hover:bg-[#0a2d40] transition-colors"
          >
            <Edit size={16} />
            Editar
          </Link>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Inscrições</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_registrations}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Confirmadas</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.confirmed_registrations}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Receita total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              R$ {stats.total_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Sua receita</p>
            <p className="text-2xl font-bold text-[#07202f] mt-1">
              R$ {stats.partner_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'border-[#07202f] text-[#07202f]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {event.description ? (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Descrição</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </div>
            ) : (
              <p className="text-gray-400">Nenhuma descrição adicionada.</p>
            )}
            {event.event_date && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Data do evento</h3>
                <p className="text-gray-700">
                  {new Date(event.event_date).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
            {event.start_date && event.end_date && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Período</h3>
                <p className="text-gray-700">
                  {new Date(event.start_date).toLocaleDateString('pt-BR')} até{' '}
                  {new Date(event.end_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'registrations' && (
          <p className="text-gray-400 text-center py-8">Lista de inscrições em breve</p>
        )}

        {activeTab === 'leaderboard' && (
          <p className="text-gray-400 text-center py-8">Ranking em breve</p>
        )}

        {activeTab === 'missions' && (
          <p className="text-gray-400 text-center py-8">Missões em breve</p>
        )}

        {activeTab === 'influencers' && (
          <p className="text-gray-400 text-center py-8">Influenciadores em breve</p>
        )}
      </div>
    </div>
  )
}
