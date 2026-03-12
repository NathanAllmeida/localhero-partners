import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Users, DollarSign, TrendingUp, Plus } from 'lucide-react'
import { listEvents, type Event } from '@/services/events'

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

export function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listEvents()
      .then((res) => setEvents(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const activeEvents = events.filter((e) => e.status === 'active' || e.status === 'published').length
  const totalParticipants = events.reduce((sum, e) => sum + e.participant_count, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Visão geral dos seus eventos</p>
        </div>
        <Link
          to="/events/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#07202f] text-white rounded-lg font-medium hover:bg-[#0a2d40] transition-colors"
        >
          <Plus size={20} />
          Novo evento
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={CalendarDays}
          label="Total de eventos"
          value={events.length}
          loading={loading}
        />
        <StatCard
          icon={TrendingUp}
          label="Eventos ativos"
          value={activeEvents}
          loading={loading}
        />
        <StatCard
          icon={Users}
          label="Participantes"
          value={totalParticipants}
          loading={loading}
        />
        <StatCard
          icon={DollarSign}
          label="Eventos concluídos"
          value={events.filter((e) => e.status === 'completed').length}
          loading={loading}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Eventos recentes</h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-400">Carregando...</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDays size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhum evento encontrado</p>
            <Link
              to="/events/new"
              className="inline-flex items-center gap-2 mt-4 text-[#07202f] font-medium hover:underline"
            >
              <Plus size={16} />
              Criar primeiro evento
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {events.slice(0, 5).map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{event.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {event.event_type === 'digital' ? 'Digital' : 'Presencial'} ·{' '}
                    {event.participant_count} participantes
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}
                >
                  {statusLabels[event.status]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof CalendarDays
  label: string
  value: number
  loading: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#07202f]/5 flex items-center justify-center">
          <Icon size={20} className="text-[#07202f]" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {loading ? '-' : value}
      </p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}
