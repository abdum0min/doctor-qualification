import { ENDPOINTS, http } from '@/shared/api'
import type {
  ExamDefaults,
  PlatformSettings,
  SettingsPayload,
} from '../model/types'

export const settingsApi = {
  find: () => http.get<PlatformSettings>(ENDPOINTS.settings.root),
  examDefaults: () => http.get<ExamDefaults>(ENDPOINTS.settings.examDefaults),
  update: (body: SettingsPayload) =>
    http.patch<PlatformSettings>(ENDPOINTS.settings.root, body),
}
