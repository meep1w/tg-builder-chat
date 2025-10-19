// Dependencies
const { Frame, Image, Rectangle } = figma.widget
import { PROFILE_IMAGES } from "@/constants"

interface ProfilePicProps extends Partial<FrameProps> {
  /** предпочтительно: imageHash из helper-плагина */
  profilePicHash?: string | null
  /** бэкап: dataURL/base64 из констант или vault */
  profilePicSrc?: string
}

// Проверяем, что hash существует и доступен виджету
function isValidImageHash(h?: string | null): boolean {
  if (!h || typeof h !== "string" || !h.trim()) return false
  try {
    // бросит исключение, если хэш неизвестен
    figma.getImageByHash(h)
    return true
  } catch {
    return false
  }
}

export function ProfilePic({
  profilePicHash = null,
  profilePicSrc = PROFILE_IMAGES[1],
  ...props
}: ProfilePicProps) {
  const size = (props.width as number) || 37
  const radius = Math.min(50, size / 2)

  const hashOK = isValidImageHash(profilePicHash)

  // Нормализация src
  const rawSrc = profilePicSrc || PROFILE_IMAGES[1]
  const isExternal = /^https?:\/\//i.test(rawSrc)
  const isDataUrl = /^data:image\/[a-z+]+;base64,/i.test(rawSrc)
  const isBareBase64 = !isExternal && !isDataUrl && /^[A-Za-z0-9+/=]+$/.test(rawSrc)
  const normalizedSrc = isBareBase64 ? `data:image/png;base64,${rawSrc}` : rawSrc

  return (
    <Frame name="ProfilePic" overflow="visible" width={size} height={size} {...props}>
      {hashOK ? (
        <Rectangle
          name="PreviewHash"
          width={size}
          height={size}
          cornerRadius={radius}
          stroke="#00000014"
          strokeWidth={1}
          fill={{ type: "image", imageHash: profilePicHash!, scaleMode: "FILL" }}
        />
      ) : isExternal ? (
        // плейсхолдер (внешние URL в виджетах нельзя)
        <Rectangle
          name="PreviewPlaceholder"
          width={size}
          height={size}
          cornerRadius={radius}
          stroke="#00000014"
          strokeWidth={1}
          fill={{ type: "solid", color: { r: 0.92, g: 0.92, b: 0.92 } }}
        />
      ) : (
        <Image
          name="Preview"
          cornerRadius={radius}
          stroke="#00000014"
          strokeWidth={1}
          width={size}
          height={size}
          src={normalizedSrc}
        />
      )}
    </Frame>
  )
}
