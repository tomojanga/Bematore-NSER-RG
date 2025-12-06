'use client'

import { useTranslations } from 'next-intl'

export default function DashboardPage() {
  const t = useTranslations()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="mt-2 text-gray-600">{t('dashboard.welcome')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: t('dashboard.active_lookups'), value: '1,234', color: 'bg-blue-50 text-blue-700' },
          { label: t('dashboard.api_calls_today'), value: '456', color: 'bg-purple-50 text-purple-700' },
          { label: t('dashboard.exclusions_found'), value: '23', color: 'bg-green-50 text-green-700' },
          { label: t('dashboard.system_uptime'), value: '99.9%', color: 'bg-amber-50 text-amber-700' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`${stat.color} rounded-lg p-6 border border-current border-opacity-20`}
          >
            <p className="text-sm font-medium opacity-75">{stat.label}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('common.loading')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium text-sm">
            {t('lookup.title')}
          </button>
          <button className="px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition font-medium text-sm">
            {t('api_keys.create_new')}
          </button>
          <button className="px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition font-medium text-sm">
            {t('statistics.title')}
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('common.loading')}</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b last:border-b-0">
              <span className="text-gray-600">Activity {i}</span>
              <span className="text-sm text-gray-400">2 hours ago</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
