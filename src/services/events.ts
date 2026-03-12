import { api } from '@/lib/api'

export interface Event {
  id: number
  name: string
  slug: string
  description: string | null
  short_description: string | null
  banner_image: string | null
  event_type: 'digital' | 'physical'
  status: 'draft' | 'published' | 'active' | 'completed' | 'cancelled'
  sport_category_id: number | null
  start_date: string | null
  end_date: string | null
  event_date: string | null
  registration_start_date: string | null
  registration_end_date: string | null
  latitude: number | null
  longitude: number | null
  max_radius_meters: number | null
  max_participants: number | null
  participant_count: number
  has_ranking: boolean
  created_at: string
}

export interface EventPlan {
  id: number
  event_id: number
  name: string
  description: string | null
  price: number
  benefits: string[] | null
  max_registrations: number | null
  registration_count: number
  sort_order: number
  is_active: boolean
}

export interface EventFormField {
  id: number
  event_id: number
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'checkbox' | 'date' | 'email' | 'phone'
  options: string[] | null
  is_required: boolean
  sort_order: number
}

export interface EventInfluencer {
  id: number
  event_id: number
  name: string
  slug: string
  email: string | null
  instagram: string | null
  metadata: Record<string, unknown> | null
  registration_count: number
  is_active: boolean
}

export interface EventRegistration {
  id: number
  user_id: number
  event_plan_id: number
  influencer_id: number | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded'
  payment_status: 'free' | 'pending' | 'paid' | 'failed' | 'refunded'
  amount_paid: number
  platform_fee: number
  partner_amount: number
  form_data: Record<string, unknown> | null
  confirmed_at: string | null
  user_first_name: string
  user_last_name: string
  user_avatar: string | null
}

export interface EventMission {
  id: number
  event_id: number
  name: string
  slug: string
  description: string | null
  type: 'daily' | 'weekly' | 'event'
  goal_type: 'distance' | 'duration' | 'calories' | 'activities' | 'streak'
  goal_value: number
  goal_unit: string | null
  xp_reward: number
  icon: string | null
  start_date: string | null
  end_date: string | null
  is_active: boolean
}

export interface EventStats {
  total_registrations: number
  confirmed_registrations: number
  total_revenue: number
  partner_amount: number
  platform_fee: number
}

export interface LeaderboardEntry {
  user_id: number
  first_name: string
  last_name: string
  avatar: string | null
  total_xp: number
  total_distance_meters: number
  total_duration_seconds: number
  total_activities: number
  rank_position: number
}

// Events
export const listEvents = () => api<Event[]>('/partner/events')

export const getEvent = (id: number) => api<Event>(`/partner/events/${id}`)

export const createEvent = (data: Partial<Event>) =>
  api<Event>('/partner/events', { method: 'POST', body: JSON.stringify(data) })

export const updateEvent = (id: number, data: Partial<Event>) =>
  api<Event>(`/partner/events/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const publishEvent = (id: number) =>
  api(`/partner/events/${id}/publish`, { method: 'POST' })

export const cancelEvent = (id: number) =>
  api(`/partner/events/${id}/cancel`, { method: 'POST' })

export const completeEvent = (id: number) =>
  api(`/partner/events/${id}/complete`, { method: 'POST' })

// Plans
export const listPlans = (eventId: number) =>
  api<EventPlan[]>(`/partner/events/${eventId}/plans`)

export const createPlan = (eventId: number, data: Partial<EventPlan>) =>
  api<EventPlan>(`/partner/events/${eventId}/plans`, { method: 'POST', body: JSON.stringify(data) })

export const updatePlan = (eventId: number, planId: number, data: Partial<EventPlan>) =>
  api<EventPlan>(`/partner/events/${eventId}/plans/${planId}`, { method: 'PUT', body: JSON.stringify(data) })

export const deletePlan = (eventId: number, planId: number) =>
  api(`/partner/events/${eventId}/plans/${planId}`, { method: 'DELETE' })

// Form Fields
export const listFormFields = (eventId: number) =>
  api<EventFormField[]>(`/partner/events/${eventId}/form-fields`)

export const createFormField = (eventId: number, data: Partial<EventFormField>) =>
  api<EventFormField>(`/partner/events/${eventId}/form-fields`, { method: 'POST', body: JSON.stringify(data) })

export const updateFormField = (eventId: number, fieldId: number, data: Partial<EventFormField>) =>
  api<EventFormField>(`/partner/events/${eventId}/form-fields/${fieldId}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteFormField = (eventId: number, fieldId: number) =>
  api(`/partner/events/${eventId}/form-fields/${fieldId}`, { method: 'DELETE' })

// Influencers
export const listInfluencers = (eventId: number) =>
  api<EventInfluencer[]>(`/partner/events/${eventId}/influencers`)

export const createInfluencer = (eventId: number, data: Partial<EventInfluencer>) =>
  api<EventInfluencer>(`/partner/events/${eventId}/influencers`, { method: 'POST', body: JSON.stringify(data) })

export const updateInfluencer = (eventId: number, infId: number, data: Partial<EventInfluencer>) =>
  api<EventInfluencer>(`/partner/events/${eventId}/influencers/${infId}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteInfluencer = (eventId: number, infId: number) =>
  api(`/partner/events/${eventId}/influencers/${infId}`, { method: 'DELETE' })

// Registrations
export const listRegistrations = (eventId: number, params?: { page?: number; per_page?: number; status?: string }) => {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.per_page) query.set('per_page', String(params.per_page))
  if (params?.status) query.set('status', params.status)
  return api<{ registrations: EventRegistration[]; total: number }>(`/partner/events/${eventId}/registrations?${query}`)
}

// Stats
export const getEventStats = (eventId: number) =>
  api<EventStats>(`/partner/events/${eventId}/stats`)

// Leaderboard
export const getEventLeaderboard = (eventId: number, params?: { page?: number; per_page?: number }) => {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.per_page) query.set('per_page', String(params.per_page))
  return api<{ leaderboard: LeaderboardEntry[]; total: number }>(`/partner/events/${eventId}/leaderboard?${query}`)
}

// Missions
export const listMissions = (eventId: number) =>
  api<EventMission[]>(`/partner/events/${eventId}/missions`)

export const createMission = (eventId: number, data: Partial<EventMission>) =>
  api<EventMission>(`/partner/events/${eventId}/missions`, { method: 'POST', body: JSON.stringify(data) })

export const updateMission = (eventId: number, missionId: number, data: Partial<EventMission>) =>
  api<EventMission>(`/partner/events/${eventId}/missions/${missionId}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteMission = (eventId: number, missionId: number) =>
  api(`/partner/events/${eventId}/missions/${missionId}`, { method: 'DELETE' })
