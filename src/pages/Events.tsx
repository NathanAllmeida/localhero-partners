import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, CalendarDays, Search } from 'lucide-react'
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

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    listEvents()
      .then((res) => setEvents(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = events.filter((e) => {
    const matchesSearch = !search || e.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || e.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
          <p className="text-gray-500 mt-1">Gerencie seus eventos</p>
        </div>
        <Link
          to="/events/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#07202f] text-white rounded-lg font-medium hover:bg-[#0a2d40] transition-colors"
        >
          <Plus size={20} />
          Novo evento
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f] focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f] focus:border-transparent bg-white"
        >
          <option value="">Todos os status</option>
          <option value="draft">Rascunho</option>
          <option value="published">Publicado</option>
          <option value="active">Ativo</option>
          <option value="completed">Concluído</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <CalendarDays size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">
            {search || statusFilter ? 'Nenhum evento encontrado com esses filtros' : 'Nenhum evento criado ainda'}
          </p>
          {!search && !statusFilter && (
            <Link
              to="/events/new"
              className="inline-flex items-center gap-2 mt-4 text-[#07202f] font-medium hover:underline"
            >
              <Plus size={16} />
              Criar primeiro evento
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {event.banner_image ? (
                <img
                  src={event.banner_image}
                  alt={event.name}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-[#07202f] to-[#1688cd] flex items-center justify-center">
                  <CalendarDays size={48} className="text-white/30" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[event.status]}`}
                  >
                    {statusLabels[event.status]}
                  </span>
                  <span className="text-xs text-gray-400">
                    {event.event_type === 'digital' ? 'Digital' : 'Presencial'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{event.name}</h3>
                {event.short_description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{event.short_description}</p>
                )}
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <span>{event.participant_count} participantes</span>
                  {event.event_date && (
                    <span>
                      {new Date(event.event_date).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
