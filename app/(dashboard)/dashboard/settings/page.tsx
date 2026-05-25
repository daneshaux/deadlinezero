import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await db.user.findUniqueOrThrow({ where: { id: session.user.id } })

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-[24px] font-bold text-white mb-6">Settings</h2>

      <div className="dz-glass-card rounded-[10px] p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-[14px] text-[#A1B7E7]">Email</span>
          <span className="text-[16px] text-white">{user.email}</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[14px] text-[#A1B7E7]">Alert lead days</span>
          <span className="text-[16px] text-white">
            {user.alertLeadDays.join(', ')} days before deadline
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[14px] text-[#A1B7E7]">Email Alerts</span>
          <span className="text-[16px] text-white">
            {user.emailAlerts ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[14px] text-[#A1B7E7]">Timezone</span>
          <span className="text-[16px] text-white">{user.timezone}</span>
        </div>
      </div>
    </div>
  )
}
