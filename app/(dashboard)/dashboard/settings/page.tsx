import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await db.user.findUniqueOrThrow({ where: { id: session.user.id } })

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
          <p className="font-medium text-gray-900">{user.email}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Alert lead days</p>
          <p className="font-medium text-gray-900">{user.alertLeadDays.join(', ')} days before deadline</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email alerts</p>
          <p className="font-medium text-gray-900">{user.emailAlerts ? 'Enabled' : 'Disabled'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Timezone</p>
          <p className="font-medium text-gray-900">{user.timezone}</p>
        </div>
      </div>
    </div>
  )
}
