/**
 * API Routes for Individual Profile by ID - CON AUTORIZACIÓN
 * GET /api/individuals/:userId - Get individual profile (3 casos de autorización)
 * PATCH /api/individuals/:userId - Update individual profile
 * DELETE /api/individuals/:userId - Delete individual account (GDPR)
 *
 * AUTORIZACIÓN (3 ACTORES):
 * 1. Individual Owner: Full access a su propio perfil
 * 2. Therapist: Full access a pacientes asignados solamente
 * 3. Company: Limited access con connection/consent activa solamente
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getIndividualProfile,
  updateIndividualProfile,
  deleteUserAccount
} from '@/lib/individuals'
import { logDataAccess } from '@/lib/audit'
import { getConnectionsForUser } from '@/lib/storage'

/**
 * Helper: Buscar connection activa entre company y candidate
 */
async function findActiveConnection(companyId, candidateId) {
  const connections = await getConnectionsForUser(candidateId)

  return connections.find(conn =>
    conn.companyId === companyId &&
    conn.candidateId === candidateId &&
    conn.status === 'active'
  ) || null
}

/**
 * Helper: Filtrar perfil según sharedData de connection
 */
function filterBySharedData(profile, sharedData, shareDiagnosis) {
  const filtered = {
    userId: profile.userId,
    userType: profile.userType,
    email: null,
    profile: {
      name: null,
      skills: null,
      experience: null,
      education: null,
      accommodationsNeeded: null,
      assessment: null
    }
  }

  // Mapear sharedData a campos del perfil
  if (sharedData.includes('email')) {
    filtered.email = profile.email
  }

  if (sharedData.includes('name')) {
    filtered.profile.name = profile.profile.name
  }

  if (sharedData.includes('skills')) {
    filtered.profile.skills = profile.profile.skills
  }

  if (sharedData.includes('experience')) {
    filtered.profile.experience = profile.profile.experience
  }

  if (sharedData.includes('education')) {
    filtered.profile.education = profile.profile.education
  }

  if (sharedData.includes('accommodations')) {
    filtered.profile.accommodationsNeeded = profile.profile.accommodationsNeeded
  }

  if (sharedData.includes('assessment')) {
    filtered.assessment = profile.assessment
  }

  // NUNCA compartir diagnósticos sin permiso explícito
  if (shareDiagnosis) {
    filtered.profile.diagnoses = profile.profile.diagnoses
    filtered.profile.medicalHistory = profile.profile.medicalHistory
    filtered.profile.therapistId = profile.profile.therapistId
  }

  return filtered
}

/**
 * GET /api/individuals/:userId
 * Obtener perfil de individual con autorización de 3 actores
 *
 * @param {string} userId - User ID del candidato
 * @returns {object} 200 - Individual profile (filtrado según permisos)
 * @returns {object} 401 - No autenticado
 * @returns {object} 403 - No autorizado
 * @returns {object} 404 - Profile not found
 * @returns {object} 500 - Server error
 */
export async function GET(request, { params }) {
  try {
    // ════════════════════════════════════════════════════════════════════════
    // 1. VERIFICAR AUTENTICACIÓN
    // ════════════════════════════════════════════════════════════════════════
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    const { userId } = await params
    const requestorId = session.user.id
    const requestorType = session.user.type

    // Obtener perfil del candidato
    const profile = await getIndividualProfile(userId)

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // ════════════════════════════════════════════════════════════════════════
    // CASO 1: INDIVIDUAL OWNER - Acceso completo a su propio perfil
    // ════════════════════════════════════════════════════════════════════════
    if (requestorType === 'individual' && requestorId === userId) {
      // Audit log (self-access = baja prioridad)
      await logDataAccess({
        accessedBy: requestorId,
        targetUser: userId,
        dataAccessed: ['profile', 'privacy', 'assessment', 'all_fields'],
        dataType: 'Profile',
        sensitivityLevel: 'low',
        reason: 'self_access',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      })

      // FULL ACCESS (incluye datos médicos desencriptados)
      return NextResponse.json({
        success: true,
        data: profile
      })
    }

    // ════════════════════════════════════════════════════════════════════════
    // CASO 2: THERAPIST - Acceso completo a pacientes asignados
    // ════════════════════════════════════════════════════════════════════════
    if (requestorType === 'therapist') {
      const assignedTherapistId = profile.profile.therapistId

      // Verificar que el candidato está asignado a este terapeuta
      if (assignedTherapistId !== requestorId) {
        return NextResponse.json(
          {
            error: 'Forbidden: Not your assigned patient',
            hint: 'Only therapists assigned to this patient can access their medical data'
          },
          { status: 403 }
        )
      }

      // Audit log (HIGH sensitivity - medical data access)
      await logDataAccess({
        accessedBy: requestorId,
        targetUser: userId,
        dataAccessed: ['profile', 'diagnoses', 'medicalHistory', 'assessment', 'therapistId'],
        dataType: 'Medical',
        sensitivityLevel: 'high',
        reason: 'therapist_patient_care',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      })

      // FULL ACCESS (incluye datos médicos - necesario para tratamiento)
      return NextResponse.json({
        success: true,
        data: profile
      })
    }

    // ════════════════════════════════════════════════════════════════════════
    // CASO 3: COMPANY - Acceso limitado con connection/consent activa
    // ════════════════════════════════════════════════════════════════════════
    if (requestorType === 'company') {
      const companyId = requestorId

      // Buscar connection activa
      const connection = await findActiveConnection(companyId, userId)

      if (!connection) {
        return NextResponse.json(
          {
            error: 'Forbidden: No active connection with this candidate',
            hint: 'Candidate must accept match first to grant access'
          },
          { status: 403 }
        )
      }

      // Verificar que connection no está revocada
      if (connection.status === 'revoked') {
        return NextResponse.json(
          {
            error: 'Forbidden: Candidate revoked consent',
            revokedAt: connection.revokedAt
          },
          { status: 403 }
        )
      }

      // Filtrar datos según connection.sharedData
      const shareDiagnosis = connection.customPrivacy?.shareDiagnosis || false
      const filteredProfile = filterBySharedData(profile, connection.sharedData, shareDiagnosis)

      // Audit log (MEDIUM-HIGH sensitivity según shareDiagnosis)
      await logDataAccess({
        accessedBy: companyId,
        targetUser: userId,
        dataAccessed: connection.sharedData,
        dataType: shareDiagnosis ? 'Medical' : 'Professional',
        sensitivityLevel: shareDiagnosis ? 'high' : 'medium',
        reason: 'pipeline_review',
        connectionId: connection.connectionId,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      })

      // LIMITED ACCESS (filtrado por sharedData)
      return NextResponse.json({
        success: true,
        data: filteredProfile,
        sharedData: connection.sharedData,
        connectionId: connection.connectionId
      })
    }

    // ════════════════════════════════════════════════════════════════════════
    // CASO 4: ACCESO NO AUTORIZADO
    // ════════════════════════════════════════════════════════════════════════
    return NextResponse.json(
      {
        error: 'Forbidden: You do not have permission to access this profile',
        yourType: requestorType,
        yourId: requestorId
      },
      { status: 403 }
    )

  } catch (error) {
    console.error('Error fetching individual profile:', error)

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/individuals/:userId
 * Update individual profile (requiere ser el owner)
 */
export async function PATCH(request, { params }) {
  try {
    // Verificar autenticación
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    const { userId } = await params
    const requestorId = session.user.id
    const requestorType = session.user.type

    // Solo el owner puede actualizar su perfil
    if (requestorType !== 'individual' || requestorId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own profile' },
        { status: 403 }
      )
    }

    const updates = await request.json()

    // Check if profile exists
    const existing = await getIndividualProfile(userId)
    if (!existing) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Update profile
    const updatedProfile = await updateIndividualProfile(userId, updates)

    // Audit log
    await logDataAccess({
      accessedBy: requestorId,
      targetUser: userId,
      dataAccessed: Object.keys(updates),
      dataType: 'Profile',
      sensitivityLevel: 'medium',
      reason: 'profile_update',
      action: 'data_modified',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    })

    return NextResponse.json({
      success: true,
      data: updatedProfile
    })

  } catch (error) {
    console.error('Error updating individual profile:', error)

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/individuals/:userId
 * Delete individual account (requiere ser el owner)
 */
export async function DELETE(request, { params }) {
  try {
    // Verificar autenticación
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    const { userId } = await params
    const requestorId = session.user.id
    const requestorType = session.user.type

    // Solo el owner puede eliminar su perfil
    if (requestorType !== 'individual' || requestorId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own account' },
        { status: 403 }
      )
    }

    // Check if profile exists
    const existing = await getIndividualProfile(userId)
    if (!existing) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Soft delete (anonymize data, keep audit trail)
    await deleteUserAccount(userId)

    // Audit log
    await logDataAccess({
      accessedBy: requestorId,
      targetUser: userId,
      dataAccessed: ['all'],
      dataType: 'Profile',
      sensitivityLevel: 'high',
      reason: 'account_deletion',
      action: 'data_deleted',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    })

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully. Audit logs retained for compliance.'
    })

  } catch (error) {
    console.error('Error deleting individual account:', error)

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
