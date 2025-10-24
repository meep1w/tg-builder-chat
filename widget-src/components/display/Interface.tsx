// widget-src/components/display/Interface.tsx
const { Frame, Text } = figma.widget
import { Background, BottomBar, Header, TopActions } from "@/components/ui"
import { DIMENSIONS, USERNAMES, PROFILE_IMAGES } from "@/constants"
import { useDynamicState } from "@/hooks"
import { useSyncedState } from "@figma/widget" // типовой импорт доступен как figma.widget.useSyncedState тоже

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

  // НОВОЕ: читаем значения из правой панели
  const [headerUsername] = figma.widget.useSyncedState<string>("headerUsername", "Random User")
  const [headerLastSeen] = figma.widget.useSyncedState<string>("headerLastSeen", "last seen just now")
  const [statusTime]     = figma.widget.useSyncedState<string>("statusTime", "9:41")

  const TOP_BASE = 89
  const BOTTOM_BAR_H = 80
  const FEED_TOP = TOP_BASE
  const WALLPAPER_H = 700  // фикс высота обоев

  return !renderElements ? (
    children
  ) : (
    <Frame
      name="Interface"
      x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
      y={{ type: "top-bottom", topOffset: 0, bottomOffset: 0 }}
      fill="#00000"
      width={DIMENSIONS[viewport].width}
      height={DIMENSIONS[viewport].height}
      {...props}
    >
      {/* Wallpaper: фиксированная высота 700, прибито к верху под хедером */}
      <Background
        theme={theme}
        name="chat-bg/latest"
        x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
        y={{ type: "top", offset: TOP_BASE }}
        width={390}
        height={WALLPAPER_H}
        wallpaperHash={wallpaperHash ?? null}
        wallpaperSrc={wallpaperSrc ?? null}
      />

      {/* Внизу: стеклянный бар поверх обоев */}
      <BottomBar
        theme={theme}
        name="ChatInput"
        x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
        y={{ type: "bottom", offset: 0 }}
        width={390}
      />

      {/* Лента: оставляем снизу зазор под бар = 80 */}
      <Frame
        name="Viewport Overflow Track"
        overflow="scroll"
        x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
        y={{ type: "top-bottom", topOffset: FEED_TOP, bottomOffset: BOTTOM_BAR_H }}
        width={390}
        height={675}
      >
        {children}
      </Frame>

      {/* Action bar поверх */}
      <TopActions
        name="TopActions"
        x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
        y={{ type: "top", offset: TOP_BASE }}
        width={390}
      />

      {/* Header: username + last seen из синхр. состояния */}
      <Header
        theme={theme}
        name="Header"
        profilePicHash={avatarHash ?? null}
        profilePicSrc={avatarSrc ?? recipient.image}
        onEvent={(e) => setRecipient("username", e.characters)}
        value={headerUsername || recipient.username}
        subtitle={headerLastSeen}
        x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
        width={390}
      />
    </Frame>
  )
}
