'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Users, Edit, Trash2, Save, X, AlertTriangle, Plus, UserPlus, Crown, Mail, Clock } from 'lucide-react'
import { InviteModal } from '@/components/InviteModal'
import { InvitationsList } from '@/components/InvitationsList'

interface Family {
  id: string
  name: string
  description: string
  members: Array<{
    id: string
    name: string
    email: string
    role: string
  }>
  categories: Array<{
    id: string
    name: string
    icon: string
    color: string
    type: string
  }>
}

export default function FamilyPage() {
  const { data: session } = useSession()
  const [family, setFamily] = useState<Family | null>(null)
  const [userRole, setUserRole] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ name: '', description: '' })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'MEMBER' })
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', icon: '📊', color: '#3b82f6', type: 'EXPENSE' })
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteData, setInviteData] = useState({ email: '', name: '', role: 'MEMBER' })
  const [invitations, setInvitations] = useState<any[]>([])
  const [sendingInvite, setSendingInvite] = useState(false)
  const [showInvitations, setShowInvitations] = useState(false)

  useEffect(() => {
    if (session) {
      fetchFamilyData()
      if (userRole === 'ADMIN') {
        fetchInvitations()
      }
    }
  }, [session, userRole])

  const fetchFamilyData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/family', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error('Błąd podczas pobierania danych rodziny')
      }

      const data = await response.json()
      setFamily(data.family)
      setUserRole(data.userRole)
      setEditData({
        name: data.family.name,
        description: data.family.description
      })
    } catch (err) {
      console.error('Błąd pobierania rodziny:', err)
      setError(err instanceof Error ? err.message : 'Nieznany błąd')
    } finally {
      setLoading(false)
    }
  }

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/family/invitations')
      if (!response.ok) {
        throw new Error('Błąd podczas pobierania zaproszeń')
      }
      const data = await response.json()
      setInvitations(data.invitations || [])
    } catch (err) {
      console.error('Błąd pobierania zaproszeń:', err)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData({
      name: family?.name || '',
      description: family?.description || ''
    })
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/family', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Błąd podczas aktualizacji')
      }

      const data = await response.json()
      setFamily(data.family)
      setIsEditing(false)
      alert('Rodzina zaktualizowana pomyślnie!')
    } catch (err) {
      console.error('Błąd aktualizacji:', err)
      alert(err instanceof Error ? err.message : 'Błąd podczas aktualizacji')
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch('/api/family', {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Błąd podczas usuwania')
      }

      alert('Rodzina została usunięta pomyślnie!')
      // Przekieruj do strony głównej
      window.location.href = '/'
    } catch (err) {
      console.error('Błąd usuwania:', err)
      alert(err instanceof Error ? err.message : 'Błąd podczas usuwania')
    } finally {
      setShowDeleteConfirm(false)
    }
  }

  const handleAddMember = async () => {
    try {
      const response = await fetch('/api/family/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMember)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Błąd podczas dodawania członka')
      }

      alert('Członek rodziny został dodany pomyślnie!')
      setShowAddMember(false)
      setNewMember({ name: '', email: '', role: 'MEMBER' })
      fetchFamilyData() // Odśwież dane
    } catch (err) {
      console.error('Błąd dodawania członka:', err)
      alert(err instanceof Error ? err.message : 'Błąd podczas dodawania członka')
    }
  }

  const handleSendInvitation = async (formData: any) => {
    try {
      setSendingInvite(true)
      const response = await fetch('/api/family/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Błąd podczas wysyłania zaproszenia')
      }

      alert('Zaproszenie zostało wysłane pomyślnie!')
      setShowInviteModal(false)
      fetchInvitations() // Odśwież listę zaproszeń
    } catch (err) {
      console.error('Błąd wysyłania zaproszenia:', err)
      // Przekaż błąd do modala zamiast alert
      throw err
    } finally {
      setSendingInvite(false)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/family/invitations?id=${invitationId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Błąd podczas anulowania zaproszenia')
      }

      alert('Zaproszenie zostało anulowane pomyślnie!')
      fetchInvitations() // Odśwież listę zaproszeń
    } catch (err) {
      console.error('Błąd anulowania zaproszenia:', err)
      alert(err instanceof Error ? err.message : 'Błąd podczas anulowania zaproszenia')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tego członka z rodziny?')) {
      return
    }

    try {
      const response = await fetch(`/api/family/members?id=${memberId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Błąd podczas usuwania członka')
      }

      alert('Członek został usunięty z rodziny pomyślnie!')
      fetchFamilyData() // Odśwież dane
    } catch (err) {
      console.error('Błąd usuwania członka:', err)
      alert(err instanceof Error ? err.message : 'Błąd podczas usuwania członka')
    }
  }

  const handleAddCategory = async () => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCategory)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Błąd podczas dodawania kategorii')
      }

      alert('Kategoria została dodana pomyślnie!')
      setShowAddCategory(false)
      setNewCategory({ name: '', icon: '📊', color: '#3b82f6', type: 'EXPENSE' })
      fetchFamilyData() // Odśwież dane
    } catch (err) {
      console.error('Błąd dodawania kategorii:', err)
      alert(err instanceof Error ? err.message : 'Błąd podczas dodawania kategorii')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Błąd</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!family) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Rodzina nie znaleziona</h2>
          <p className="text-gray-600">Nie udało się załadować danych rodziny.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Zarządzanie rodziną</h1>
                <p className="text-gray-600">Zarządzaj danymi swojej rodziny</p>
              </div>
            </div>
            {userRole === 'ADMIN' && (
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>Zapisz</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Anuluj</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleEdit}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edytuj</span>
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Usuń rodzinę</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Family Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informacje podstawowe</h2>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nazwa rodziny
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opis
                  </label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Nazwa:</span>
                  <p className="text-gray-900">{family.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Opis:</span>
                  <p className="text-gray-900">{family.description}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Twoja rola:</span>
                  <p className="text-gray-900 capitalize">{userRole.toLowerCase()}</p>
                </div>
              </div>
            )}
          </div>

          {/* Members */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Członkowie rodziny</h2>
              {userRole === 'ADMIN' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Zaproś email</span>
                  </button>
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Dodaj bezpośrednio</span>
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {family.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium text-gray-900 flex items-center space-x-2">
                        {member.name}
                        {member.role === 'ADMIN' && <Crown className="h-4 w-4 text-yellow-500" />}
                      </p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {member.role === 'ADMIN' ? 'Administrator' : 'Członek'}
                    </span>
                    {userRole === 'ADMIN' && member.id !== session?.user?.id && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        title="Usuń z rodziny"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Kategorie</h2>
            {userRole === 'ADMIN' && (
              <button
                onClick={() => setShowAddCategory(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Dodaj kategorię</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {family.categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{category.type.toLowerCase()}</p>
                  </div>
                </div>
                {userRole === 'ADMIN' && (
                  <button
                    onClick={() => {
                      if (confirm(`Czy na pewno chcesz usunąć kategorię "${category.name}"?`)) {
                        // TODO: Implementacja usuwania kategorii
                        alert('Funkcja usuwania kategorii będzie dostępna wkrótce!')
                      }
                    }}
                    className="p-1 text-red-600 hover:text-red-800 transition-colors"
                    title="Usuń kategorię"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Invitations - tylko dla adminów */}
        {userRole === 'ADMIN' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Zaproszenia</h2>
              <button
                onClick={() => setShowInvitations(!showInvitations)}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <Mail className="h-4 w-4" />
                <span>{showInvitations ? 'Ukryj' : 'Pokaż'} zaproszenia</span>
              </button>
            </div>

            {showInvitations && (
              <InvitationsList
                invitations={invitations}
                onCancelInvitation={handleCancelInvitation}
                loading={false}
              />
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Usuń rodzinę</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Czy na pewno chcesz usunąć rodzinę &quot;{family.name}&quot;? Ta operacja jest nieodwracalna i usunie wszystkie dane.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <UserPlus className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Dodaj członka rodziny</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imię i nazwisko
                </label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Wprowadź imię i nazwisko"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Wprowadź email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rola
                </label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value as 'ADMIN' | 'MEMBER' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MEMBER">Członek</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddMember(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleAddMember}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Dodaj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <Plus className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Dodaj kategorię</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nazwa kategorii
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Wprowadź nazwę kategorii"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ikona
                </label>
                <input
                  type="text"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="np. 🍽️"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kolor
                </label>
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Typ
                </label>
                <select
                  value={newCategory.type}
                  onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'EXPENSE' | 'INCOME' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="EXPENSE">Wydatek</option>
                  <option value="INCOME">Przychód</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddCategory(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleAddCategory}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Dodaj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSend={handleSendInvitation}
        loading={sendingInvite}
        onShowInvitations={() => {
          setShowInviteModal(false)
          setShowInvitations(true)
        }}
      />
    </div>
  )
}
