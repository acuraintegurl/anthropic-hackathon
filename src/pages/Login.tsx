import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Building2, KeyRound, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAppData } from '../context/AppDataContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Select } from '../components/ui/Select'
import { formatM3 } from '../lib/utils'

type Step = 'code' | 'pick'

export function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const fromQr = params.has('b')
  const { loginAs, currentUserId } = useAuth()
  const { residents, building } = useAppData()

  const initialCode = params.get('b') ?? ''
  const [code, setCode] = useState(initialCode)
  const [codeError, setCodeError] = useState<string | null>(null)
  const [step, setStep] = useState<Step>(
    initialCode.toUpperCase() === building.joinCode ? 'pick' : 'code',
  )
  const [personaId, setPersonaId] = useState<string>('r_amelia')

  const selected = useMemo(
    () => residents.find((r) => r.id === personaId),
    [residents, personaId],
  )

  useEffect(() => {
    if (currentUserId) navigate('/dashboard', { replace: true })
  }, [currentUserId, navigate])

  const handleCodeSubmit = (e: FormEvent) => {
    e.preventDefault()
    setCodeError(null)
    if (code.trim().toUpperCase() !== building.joinCode) {
      setCodeError(
        `That code doesn't match this building. Try "${building.joinCode}" — it's on the lobby poster.`,
      )
      return
    }
    setStep('pick')
  }

  const handlePick = () => {
    loginAs(personaId)
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/welcome"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex items-center gap-3 justify-center mb-6">
          <div className="h-12 w-12 rounded-xl bg-brand-600 grid place-items-center text-white shadow-lg shadow-brand-600/20">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="leading-tight">
            <p className="font-semibold text-slate-900 text-lg">
              {building.name}
            </p>
            <p className="text-sm text-slate-500">Hard Waste Hub</p>
          </div>
        </div>

        {fromQr && (
          <div className="mb-4 rounded-lg bg-brand-50 border border-brand-100 px-3 py-2 text-xs text-brand-900 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>
              Scanned from the lobby — your building code is pre-filled.
            </span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {step === 'code' ? 'Enter your building code' : 'Choose your unit'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {step === 'code'
                ? 'No account, no password. The code is on a poster in your building lobby.'
                : 'One tap to continue. You can switch units any time from the menu.'}
            </p>
          </div>

          {step === 'code' ? (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="code">Building code</Label>
                <div className="relative">
                  <KeyRound className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="code"
                    placeholder={building.joinCode}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    autoComplete="off"
                    autoCapitalize="characters"
                    className="pl-9 uppercase tracking-wider"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Demo hint: use <span className="font-mono font-semibold">{building.joinCode}</span>
                </p>
              </div>
              {codeError && (
                <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-md px-3 py-2">
                  {codeError}
                </p>
              )}
              <Button type="submit" size="lg" className="w-full">
                Continue <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-brand-50/60 border border-brand-100 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-brand-700 mt-0.5 shrink-0" />
                  <p className="text-xs text-brand-900 leading-relaxed">
                    This prototype seeds {residents.length} residents. Pick any
                    of them to demo both sides of a swap.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="persona">Your unit</Label>
                  <Select
                    id="persona"
                    value={personaId}
                    onChange={(e) => setPersonaId(e.target.value)}
                  >
                    {residents.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.aptNumber} — {r.name} ({formatM3(r.entitlementRemainingM3)} left)
                      </option>
                    ))}
                  </Select>
                </div>
                {selected && (
                  <div className="flex items-center gap-3 rounded-md bg-white border border-brand-100 px-3 py-2">
                    <div className="h-9 w-9 rounded-full bg-brand-600 text-white grid place-items-center text-xs font-semibold">
                      {selected.name
                        .split(' ')
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div className="text-xs leading-tight">
                      <p className="font-semibold text-slate-900">
                        {selected.name}
                      </p>
                      <p className="text-slate-500">
                        {selected.aptNumber} ·{' '}
                        {formatM3(selected.entitlementRemainingM3)} entitlement
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setStep('code')}
                >
                  Change code
                </Button>
                <Button
                  type="button"
                  size="lg"
                  className="flex-1"
                  onClick={handlePick}
                >
                  Continue as this resident
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          {building.address}
        </p>
      </div>
    </div>
  )
}
