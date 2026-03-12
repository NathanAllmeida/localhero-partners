import { useEffect, useState, type FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Edit, Users, Trophy,
  Target, Megaphone, FileText, Send, XCircle, CheckCircle,
  Plus, Trash2, CreditCard, Loader2, ClipboardList,
} from 'lucide-react'
import {
  getEvent, getEventStats, publishEvent, cancelEvent, completeEvent,
  listPlans, createPlan, updatePlan, deletePlan,
  listFormFields, createFormField, updateFormField, deleteFormField,
  listInfluencers, createInfluencer, updateInfluencer, deleteInfluencer,
  listRegistrations, listMissions, createMission, updateMission, deleteMission,
  getEventLeaderboard,
  type Event, type EventStats, type EventPlan, type EventFormField,
  type EventInfluencer, type EventRegistration, type EventMission, type LeaderboardEntry,
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
  { key: 'plans', label: 'Planos', icon: CreditCard },
  { key: 'form-fields', label: 'Formulário', icon: ClipboardList },
  { key: 'registrations', label: 'Inscrições', icon: Users },
  { key: 'leaderboard', label: 'Ranking', icon: Trophy },
  { key: 'missions', label: 'Missões', icon: Target },
  { key: 'influencers', label: 'Influenciadores', icon: Megaphone },
]

export function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const eventId = Number(id)
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
        getEvent(eventId),
        getEventStats(eventId).catch(() => null),
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
      await publishEvent(eventId)
      await loadEvent()
    } catch { /* */ }
    setActionLoading(false)
  }

  async function handleCancel() {
    if (!confirm('Cancelar este evento? Essa ação não pode ser desfeita.')) return
    setActionLoading(true)
    try {
      await cancelEvent(eventId)
      await loadEvent()
    } catch { /* */ }
    setActionLoading(false)
  }

  async function handleComplete() {
    if (!confirm('Marcar este evento como concluído?')) return
    setActionLoading(true)
    try {
      await completeEvent(eventId)
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
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.registrations.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Confirmadas</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.registrations.confirmed}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Receita total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              R$ {(stats.financial.total_revenue ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Sua receita</p>
            <p className="text-2xl font-bold text-[#07202f] mt-1">
              R$ {(stats.financial.total_partner_amount ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
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

      {activeTab === 'overview' && <OverviewTab event={event} />}
      {activeTab === 'plans' && <PlansTab eventId={eventId} />}
      {activeTab === 'form-fields' && <FormFieldsTab eventId={eventId} />}
      {activeTab === 'registrations' && <RegistrationsTab eventId={eventId} />}
      {activeTab === 'leaderboard' && <LeaderboardTab eventId={eventId} />}
      {activeTab === 'missions' && <MissionsTab eventId={eventId} />}
      {activeTab === 'influencers' && <InfluencersTab eventId={eventId} />}
    </div>
  )
}

// ─── OVERVIEW TAB ────────────────────────────────────────────

function OverviewTab({ event }: { event: Event }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
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
          <p className="text-gray-700">{new Date(event.event_date).toLocaleString('pt-BR')}</p>
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
      {event.registration_start_date && event.registration_end_date && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Período de inscrições</h3>
          <p className="text-gray-700">
            {new Date(event.registration_start_date).toLocaleString('pt-BR')} até{' '}
            {new Date(event.registration_end_date).toLocaleString('pt-BR')}
          </p>
        </div>
      )}
      {event.max_participants && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Máx. participantes</h3>
          <p className="text-gray-700">{event.max_participants}</p>
        </div>
      )}
    </div>
  )
}

// ─── PLANS TAB ───────────────────────────────────────────────

function PlansTab({ eventId }: { eventId: number }) {
  const [plans, setPlans] = useState<EventPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<EventPlan | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', price: '', benefits: '', max_registrations: '', sort_order: '0' })

  useEffect(() => { load() }, [eventId])

  async function load() {
    setLoading(true)
    try {
      const res = await listPlans(eventId)
      setPlans(res.data.plans)
    } catch { /* */ }
    setLoading(false)
  }

  function openCreate() {
    setEditingPlan(null)
    setForm({ name: '', description: '', price: '', benefits: '', max_registrations: '', sort_order: '0' })
    setShowForm(true)
  }

  function openEdit(plan: EventPlan) {
    setEditingPlan(plan)
    setForm({
      name: plan.name,
      description: plan.description || '',
      price: String(plan.price),
      benefits: plan.benefits ? (Array.isArray(plan.benefits) ? plan.benefits : (() => { try { return JSON.parse(plan.benefits as unknown as string) } catch { return [] } })()).join(', ') : '',
      max_registrations: plan.max_registrations ? String(plan.max_registrations) : '',
      sort_order: String(plan.sort_order),
    })
    setShowForm(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    const data: Partial<EventPlan> = {
      name: form.name,
      description: form.description || null,
      price: Number(form.price),
      benefits: form.benefits ? form.benefits.split(',').map(b => b.trim()).filter(Boolean) : null,
      max_registrations: form.max_registrations ? Number(form.max_registrations) : null,
      sort_order: Number(form.sort_order),
    }
    try {
      if (editingPlan) {
        await updatePlan(eventId, editingPlan.id, data)
      } else {
        await createPlan(eventId, data)
      }
      setShowForm(false)
      await load()
    } catch { /* */ }
    setSaving(false)
  }

  async function handleDelete(planId: number) {
    if (!confirm('Remover este plano?')) return
    await deletePlan(eventId, planId)
    await load()
  }

  if (loading) return <div className="text-center py-8 text-gray-400">Carregando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Máximo de 3 planos por evento</p>
        {plans.length < 3 && (
          <button onClick={openCreate} className="flex items-center gap-2 px-3 py-2 bg-[#07202f] text-white rounded-lg text-sm font-medium hover:bg-[#0a2d40] transition-colors cursor-pointer">
            <Plus size={16} /> Novo plano
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-4 space-y-4">
          <h3 className="font-semibold text-gray-900">{editingPlan ? 'Editar plano' : 'Novo plano'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
              <input type="number" step="0.01" required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Benefícios (separados por vírgula)</label>
              <input type="text" value={form.benefits} onChange={e => setForm(f => ({ ...f, benefits: e.target.value }))} placeholder="Acesso ao evento, Kit, Grupo VIP" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Máx. inscrições</label>
              <input type="number" value={form.max_registrations} onChange={e => setForm(f => ({ ...f, max_registrations: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f]" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 text-sm hover:bg-gray-50 cursor-pointer">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-[#07202f] text-white rounded-lg text-sm font-medium hover:bg-[#0a2d40] disabled:opacity-50 cursor-pointer">
              {saving ? 'Salvando...' : editingPlan ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      )}

      {plans.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          <CreditCard size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Nenhum plano criado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map(plan => (
            <div key={plan.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                  <span className="text-lg font-bold text-[#07202f]">
                    {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
                {plan.description && <p className="text-sm text-gray-500 mb-2">{plan.description}</p>}
                {plan.benefits && (
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(plan.benefits) ? plan.benefits : (() => { try { const p = JSON.parse(plan.benefits as unknown as string); return Array.isArray(p) ? p : [] } catch { return [] } })()).map((b: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">{b}</span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {plan.registration_count} inscrições
                  {plan.max_registrations && ` / ${plan.max_registrations} vagas`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(plan)} className="p-2 text-gray-400 hover:text-[#07202f] cursor-pointer"><Edit size={16} /></button>
                <button onClick={() => handleDelete(plan.id)} className="p-2 text-gray-400 hover:text-red-600 cursor-pointer"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── FORM FIELDS TAB ─────────────────────────────────────────

function FormFieldsTab({ eventId }: { eventId: number }) {
  const [fields, setFields] = useState<EventFormField[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingField, setEditingField] = useState<EventFormField | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', label: '', type: 'text' as string, options: '', is_required: false, sort_order: '0' })

  const fieldTypes = [
    { value: 'text', label: 'Texto' },
    { value: 'number', label: 'Número' },
    { value: 'email', label: 'E-mail' },
    { value: 'phone', label: 'Telefone' },
    { value: 'date', label: 'Data' },
    { value: 'select', label: 'Seleção' },
    { value: 'checkbox', label: 'Checkbox' },
  ]

  useEffect(() => { load() }, [eventId])

  async function load() {
    setLoading(true)
    try {
      const res = await listFormFields(eventId)
      setFields(res.data.form_fields)
    } catch { /* */ }
    setLoading(false)
  }

  function openCreate() {
    setEditingField(null)
    setForm({ name: '', label: '', type: 'text', options: '', is_required: false, sort_order: '0' })
    setShowForm(true)
  }

  function openEdit(field: EventFormField) {
    setEditingField(field)
    setForm({
      name: field.name,
      label: field.label,
      type: field.type,
      options: field.options ? field.options.join(', ') : '',
      is_required: field.is_required,
      sort_order: String(field.sort_order),
    })
    setShowForm(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    const data: Partial<EventFormField> = {
      name: form.name,
      label: form.label,
      type: form.type as EventFormField['type'],
      options: form.type === 'select' && form.options ? form.options.split(',').map(o => o.trim()).filter(Boolean) : null,
      is_required: form.is_required,
      sort_order: Number(form.sort_order),
    }
    try {
      if (editingField) {
        await updateFormField(eventId, editingField.id, data)
      } else {
        await createFormField(eventId, data)
      }
      setShowForm(false)
      await load()
    } catch { /* */ }
    setSaving(false)
  }

  async function handleDelete(fieldId: number) {
    if (!confirm('Remover este campo?')) return
    await deleteFormField(eventId, fieldId)
    await load()
  }

  if (loading) return <div className="text-center py-8 text-gray-400">Carregando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Campos do formulário de inscrição</p>
        <button onClick={openCreate} className="flex items-center gap-2 px-3 py-2 bg-[#07202f] text-white rounded-lg text-sm font-medium hover:bg-[#0a2d40] transition-colors cursor-pointer">
          <Plus size={16} /> Novo campo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-4 space-y-4">
          <h3 className="font-semibold text-gray-900">{editingField ? 'Editar campo' : 'Novo campo'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome (identificador) *</label>
              <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="cpf, tamanho_camiseta" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label (exibido) *</label>
              <input type="text" required value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="CPF, Tamanho da camiseta" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f] bg-white">
                {fieldTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_required} onChange={e => setForm(f => ({ ...f, is_required: e.target.checked }))} className="w-4 h-4 rounded border-gray-300" />
                <span className="text-sm text-gray-700">Campo obrigatório</span>
              </label>
            </div>
          </div>
          {form.type === 'select' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opções (separadas por vírgula)</label>
              <input type="text" value={form.options} onChange={e => setForm(f => ({ ...f, options: e.target.value }))} placeholder="P, M, G, GG" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f]" />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 text-sm hover:bg-gray-50 cursor-pointer">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-[#07202f] text-white rounded-lg text-sm font-medium hover:bg-[#0a2d40] disabled:opacity-50 cursor-pointer">
              {saving ? 'Salvando...' : editingField ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      )}

      {fields.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          <ClipboardList size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Nenhum campo de formulário criado</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {fields.map(field => (
            <div key={field.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <span className="font-medium text-gray-900">{field.label}</span>
                  <span className="text-xs text-gray-400 ml-2">({field.name})</span>
                </div>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{field.type}</span>
                {field.is_required && <span className="px-2 py-0.5 bg-red-50 text-red-500 text-xs rounded-full">Obrigatório</span>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(field)} className="p-2 text-gray-400 hover:text-[#07202f] cursor-pointer"><Edit size={16} /></button>
                <button onClick={() => handleDelete(field.id)} className="p-2 text-gray-400 hover:text-red-600 cursor-pointer"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── REGISTRATIONS TAB ───────────────────────────────────────

function RegistrationsTab({ eventId }: { eventId: number }) {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => { load() }, [eventId, page, statusFilter])

  async function load() {
    setLoading(true)
    try {
      const res = await listRegistrations(eventId, { page, per_page: 20, status: statusFilter || undefined })
      setRegistrations(res.data.registrations)
      setTotalPages(res.data.pagination.pages)
    } catch { /* */ }
    setLoading(false)
  }

  const paymentStatusLabels: Record<string, string> = {
    free: 'Grátis', pending: 'Pendente', paid: 'Pago', failed: 'Falhou', refunded: 'Reembolsado',
  }
  const paymentStatusColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-600', pending: 'bg-yellow-100 text-yellow-700', paid: 'bg-green-100 text-green-600',
    failed: 'bg-red-100 text-red-600', refunded: 'bg-purple-100 text-purple-600',
  }
  const regStatusLabels: Record<string, string> = {
    pending: 'Pendente', confirmed: 'Confirmada', cancelled: 'Cancelada', refunded: 'Reembolsada',
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#07202f]">
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="confirmed">Confirmada</option>
          <option value="cancelled">Cancelada</option>
          <option value="refunded">Reembolsada</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Carregando...</div>
      ) : registrations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          <Users size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Nenhuma inscrição encontrada</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Participante</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Sua receita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registrations.map(reg => (
                  <tr key={reg.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {reg.user_avatar ? (
                          <img src={reg.user_avatar} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#f87c29] flex items-center justify-center text-white text-xs font-bold">
                            {reg.user_first_name?.[0]}
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">{reg.user_first_name} {reg.user_last_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{regStatusLabels[reg.status] || reg.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatusColors[reg.payment_status] || ''}`}>
                        {paymentStatusLabels[reg.payment_status] || reg.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      R$ {reg.amount_paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-[#07202f]">
                      R$ {reg.partner_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 cursor-pointer">Anterior</button>
              <span className="text-sm text-gray-500">Página {page} de {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 cursor-pointer">Próxima</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── LEADERBOARD TAB ─────────────────────────────────────────

function LeaderboardTab({ eventId }: { eventId: number }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEventLeaderboard(eventId, { per_page: 100 })
      .then(res => setEntries(res.data.leaderboard))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [eventId])

  if (loading) return <div className="text-center py-8 text-gray-400">Carregando...</div>

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
        <Trophy size={40} className="mx-auto mb-3 text-gray-300" />
        <p>Nenhum participante no ranking</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-16">#</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Participante</th>
            <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">XP</th>
            <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Distância</th>
            <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Atividades</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entries.map(entry => (
            <tr key={entry.user_id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <span className={`text-sm font-bold ${entry.rank_position <= 3 ? 'text-[#f87c29]' : 'text-gray-400'}`}>
                  {entry.rank_position}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {entry.avatar ? (
                    <img src={entry.avatar} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#f87c29] flex items-center justify-center text-white text-xs font-bold">
                      {entry.first_name?.[0]}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900">{entry.first_name} {entry.last_name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-[#07202f]">{entry.total_xp.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-sm text-gray-700">{(entry.total_distance_meters / 1000).toFixed(1)} km</td>
              <td className="px-4 py-3 text-right text-sm text-gray-700">{entry.total_activities}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── MISSIONS TAB ────────────────────────────────────────────

function MissionsTab({ eventId }: { eventId: number }) {
  const [missions, setMissions] = useState<EventMission[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMission, setEditingMission] = useState<EventMission | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', slug: '', description: '', type: 'event' as string, goal_type: 'distance' as string,
    goal_value: '', goal_unit: '', xp_reward: '', start_date: '', end_date: '',
  })

  const missionTypes = [{ value: 'daily', label: 'Diária' }, { value: 'weekly', label: 'Semanal' }, { value: 'event', label: 'Evento' }]
  const goalTypes = [
    { value: 'distance', label: 'Distância' }, { value: 'duration', label: 'Duração' },
    { value: 'calories', label: 'Calorias' }, { value: 'activities', label: 'Atividades' }, { value: 'streak', label: 'Sequência' },
  ]

  useEffect(() => { load() }, [eventId])

  async function load() {
    setLoading(true)
    try {
      const res = await listMissions(eventId)
      setMissions(res.data.missions)
    } catch { /* */ }
    setLoading(false)
  }

  function openCreate() {
    setEditingMission(null)
    setForm({ name: '', slug: '', description: '', type: 'event', goal_type: 'distance', goal_value: '', goal_unit: '', xp_reward: '', start_date: '', end_date: '' })
    setShowForm(true)
  }

  function openEdit(m: EventMission) {
    setEditingMission(m)
    setForm({
      name: m.name, slug: m.slug, description: m.description || '', type: m.type, goal_type: m.goal_type,
      goal_value: String(m.goal_value), goal_unit: m.goal_unit || '', xp_reward: String(m.xp_reward),
      start_date: m.start_date || '', end_date: m.end_date || '',
    })
    setShowForm(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    const data: Partial<EventMission> = {
      name: form.name, slug: form.slug, description: form.description || null,
      type: form.type as EventMission['type'], goal_type: form.goal_type as EventMission['goal_type'],
      goal_value: Number(form.goal_value), goal_unit: form.goal_unit || null, xp_reward: Number(form.xp_reward),
      start_date: form.start_date || null, end_date: form.end_date || null,
    }
    try {
      if (editingMission) {
        await updateMission(eventId, editingMission.id, data)
      } else {
        await createMission(eventId, data)
      }
      setShowForm(false)
      await load()
    } catch { /* */ }
    setSaving(false)
  }

  async function handleDelete(missionId: number) {
    if (!confirm('Remover esta missão?')) return
    await deleteMission(eventId, missionId)
    await load()
  }

  if (loading) return <div className="text-center py-8 text-gray-400">Carregando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Missões e desafios do evento</p>
        <button onClick={openCreate} className="flex items-center gap-2 px-3 py-2 bg-[#07202f] text-white rounded-lg text-sm font-medium hover:bg-[#0a2d40] transition-colors cursor-pointer">
          <Plus size={16} /> Nova missão
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-4 space-y-4">
          <h3 className="font-semibold text-gray-900">{editingMission ? 'Editar missão' : 'Nova missão'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input type="text" required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="corra-10km" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f]" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f] bg-white">
                {missionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de objetivo *</label>
              <select value={form.goal_type} onChange={e => setForm(f => ({ ...f, goal_type: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f] bg-white">
                {goalTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor do objetivo *</label>
              <input type="number" required value={form.goal_value} onChange={e => setForm(f => ({ ...f, goal_value: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f]" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
              <input type="text" value={form.goal_unit} onChange={e => setForm(f => ({ ...f, goal_unit: e.target.value }))} placeholder="km, min, cal" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recompensa XP *</label>
              <input type="number" required value={form.xp_reward} onChange={e => setForm(f => ({ ...f, xp_reward: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data início</label>
              <input type="datetime-local" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data fim</label>
              <input type="datetime-local" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f]" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 text-sm hover:bg-gray-50 cursor-pointer">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-[#07202f] text-white rounded-lg text-sm font-medium hover:bg-[#0a2d40] disabled:opacity-50 cursor-pointer">
              {saving ? 'Salvando...' : editingMission ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      )}

      {missions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          <Target size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Nenhuma missão criada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {missions.map(mission => (
            <div key={mission.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{mission.name}</h4>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                    {mission.type === 'daily' ? 'Diária' : mission.type === 'weekly' ? 'Semanal' : 'Evento'}
                  </span>
                  {!mission.is_active && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">Inativa</span>}
                </div>
                {mission.description && <p className="text-sm text-gray-500 mb-2">{mission.description}</p>}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>Objetivo: {mission.goal_value} {mission.goal_unit || mission.goal_type}</span>
                  <span>Recompensa: {mission.xp_reward} XP</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(mission)} className="p-2 text-gray-400 hover:text-[#07202f] cursor-pointer"><Edit size={16} /></button>
                <button onClick={() => handleDelete(mission.id)} className="p-2 text-gray-400 hover:text-red-600 cursor-pointer"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── INFLUENCERS TAB ─────────────────────────────────────────

function InfluencersTab({ eventId }: { eventId: number }) {
  const [influencers, setInfluencers] = useState<EventInfluencer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingInf, setEditingInf] = useState<EventInfluencer | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', email: '', instagram: '' })

  useEffect(() => { load() }, [eventId])

  async function load() {
    setLoading(true)
    try {
      const res = await listInfluencers(eventId)
      setInfluencers(res.data.influencers)
    } catch { /* */ }
    setLoading(false)
  }

  function openCreate() {
    setEditingInf(null)
    setForm({ name: '', slug: '', email: '', instagram: '' })
    setShowForm(true)
  }

  function openEdit(inf: EventInfluencer) {
    setEditingInf(inf)
    setForm({ name: inf.name, slug: inf.slug, email: inf.email || '', instagram: inf.instagram || '' })
    setShowForm(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    const data: Partial<EventInfluencer> = {
      name: form.name, slug: form.slug,
      email: form.email || null, instagram: form.instagram || null,
    }
    try {
      if (editingInf) {
        await updateInfluencer(eventId, editingInf.id, data)
      } else {
        await createInfluencer(eventId, data)
      }
      setShowForm(false)
      await load()
    } catch { /* */ }
    setSaving(false)
  }

  async function handleDelete(infId: number) {
    if (!confirm('Remover este influenciador?')) return
    await deleteInfluencer(eventId, infId)
    await load()
  }

  if (loading) return <div className="text-center py-8 text-gray-400">Carregando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Influenciadores vinculados ao evento</p>
        <button onClick={openCreate} className="flex items-center gap-2 px-3 py-2 bg-[#07202f] text-white rounded-lg text-sm font-medium hover:bg-[#0a2d40] transition-colors cursor-pointer">
          <Plus size={16} /> Novo influenciador
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-4 space-y-4">
          <h3 className="font-semibold text-gray-900">{editingInf ? 'Editar influenciador' : 'Novo influenciador'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (para URL) *</label>
              <input type="text" required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="joao-corredor" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <input type="text" value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} placeholder="@usuario" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f]" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 text-sm hover:bg-gray-50 cursor-pointer">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-[#07202f] text-white rounded-lg text-sm font-medium hover:bg-[#0a2d40] disabled:opacity-50 cursor-pointer">
              {saving ? 'Salvando...' : editingInf ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      )}

      {influencers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          <Megaphone size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Nenhum influenciador cadastrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {influencers.map(inf => (
            <div key={inf.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-semibold text-gray-900">{inf.name}</h4>
                  <span className="text-xs text-gray-400">/{inf.slug}</span>
                  {!inf.is_active && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">Inativo</span>}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {inf.email && <span>{inf.email}</span>}
                  {inf.instagram && <span>{inf.instagram}</span>}
                  <span className="font-medium text-[#07202f]">{inf.registration_count} inscrições</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(inf)} className="p-2 text-gray-400 hover:text-[#07202f] cursor-pointer"><Edit size={16} /></button>
                <button onClick={() => handleDelete(inf.id)} className="p-2 text-gray-400 hover:text-red-600 cursor-pointer"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
