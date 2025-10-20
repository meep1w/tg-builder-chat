// Components
import { Message } from "@/components/ui"
import { DirectionContainer, PreviewLabel, WithButtons } from "@/components/display/atoms"

interface MessagePreviewProps extends Partial<AutoLayoutProps>, ReqCompProps {
  editorState: Message
  /** поддержка пользовательского изображения из Vault */
  msgImageHash?: string | null
  msgImageSrc?: string | null
}

/** Message from editor mode (preview labeled) */
export function MessagePreview({
  theme,
  editorState,
  msgImageHash = null,
  msgImageSrc = null,
  ...props
}: MessagePreviewProps) {
  const { dir, type, text, name, size, extension, isImg, buttons } = editorState

  // Для текстов всё как раньше
  // А если сообщение — картинка, подставляем источник из Vault
  const propsOfType = [
    {
      isImg,
      name,
      size,
      extension,
      text,
      ...(isImg && (msgImageHash || msgImageSrc)
        ? {
            // imageHash приоритетен, если нет — dataURL
            imageHash: msgImageHash ?? undefined,
            src: msgImageSrc ?? undefined,
          }
        : {}),
    },
  ]

  return (
    <DirectionContainer name="Preview Container" dir={dir} {...props}>
      <WithButtons buttons={buttons} theme={theme}>
        <PreviewLabel theme={theme} />
        <Message dir={dir} type={type} {...propsOfType[0]} theme={theme} />
      </WithButtons>
    </DirectionContainer>
  )
}
