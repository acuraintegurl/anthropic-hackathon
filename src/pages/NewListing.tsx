import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAppData } from '../context/AppDataContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Textarea } from '../components/ui/Textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/Card'

const photoFor = (title: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-') || 'furniture')}/600/400`

export function NewListing() {
  const navigate = useNavigate()
  const { createListing } = useAppData()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [estimatedM2, setEstimatedM2] = useState('0.3')
  const [pickupBy, setPickupBy] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const id = createListing({
      title: title.trim(),
      description: description.trim(),
      photoUrl: photoUrl.trim() || photoFor(title),
      estimatedM2: parseFloat(estimatedM2) || 0,
      pickupBy: new Date(pickupBy).toISOString(),
    })
    if (id) navigate(`/listings/${id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to give-aways
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Post a furniture item</CardTitle>
          <CardDescription>
            Give a piece of furniture to a neighbour before it becomes hard
            waste.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Two-seater couch, charcoal"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Condition, dimensions, why you're giving it away..."
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="m2">Estimated size (m²)</Label>
                <Input
                  id="m2"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="1"
                  required
                  value={estimatedM2}
                  onChange={(e) => setEstimatedM2(e.target.value)}
                />
                <p className="text-xs text-slate-500">
                  Approximate footprint if it ended up at the curb.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pickup">Available until</Label>
                <Input
                  id="pickup"
                  type="date"
                  required
                  value={pickupBy}
                  onChange={(e) => setPickupBy(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="photo">Photo URL (optional)</Label>
              <Input
                id="photo"
                placeholder="Leave blank to use a placeholder image"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" size="md">
                Post item
              </Button>
              <Link
                to="/marketplace"
                className="inline-flex items-center justify-center h-10 px-4 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
