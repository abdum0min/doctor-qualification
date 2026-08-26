import { ENDPOINTS, http } from '@/shared/api'

export interface UploadedFile {
  url: string
}

export const uploadsApi = {
  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('file', file)

    return http.upload<UploadedFile>(ENDPOINTS.uploads.avatar, form)
  },
  removeAvatar: () => http.delete<null>(ENDPOINTS.uploads.avatar),
}
