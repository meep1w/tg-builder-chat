// widget-src/components/display/Interface.tsx
const { Frame, Text } = figma.widget
import { Background, BottomBar, Header, TopActions } from "@/components/ui"
import { DIMENSIONS, USERNAMES, PROFILE_IMAGES } from "@/constants"
import { useDynamicState } from "@/hooks"
import { useSyncedState } from "@figma/widget" // доступно и как figma.widget.useSyncedState

interface InterfaceProps extends ReqCompProps, OptionalRender, Partial<FrameProps> {
  viewport: number
  chatId: number
  wallpaperHash?: string | null
  wallpaperSrc?: string | null
  avatarHash?: string | null
  avatarSrc?: string | null
}

export function Interface({
  children,
  chatId,
  viewport,
  renderElements,
  theme,
  wallpaperHash,
  wallpaperSrc,
  avatarHash,
  avatarSrc,
  ...props
}: InterfaceProps) {
  const [recipient, setRecipient] = useDynamicState({
    username: USERNAMES[chatId],
    image: PROFILE_IMAGES[chatId],
  })

  // Заголовок/статус из панели
  const [headerUsername] = figma.widget.useSyncedState<string>("headerUsername", "Random User")
  const [headerLastSeen] = figma.widget.useSyncedState<string>("headerLastSeen", "last seen just now")
  const [statusTime]     = figma.widget.useSyncedState<string>("statusTime", "9:41")

  // Геометрия
  const TOP_BASE = 89
  const BOTTOM_BAR_H = 80
  const FEED_TOP = TOP_BASE
  const W = DIMENSIONS[viewport].width
  const H = DIMENSIONS[viewport].height
  const WALLPAPER_H = H - TOP_BASE // фон тянется от хедера до низа

  return !renderElements ? (
    children
  ) : (
    <Frame
      name="Interface"
      x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
      y={{ type: "top-bottom", topOffset: 0, bottomOffset: 0 }}
      fill="#000000"
      width={W}
      height={H}
      {...props}
    >
      {/* Wallpaper под хедером */}
      <Background
        theme={theme}
        name="chat-bg/latest"
        x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
        y={{ type: "top", offset: TOP_BASE }}
        width={W}
        height={WALLPAPER_H}
        wallpaperHash={wallpaperHash ?? null}
        wallpaperSrc={wallpaperSrc ?? null}
      />

      {/* Viewport ленты: снизу оставляем зазор под бар */}
      <Frame
        name="Viewport Overflow Track"
        overflow="scroll"
        x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
        y={{ type: "top-bottom", topOffset: FEED_TOP, bottomOffset: BOTTOM_BAR_H }}
        width={W}
        height={Math.max(0, H - FEED_TOP - BOTTOM_BAR_H)}
      >
        {children}
      </Frame>

      {/* BottomBar — отрисован ПОСЛЕ Viewport => выше по слою, перекрывает ленту */}
      <BottomBar
        theme={theme}
        name="ChatInput"
        x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
        y={{ type: "bottom", offset: 0 }}
        width={W}
        height={BOTTOM_BAR_H}
      />

      {/* Actions поверх обоев (под хедером) */}
      <TopActions
        name="TopActions"
        x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
        y={{ type: "top", offset: TOP_BASE }}
        width={W}
      />

      {/* Header над всем */}
      <Header
        theme={theme}
        name="Header"
        profilePicHash={avatarHash ?? null}
        profilePicSrc={avatarSrc ?? recipient.image}
        onEvent={(e) => setRecipient("username", e.characters)}
        value={headerUsername || recipient.username}
        subtitle={headerLastSeen}
        x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
        width={W}
      />
    </Frame>
  )
}
