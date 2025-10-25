// Dependencies
const { AutoLayout, useSyncedState } = figma.widget
// Components
import { DirectionContainer, WithButtons } from "@/components/display/atoms"
import { Message } from "@/components/ui"
import { DaySeparator } from "@/components/ui/DaySeparator"
import { NewUserCard } from "@/components/ui/NewUserCard"

type DayDivider = { label: string } & ({ kind: "day" } | { type: "day" })

interface MessagesLayoutProps extends Partial<AutoLayoutProps>, ReqCompProps, OptionalRender {
  messages?: (Message[] | DayDivider | undefined)[]
}

/** Arranges messages (In/Out). Supports inline day dividers and the NewUserCard at the top. */
export function MessagesLayout({ messages, renderElements, children, theme, ...props }: MessagesLayoutProps) {
  const lastSide = messages?.filter(Boolean).slice(-1)[0]
  const lastMessage = Array.isArray(lastSide) ? lastSide[lastSide.length - 1] : undefined

  const [showNewUserCard] = useSyncedState<boolean>("showNewUserCard", true)
  const [profileName] = useSyncedState<string>("profileName", "Random User")
  const [profileCountry] = useSyncedState<string>("profileCountry", "🇳🇬 Nigeria")
  const [profileReg] = useSyncedState<string>("profileReg", "January 2024")

  if (!renderElements) {
    return lastMessage ? (
      <AutoLayout direction="vertical" spacing={28}>
        <WithButtons buttons={lastMessage.buttons} theme={theme}>
          <Message {...lastMessage} theme={theme} />
        </WithButtons>
        {children}
      </AutoLayout>
    ) : (
      <>{children}</>
    )
  }

  // Межгрупповой зазор
  const GROUP_GAP = 10
  const GAP_BELOW_ACTIONS = 34
  const GAP_BELOW_CARD = 16

  // Считаем общее количество OUT для нормализации тона
  const totalOut = (messages || []).reduce((acc, entry) => (Array.isArray(entry) ? acc + entry.filter(m => m?.dir === 1).length : acc), 0)
  let seenOut = 0

  return (
    <AutoLayout
      name="Container Layout"
      x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
      y={{ type: "bottom", offset: 0 }}
      overflow="visible"
      direction="vertical"
      spacing={GROUP_GAP}
      padding={{ vertical: 16, horizontal: 8 }}
      width={390}
      verticalAlignItems="end"
      horizontalAlignItems="center"
      {...props}
    >
      {showNewUserCard && (
        <AutoLayout name="NewUserIntro" direction="vertical" width="fill-parent" horizontalAlignItems="center" padding={{ top: GAP_BELOW_ACTIONS, bottom: GAP_BELOW_CARD }}>
          <NewUserCard username={profileName} country={profileCountry} registration={profileReg} />
        </AutoLayout>
      )}

      {messages?.map((entry, key) => {
        // Day divider
        if (entry && typeof entry === "object" && !Array.isArray(entry) && (entry as any).label) {
          const isDay = (entry as any).kind === "day" || (entry as any).type === "day"
          if (isDay) {
            const d = entry as DayDivider
            return (
              <AutoLayout key={`day-${key}`} width="fill-parent" horizontalAlignItems="center" verticalAlignItems="center">
                <DaySeparator label={d.label} />
              </AutoLayout>
            )
          }
        }

        const dirMsg = entry as Message[] | undefined
        if (!dirMsg) return null

        return (
          <DirectionContainer key={key} dir={dirMsg[0].dir}>
            {dirMsg.map((msg, i) => {
              // Тон только для OUT
              const tone = msg.dir === 1 && totalOut > 0 ? (seenOut++ , Math.min(seenOut - 1, totalOut - 1) / Math.max(totalOut - 1, 1)) : undefined
              return (
                <WithButtons key={i} buttons={msg.buttons} theme={theme}>
                  {/* прокидываем tone — компонент его понимает */}
                  <Message {...msg} theme={theme} tone={tone as any} />
                </WithButtons>
              )
            })}
          </DirectionContainer>
        )
      })}

      {children}
    </AutoLayout>
  )
}
