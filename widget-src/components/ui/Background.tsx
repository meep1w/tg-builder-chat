// Dependencies
const { Frame, Rectangle, Image } = figma.widget

interface BackgroundProps extends ReqCompProps, Partial<FrameProps> {
  /** imageHash из vault */
  wallpaperHash?: string | null
  /** dataURL/base64 как фолбэк */
  wallpaperSrc?: string | null
}

function isValidImageHash(h?: string | null): boolean {
  if (!h || typeof h !== "string" || !h.trim()) return false
  try {
    // бросит исключение, если хэш неизвестен среде виджета
    figma.getImageByHash(h)
    return true
  } catch {
    return false
  }
}

export function Background({
  wallpaperHash = null,
  wallpaperSrc = null,
  theme,
  width,
  height,
  ...props
}: BackgroundProps) {
  // только числовые размеры — без fill-parent
  const W = (width as number) ?? 390
  const H = (height as number) ?? 675

  const hashOK = isValidImageHash(wallpaperHash)
  const srcOK = typeof wallpaperSrc === "string" && /^data:image\/[a-z+]+;base64,/i.test(wallpaperSrc)

  // простая подложка строкой — валидатор это любит
  const fallbackColor = theme === "dark" ? "#0F0F10" : "#F7F7F7"

  return (
    <Frame name="Background" overflow="hidden" width={W} height={H} {...props}>
      {hashOK ? (
        <Rectangle
          name="bg/hash"
          x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
          y={{ type: "top-bottom", topOffset: 0, bottomOffset: 0 }}
          width={W}
          height={H}
          fill={{ type: "image", imageHash: wallpaperHash!, scaleMode: "FILL" }}
        />
      ) : srcOK ? (
        <Image
          name="bg/src"
          x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
          y={{ type: "top-bottom", topOffset: 0, bottomOffset: 0 }}
          width={W}
          height={H}
          src={wallpaperSrc!}
        />
      ) : (
        <Rectangle
          name="bg/fallback"
          x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
          y={{ type: "top-bottom", topOffset: 0, bottomOffset: 0 }}
          width={W}
          height={H}
          fill={fallbackColor}
        />
      )}
    </Frame>
  )
}
