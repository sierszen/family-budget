'use client'

import { useState, useMemo } from 'react'
import { Mail, Clock, CheckCircle, XCircle, Trash2, Search, Filter, Calendar } from 'lucide-react'

interface Invitation {
  id: string
  email: string
  name?: string
  role: 'ADMIN' | 'MEMBER'
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
  expiresAt: string
  createdAt: string
  inviter: {
    id: string
    name: string
    email: string
  }
}

interface InvitationsListProps {
  invitations: Invitation[]
  onCancelInvitation: (id: string) => Promise<void>
  loading?: boolean
}

export function InvitationsList({
  invitations,
  onCancelInvitation,
  loading = false
}: InvitationsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<'createdAt' | 'expiresAt' | 'email'>('createdAt')

  const filteredAndSortedInvitations = useMemo(() => {
    let filtered = invitations

    // Filtrowanie po wyszukiwaniu
    if (searchTerm) {
      filtered = filtered.filter(invitation =>
        invitation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invitation.name && invitation.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtrowanie po statusie
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(invitation => invitation.status === statusFilter)
    }

    // Sortowanie
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'expiresAt':
          return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
        case 'email':
          return a.email.localeCompare(b.email)
        default:
          return 0
      }
    })

    return filtered
  }, [invitations, searchTerm, statusFilter, sortBy])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-blue-100 text-blue-800'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'DECLINED':
        return 'bg-red-100 text-red-800'
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Oczekujące'
      case 'ACCEPTED':
        return 'Zaakceptowane'
      case 'DECLINED':
        return 'Odrzucone'
      case 'EXPIRED':
        return 'Wygasło'
      default:
        return 'Nieznany'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4" />
      case 'DECLINED':
      case 'EXPIRED':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getExpiryColor = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 0) return 'text-red-600'
    if (daysUntilExpiry <= 1) return 'text-orange-600'
    if (daysUntilExpiry <= 3) return 'text-yellow-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Ładowanie zaproszeń...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj po email lub nazwie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">Wszystkie statusy</option>
              <option value="PENDING">Oczekujące</option>
              <option value="ACCEPTED">Zaakceptowane</option>
              <option value="DECLINED">Odrzucone</option>
              <option value="EXPIRED">Wygasłe</option>
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="createdAt">Data utworzenia</option>
              <option value="expiresAt">Data wygaśnięcia</option>
              <option value="email">Email</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invitations List */}
      {filteredAndSortedInvitations.length === 0 ? (
        <div className="text-center py-8">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'ALL' ? 'Brak pasujących zaproszeń' : 'Brak zaproszeń'}
          </h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'ALL'
              ? 'Spróbuj zmienić filtry lub wyszukiwanie'
              : 'Wyślij pierwsze zaproszenie, aby rozpocząć'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedInvitations.map((invitation) => {
            const daysUntilExpiry = getDaysUntilExpiry(invitation.expiresAt)

            return (
              <div key={invitation.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{invitation.email}</span>
                      </div>
                      {invitation.name && (
                        <span className="text-sm text-gray-500">({invitation.name})</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <span>Rola:</span>
                        <span className="font-medium">
                          {invitation.role === 'ADMIN' ? 'Administrator' : 'Członek'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <span>Wysłane przez:</span>
                        <span className="font-medium">{invitation.inviter.name}</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <span>Utworzone:</span>
                        <span>{formatDate(invitation.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Status */}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(invitation.status)}`}>
                      {getStatusIcon(invitation.status)}
                      <span>{getStatusText(invitation.status)}</span>
                    </div>

                    {/* Expiry Info */}
                    {invitation.status === 'PENDING' && (
                      <div className={`text-xs ${getExpiryColor(daysUntilExpiry)}`}>
                        {daysUntilExpiry <= 0
                          ? 'Wygasło'
                          : daysUntilExpiry === 1
                          ? 'Wygasa jutro'
                          : `Wygasa za ${daysUntilExpiry} dni`
                        }
                      </div>
                    )}

                    {/* Actions */}
                    {invitation.status === 'PENDING' && (
                      <button
                        onClick={() => onCancelInvitation(invitation.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Anuluj zaproszenie"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Summary */}
      {filteredAndSortedInvitations.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Pokazano {filteredAndSortedInvitations.length} z {invitations.length} zaproszeń
        </div>
      )}
    </div>
  )
}
