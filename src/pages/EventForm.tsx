import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { createEvent, getEvent, updateEvent, uploadBanner, type Event } from '@/services/events'
import { ApiError } from '@/lib/api'

export function EventFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [existingBanner, setExistingBanner] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    short_description: '',
    event_type: 'digital' as 'digital' | 'physical',
    start_date: '',
    end_date: '',
    event_date: '',
    registration_start_date: '',
    registration_end_date: '',
    max_participants: '',
    has_ranking: true,
    latitude: '',
    longitude: '',
    max_radius_meters: '',
  })

  useEffect(() => {
    if (isEditing) {
      setLoading(true)
      getEvent(Number(id))
        .then((res) => {
          const e = res.data.event
          setForm({
            name: e.name || '',
            description: e.description || '',
            short_description: e.short_description || '',
            event_type: e.event_type,
            start_date: e.start_date || '',
            end_date: e.end_date || '',
            event_date: e.event_date || '',
            registration_start_date: e.registration_start_date || '',
            registration_end_date: e.registration_end_date || '',
            max_participants: e.max_participants ? String(e.max_participants) : '',
            has_ranking: e.has_ranking,
            latitude: e.latitude ? String(e.latitude) : '',
            longitude: e.longitude ? String(e.longitude) : '',
            max_radius_meters: e.max_radius_meters ? String(e.max_radius_meters) : '',
          })
          if (e.banner_image) {
            setExistingBanner(e.banner_image)
          }
        })
        .catch(() => setError('Erro ao carregar evento'))
        .finally(() => setLoading(false))
    }
  }, [id, isEditing])

  function handleBannerSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
    setExistingBanner(null)
  }

  function removeBanner() {
    setBannerFile(null)
    setBannerPreview(null)
    setExistingBanner(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload: Partial<Event> = {
      name: form.name,
      description: form.description || null,
      short_description: form.short_description || null,
      event_type: form.event_type,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      event_date: form.event_date || null,
      registration_start_date: form.registration_start_date || null,
      registration_end_date: form.registration_end_date || null,
      max_participants: form.max_participants ? Number(form.max_participants) : null,
      has_ranking: form.has_ranking,
    }

    if (form.event_type === 'physical') {
      payload.latitude = form.latitude ? Number(form.latitude) : null
      payload.longitude = form.longitude ? Number(form.longitude) : null
      payload.max_radius_meters = form.max_radius_meters ? Number(form.max_radius_meters) : null
    }

    try {
      let eventId: number
      if (isEditing) {
        await updateEvent(Number(id), payload)
        eventId = Number(id)
      } else {
        const res = await createEvent(payload)
        eventId = res.data.event.id
      }

      if (bannerFile) {
        await uploadBanner(eventId, bannerFile)
      }

      navigate(`/events/${eventId}`)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao salvar evento')
      }
    } finally {
      setSaving(false)
    }
  }

  function updateField(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#07202f] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const previewUrl = bannerPreview || existingBanner

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 cursor-pointer"
      >
        <ArrowLeft size={20} />
        Voltar
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {isEditing ? 'Editar evento' : 'Novo evento'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Banner do evento</h2>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleBannerSelect}
              className="hidden"
            />
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Banner preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeBanner}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#1688cd] hover:text-[#1688cd] transition-colors cursor-pointer"
              >
                <Upload size={32} />
                <span className="text-sm font-medium">Clique para enviar uma imagem</span>
                <span className="text-xs">JPG, PNG ou WebP (max 5MB)</span>
              </button>
            )}
            {previewUrl && !bannerFile && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-sm text-[#1688cd] hover:underline cursor-pointer"
              >
                Trocar imagem
              </button>
            )}
            {bannerFile && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-sm text-[#1688cd] hover:underline cursor-pointer"
              >
                Trocar imagem
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Informações básicas</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do evento *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição curta</label>
            <input
              type="text"
              value={form.short_description}
              onChange={(e) => updateField('short_description', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f] focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo do evento *</label>
              <select
                value={form.event_type}
                onChange={(e) => updateField('event_type', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f] focus:border-transparent bg-white"
              >
                <option value="digital">Digital</option>
                <option value="physical">Presencial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Máx. participantes</label>
              <input
                type="number"
                value={form.max_participants}
                onChange={(e) => updateField('max_participants', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f] focus:border-transparent"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.has_ranking}
              onChange={(e) => updateField('has_ranking', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[#07202f] focus:ring-[#07202f]"
            />
            <span className="text-sm text-gray-700">Habilitar ranking</span>
          </label>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Datas</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data do evento</label>
              <input
                type="datetime-local"
                value={form.event_date}
                onChange={(e) => updateField('event_date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Início do evento</label>
              <input
                type="datetime-local"
                value={form.start_date}
                onChange={(e) => updateField('start_date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fim do evento</label>
              <input
                type="datetime-local"
                value={form.end_date}
                onChange={(e) => updateField('end_date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Início das inscrições</label>
              <input
                type="datetime-local"
                value={form.registration_start_date}
                onChange={(e) => updateField('registration_start_date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fim das inscrições</label>
              <input
                type="datetime-local"
                value={form.registration_end_date}
                onChange={(e) => updateField('registration_end_date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {form.event_type === 'physical' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Localização</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => updateField('latitude', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => updateField('longitude', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raio máximo (metros)</label>
              <input
                type="number"
                value={form.max_radius_meters}
                onChange={(e) => updateField('max_radius_meters', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07202f] focus:border-transparent"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#07202f] text-white rounded-lg font-medium hover:bg-[#0a2d40] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar evento'}
          </button>
        </div>
      </form>
    </div>
  )
}
