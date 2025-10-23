// widget-src/components/display/Interface.tsx
const { Frame } = figma.widget
import { Background, BottomBar, Header, TopActions } from "@/components/ui"
import { DIMENSIONS, USERNAMES, PROFILE_IMAGES } from "@/constants"
import { useDynamicState } from "@/hooks"
import useWidgetMenu from "@/hooks/useWidgetMenu"

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

  const { showHeaderActions } = useWidgetMenu({ attachPropertyMenu: false })

  const TOP_BASE = 89
  const ACTIONS_H = 41
  const FEED_TOP = TOP_BASE + (showHeaderActions ? ACTIONS_H : 0)

  return !renderElements ? (
    children
  ) : (
    <Frame
      name="Interface"
      x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
      y={{ type: "top-bottom", topOffset: 0, bottomOffset: 0 }}
      fill="#151515"
      width={DIMENSIONS[viewport].width}
      height={DIMENSIONS[viewport].height}
      {...props}
    >
      {/* Wallpaper */}
      <Background
        theme={theme}
        name="chat-bg/latest"
        x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
        y={{ type: "top-bottom", topOffset: TOP_BASE, bottomOffset: 80 }}
        width={390}
        height={675}
        wallpaperHash={wallpaperHash ?? null}
        wallpaperSrc={wallpaperSrc ?? null}
      />

      {/* Input */}
      <BottomBar
        theme={theme}
        name="ChatInput"
        x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
        y={{ type: "bottom", offset: 0 }}
        width={390}
      />

      {/* Scroll feed (children draw themselves) */}
      <Frame
        name="Viewport Overflow Track"
        overflow="scroll"
        x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
        y={{ type: "top-bottom", topOffset: FEED_TOP, bottomOffset: 80 }}
        width={390}
        height={675}
      >
        {children}
      </Frame>

      {/* Actions bar */}
      {showHeaderActions && (
        <TopActions
          name="TopActions"
          x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
          y={{ type: "top", offset: TOP_BASE }}
          width={390}
        />
      )}

      {/* Header */}
      <Header
        theme={theme}
        name="Header"
        profilePicHash={avatarHash ?? null}
        profilePicSrc={avatarSrc ?? recipient.image}
        onEvent={(e) => setRecipient("username", e.characters)}
        value={recipient.username}
        x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
        width={390}
      />
    </Frame>
  )
}
