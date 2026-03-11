export type ProcessStatus =
  | 'rascunho' | 'submetido' | 'triagem' | 'em_analise'
  | 'pendente_documentacao' | 'em_vistoria' | 'aprovado_tecnico'
  | 'em_revisao_juridica' | 'aprovado_juridico' | 'aguardando_assinatura'
  | 'licenca_emitida' | 'indeferido' | 'arquivado'

export type UserRole = 'requerente' | 'analista' | 'coordenador' | 'secretario' | 'admin'

export interface Profile {
  id: string; full_name: string; cpf?: string; phone?: string
  role: UserRole; organization?: string; orcid_id?: string
  avatar_url?: string; mfa_enabled: boolean; created_at: string; updated_at: string
}

export interface Process {
  id: string; protocol: string; title: string; description?: string
  status: ProcessStatus; requester_id: string; analyst_id?: string
  coordinator_id?: string; study_area_id?: string; license_type: string
  priority: number; deadline?: string; submitted_at?: string
  decided_at?: string; created_at: string; updated_at: string
  profiles?: Profile; analyst?: Profile
}

export interface ProcessTransition {
  id: string; process_id: string; from_status?: ProcessStatus
  to_status: ProcessStatus; actor_id: string; reason?: string
  metadata: Record<string, unknown>; created_at: string; profiles?: Profile
}

export interface Document {
  id: string; process_id: string; document_type_id?: string
  uploader_id: string; filename: string; storage_path: string
  file_size_bytes?: number; mime_type?: string; checksum_sha256?: string
  version: number; is_current: boolean; reviewed_at?: string
  reviewer_id?: string; review_status?: 'pendente' | 'aprovado' | 'rejeitado'
  review_notes?: string; created_at: string
}

export interface License {
  id: string; process_id: string; license_number: string
  license_type: string; issued_at: string; valid_until: string
  conditions?: string[]; pdf_path?: string; qr_code_token: string
  integrity_hash?: string; signed_by?: string; signature_hash?: string
  revoked_at?: string; revoke_reason?: string; created_at: string
}

export interface Decision {
  id: string; process_id: string; decider_id: string
  decision_type: 'deferimento' | 'indeferimento' | 'exigencia' | 'recurso'
  justification: string; conditions: unknown[]; signed_at?: string
  signature_hash?: string; payload_hash?: string; is_final: boolean; created_at: string
}

export interface Notification {
  id: string; recipient_id: string; process_id?: string; type: string
  title: string; body?: string; read_at?: string; sent_at?: string
  channel: 'email' | 'push' | 'sms' | 'in_app'; created_at: string
}

export interface AuditLog {
  id: number; table_name: string; record_id?: string
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT'; actor_id?: string
  actor_role?: UserRole; old_data?: Record<string, unknown>
  new_data?: Record<string, unknown>; ip_address?: string
  user_agent?: string; created_at: string
}

export const STATUS_LABELS: Record<ProcessStatus, string> = {
  rascunho: 'Rascunho', submetido: 'Submetido', triagem: 'Triagem',
  em_analise: 'Em Análise', pendente_documentacao: 'Pendente Documentação',
  em_vistoria: 'Em Vistoria', aprovado_tecnico: 'Aprovado Técnico',
  em_revisao_juridica: 'Em Revisão Jurídica', aprovado_juridico: 'Aprovado Jurídico',
  aguardando_assinatura: 'Aguardando Assinatura', licenca_emitida: 'Licença Emitida',
  indeferido: 'Indeferido', arquivado: 'Arquivado',
}

export const STATUS_COLORS: Record<ProcessStatus, string> = {
  rascunho: 'bg-gray-100 text-gray-700', submetido: 'bg-blue-100 text-blue-700',
  triagem: 'bg-yellow-100 text-yellow-700', em_analise: 'bg-orange-100 text-orange-700',
  pendente_documentacao: 'bg-red-100 text-red-700', em_vistoria: 'bg-purple-100 text-purple-700',
  aprovado_tecnico: 'bg-teal-100 text-teal-700', em_revisao_juridica: 'bg-indigo-100 text-indigo-700',
  aprovado_juridico: 'bg-cyan-100 text-cyan-700', aguardando_assinatura: 'bg-amber-100 text-amber-700',
  licenca_emitida: 'bg-green-100 text-green-700', indeferido: 'bg-red-200 text-red-800',
  arquivado: 'bg-gray-200 text-gray-600',
}