import { useState, useEffect } from 'react'
import './App.css'
import { ChevronRight, ChevronLeft, Check, Send } from 'lucide-react'

const BACKEND_URL = "https://app-fsoqjwmi.fly.dev"

const SPORTS = [
  "Formula 1", "Cycling", "Running", "Triathlon", "Swimming",
  "Tennis", "Golf", "Basketball", "Football (Soccer)", "American Football",
  "Baseball", "Hockey", "MMA / Boxing", "Skiing / Snowboarding",
  "Surfing", "CrossFit", "Weightlifting", "Gymnastics",
  "Track & Field", "Esports", "Other"
]

const MARKETS = [
  "United States",
  "Canada",
  "United Kingdom",
  "Europe",
  "Middle East",
  "Australia / New Zealand",
  "Asia",
  "Latin America",
  "Africa",
  "Global / Multiple",
  "Other"
]

const PARTNERSHIP_TYPES = [
  "Product Gifting / Seeding",
  "Paid Social Content",
  "Event Sponsorship",
  "Brand Ambassadorship",
  "Affiliate / Revenue Share",
  "Other"
]

const TIMELINE_OPTIONS = [
  "Immediate (within 2 weeks)",
  "1 - 3 months",
  "3 - 6 months",
  "6+ months",
  "Flexible / Ongoing"
]

interface FormData {
  email: string
  fullName: string
  role: string
  organization: string
  sport: string
  sportOther: string
  athleteName: string
  socialMedia: string
  followersRange: string
  partnershipType: string
  partnershipOther: string
  proposalSummary: string
  market: string
  sleptOnPod: string
  timeline: string
  previousPartnerships: string
  additionalNotes: string
}

const initialFormData: FormData = {
  email: '',
  fullName: '',
  role: '',
  organization: '',
  sport: '',
  sportOther: '',
  athleteName: '',
  socialMedia: '',
  followersRange: '',
  partnershipType: '',
  partnershipOther: '',
  proposalSummary: '',
  market: '',
  sleptOnPod: '',
  timeline: '',
  previousPartnerships: '',
  additionalNotes: ''
}

function App() {
  const [currentPage, setCurrentPage] = useState(0)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [fadeIn, setFadeIn] = useState(true)

  // Read pre-fill params from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const name = params.get('name')
    const email = params.get('email')
    if (name || email) {
      setFormData(prev => ({
        ...prev,
        ...(name ? { fullName: name } : {}),
        ...(email ? { email } : {})
      }))
    }
  }, [])

  const pages = [
    { title: "About You", subtitle: "Tell us who you are" },
    { title: "The Athlete", subtitle: "Who are we talking about?" },
    { title: "The Proposal", subtitle: "What do you have in mind?" },
    { title: "Details & Timeline", subtitle: "Help us understand the scope" }
  ]

  const totalPages = pages.length

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validatePage = (page: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (page === 0) {
      if (!formData.email.trim()) newErrors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email'
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
      if (!formData.role.trim()) newErrors.role = 'Role is required'
    }

    if (page === 1) {
      if (!formData.sport) newErrors.sport = 'Please select a sport'
      if (formData.sport === 'Other' && !formData.sportOther.trim()) newErrors.sportOther = 'Please specify the sport'
      if (!formData.athleteName.trim()) newErrors.athleteName = 'Athlete/team name is required'
    }

    if (page === 2) {
      if (!formData.partnershipType) newErrors.partnershipType = 'Please select a partnership type'
      if (formData.partnershipType === 'Other' && !formData.partnershipOther.trim()) newErrors.partnershipOther = 'Please specify the partnership type'
      if (!formData.proposalSummary.trim()) newErrors.proposalSummary = 'Please provide a brief proposal summary'
    }

    if (page === 3) {
      if (!formData.market) newErrors.market = 'Please select a market'
      if (!formData.sleptOnPod) newErrors.sleptOnPod = 'Please select an option'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextPage = () => {
    if (validatePage(currentPage)) {
      setFadeIn(false)
      setTimeout(() => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))
        setFadeIn(true)
      }, 150)
    }
  }

  const prevPage = () => {
    setFadeIn(false)
    setTimeout(() => {
      setCurrentPage(prev => Math.max(prev - 1, 0))
      setFadeIn(true)
    }, 150)
  }

  const handleSubmit = async () => {
    if (!validatePage(currentPage)) return

    setSubmitting(true)
    try {
      const payload = {
        email: formData.email,
        full_name: formData.fullName,
        role: formData.role,
        organization: formData.organization,
        sport: formData.sport === 'Other' ? formData.sportOther : formData.sport,
        athlete_name: formData.athleteName,
        social_media: formData.socialMedia,
        followers_range: formData.followersRange,
        partnership_type: formData.partnershipType === 'Other' ? formData.partnershipOther : formData.partnershipType,
        proposal_summary: formData.proposalSummary,
        market: formData.market,
        slept_on_pod: formData.sleptOnPod,
        timeline: formData.timeline,
        previous_partnerships: formData.previousPartnerships,
        additional_notes: formData.additionalNotes
      }

      await fetch(`${BACKEND_URL}/api/form-submission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      setSubmitted(true)
    } catch {
      // Still show success - the Google Sheet webhook is a fire-and-forget
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (field: keyof FormData) =>
    `w-full bg-zinc-900 border ${errors[field] ? 'border-red-500' : 'border-zinc-700'} rounded-lg px-4 py-3 text-white text-sm placeholder-zinc-500 focus:border-white transition-colors`

  const selectClass = (field: keyof FormData) =>
    `w-full bg-zinc-900 border ${errors[field] ? 'border-red-500' : 'border-zinc-700'} rounded-lg px-4 py-3 text-white text-sm focus:border-white transition-colors cursor-pointer`

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-semibold mb-4">Proposal Received</h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            Thank you for your interest in partnering with Eight Sleep. We review all submissions on a rolling basis and will be in touch if there's a fit.
          </p>
          <div className="border-t border-zinc-800 pt-8">
            <p className="text-zinc-600 text-sm">
              Eight Sleep Sports Team
              <br />
              sports@eightsleep.com
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="6" fill="white"/>
              <text x="5" y="23" fontSize="18" fontWeight="bold" fill="black" fontFamily="Inter, sans-serif">8</text>
            </svg>
            <span className="text-sm font-medium text-zinc-400">Sports Partnerships</span>
          </div>
          <div className="text-xs text-zinc-600">
            Step {currentPage + 1} of {totalPages}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-zinc-900">
          <div
            className="h-full bg-white progress-fill"
            style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
          />
        </div>
      </header>

      {/* Hero section - only on first page */}
      {currentPage === 0 && (
        <div className="pt-20 pb-0">
          <div className="relative overflow-hidden">
            {/* Athlete collage grid */}
            <div className="grid grid-cols-4 h-48 sm:h-64">
              <div className="relative overflow-hidden">
                <img
                  src="https://i0.wp.com/eightsleepcom.wpcomstaging.com/wp-content/uploads/2026/03/CL-for-Malaya.jpg?fit=800%2C450&ssl=1"
                  alt="Charles Leclerc — F1 Racing Driver"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="relative overflow-hidden">
                <img
                  src="https://res.cloudinary.com/eightsleep/image/upload/c_fill,g_face,f_auto,w_800,h_600,q_80/v1768399590/Arturo_Coello_Athlete_xwmzm2.jpg"
                  alt="Arturo Coello — World #1 Padel Player"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="relative overflow-hidden">
                <img
                  src="https://i0.wp.com/eightsleepcom.wpcomstaging.com/wp-content/uploads/2024/06/8-Sleep-1361-1.jpg?fit=800%2C450&ssl=1"
                  alt="Taylor Fritz — Professional Tennis Player"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="relative overflow-hidden">
                <img
                  src="https://i0.wp.com/eightsleepcom.wpcomstaging.com/wp-content/uploads/2026/01/8S_UAE_Blog02.jpg?fit=800%2C450&ssl=1"
                  alt="UAE Team Emirates XRG — Pro Cycling Team"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3">
                Partnership & Sponsorship Inquiry
              </h1>
              <p className="text-zinc-400 text-sm sm:text-lg max-w-2xl">
                Sleep is where performance is built. Tell us about yourself and your proposal, and we'll take it from there.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <main className={`${currentPage === 0 ? 'pt-8' : 'pt-28'} pb-32 px-6`}>
        <div className="max-w-2xl mx-auto">
          {/* Page title */}
          {currentPage > 0 && (
            <div className="mb-10">
              <h2 className="text-2xl font-semibold mb-2">{pages[currentPage].title}</h2>
              <p className="text-zinc-500">{pages[currentPage].subtitle}</p>
            </div>
          )}

          <div
            className={`transition-all duration-300 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
          >
            {/* Page 1: About You */}
            {currentPage === 0 && (
              <div className="space-y-6">
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-1 text-zinc-300">{pages[0].title}</h3>
                  <p className="text-sm text-zinc-600">{pages[0].subtitle}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Email address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass('email')}
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Full name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="Jane Smith"
                    className={inputClass('fullName')}
                  />
                  {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Your role <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => updateField('role', e.target.value)}
                    placeholder="Agent, Manager, Athlete, Brand Manager..."
                    className={inputClass('role')}
                  />
                  {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Organization / Agency
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => updateField('organization', e.target.value)}
                    placeholder="Company or agency name (if applicable)"
                    className={inputClass('organization')}
                  />
                </div>
              </div>
            )}

            {/* Page 2: The Athlete */}
            {currentPage === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Sport / discipline <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.sport}
                    onChange={(e) => updateField('sport', e.target.value)}
                    className={selectClass('sport')}
                  >
                    <option value="" disabled>Select a sport</option>
                    {SPORTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.sport && <p className="text-red-400 text-xs mt-1">{errors.sport}</p>}
                </div>

                {formData.sport === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Please specify <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.sportOther}
                      onChange={(e) => updateField('sportOther', e.target.value)}
                      placeholder="Your sport"
                      className={inputClass('sportOther')}
                    />
                    {errors.sportOther && <p className="text-red-400 text-xs mt-1">{errors.sportOther}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Athlete / team name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.athleteName}
                    onChange={(e) => updateField('athleteName', e.target.value)}
                    placeholder="Full name or team name"
                    className={inputClass('athleteName')}
                  />
                  {errors.athleteName && <p className="text-red-400 text-xs mt-1">{errors.athleteName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Social media profiles
                  </label>
                  <input
                    type="text"
                    value={formData.socialMedia}
                    onChange={(e) => updateField('socialMedia', e.target.value)}
                    placeholder="Instagram, Twitter/X, TikTok links"
                    className={inputClass('socialMedia')}
                  />
                  <p className="text-zinc-600 text-xs mt-1">Separate multiple links with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Combined followers / audience reach
                  </label>
                  <select
                    value={formData.followersRange}
                    onChange={(e) => updateField('followersRange', e.target.value)}
                    className={selectClass('followersRange')}
                  >
                    <option value="" disabled>Select range</option>
                    <option value="Under 10K">Under 10K</option>
                    <option value="10K - 50K">10K - 50K</option>
                    <option value="50K - 100K">50K - 100K</option>
                    <option value="100K - 500K">100K - 500K</option>
                    <option value="500K - 1M">500K - 1M</option>
                    <option value="1M+">1M+</option>
                  </select>
                </div>
              </div>
            )}

            {/* Page 3: The Proposal */}
            {currentPage === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Partnership type <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.partnershipType}
                    onChange={(e) => updateField('partnershipType', e.target.value)}
                    className={selectClass('partnershipType')}
                  >
                    <option value="" disabled>Select type</option>
                    {PARTNERSHIP_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {errors.partnershipType && <p className="text-red-400 text-xs mt-1">{errors.partnershipType}</p>}
                </div>

                {formData.partnershipType === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Please specify <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.partnershipOther}
                      onChange={(e) => updateField('partnershipOther', e.target.value)}
                      placeholder="Describe the partnership type"
                      className={inputClass('partnershipOther')}
                    />
                    {errors.partnershipOther && <p className="text-red-400 text-xs mt-1">{errors.partnershipOther}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Proposal summary <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.proposalSummary}
                    onChange={(e) => updateField('proposalSummary', e.target.value)}
                    placeholder="Describe what you have in mind. What would a partnership look like? What value would it create for both sides?"
                    rows={5}
                    className={`${inputClass('proposalSummary')} resize-none`}
                  />
                  {errors.proposalSummary && <p className="text-red-400 text-xs mt-1">{errors.proposalSummary}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Previous brand partnerships
                  </label>
                  <textarea
                    value={formData.previousPartnerships}
                    onChange={(e) => updateField('previousPartnerships', e.target.value)}
                    placeholder="List any notable brand partnerships or sponsorships (past or current)"
                    rows={3}
                    className={`${inputClass('previousPartnerships')} resize-none`}
                  />
                </div>
              </div>
            )}

            {/* Page 4: Details & Timeline */}
            {currentPage === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Market <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.market}
                    onChange={(e) => updateField('market', e.target.value)}
                    className={selectClass('market')}
                  >
                    <option value="" disabled>Select market</option>
                    {MARKETS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  {errors.market && <p className="text-red-400 text-xs mt-1">{errors.market}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Has the athlete / team slept on an Eight Sleep Pod before? <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.sleptOnPod}
                    onChange={(e) => updateField('sleptOnPod', e.target.value)}
                    className={selectClass('sleptOnPod')}
                  >
                    <option value="" disabled>Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Not sure">Not sure</option>
                  </select>
                  {errors.sleptOnPod && <p className="text-red-400 text-xs mt-1">{errors.sleptOnPod}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Timeline
                  </label>
                  <select
                    value={formData.timeline}
                    onChange={(e) => updateField('timeline', e.target.value)}
                    className={selectClass('timeline')}
                  >
                    <option value="" disabled>Select timeline</option>
                    {TIMELINE_OPTIONS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Anything else we should know?
                  </label>
                  <textarea
                    value={formData.additionalNotes}
                    onChange={(e) => updateField('additionalNotes', e.target.value)}
                    placeholder="Additional context, links, attachments, or questions"
                    rows={4}
                    className={`${inputClass('additionalNotes')} resize-none`}
                  />
                </div>

                {/* Summary preview */}
                <div className="mt-8 border border-zinc-800 rounded-xl p-6 bg-zinc-950">
                  <h4 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Submission Preview</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Name</span>
                      <span className="text-zinc-200">{formData.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Email</span>
                      <span className="text-zinc-200">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Sport</span>
                      <span className="text-zinc-200">{formData.sport === 'Other' ? formData.sportOther : formData.sport}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Athlete</span>
                      <span className="text-zinc-200">{formData.athleteName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Partnership</span>
                      <span className="text-zinc-200">{formData.partnershipType === 'Other' ? formData.partnershipOther : formData.partnershipType}</span>
                    </div>
                    {formData.market && (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Market</span>
                        <span className="text-zinc-200">{formData.market}</span>
                      </div>
                    )}
                    {formData.sleptOnPod && (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Slept on Pod?</span>
                        <span className="text-zinc-200">{formData.sleptOnPod}</span>
                      </div>
                    )}
                    {formData.timeline && (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Timeline</span>
                        <span className="text-zinc-200">{formData.timeline}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Fixed bottom nav */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-zinc-900">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          {currentPage > 0 ? (
            <button
              onClick={prevPage}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentPage < totalPages - 1 ? (
            <button
              onClick={nextPage}
              className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>Submitting...</>
              ) : (
                <>
                  Submit Proposal
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}

export default App
