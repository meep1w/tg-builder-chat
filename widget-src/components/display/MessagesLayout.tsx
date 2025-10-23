// widget-src/components/display/MessagesLayout.tsx

// Dependencies
const { AutoLayout } = figma.widget
// Components
import { DirectionContainer, WithButtons } from "@/components/display/atoms"
import { Message } from "@/components/ui"
import { NewUserCard } from "@/components/ui/NewUserCard"
import useWidgetMenu from "@/hooks/useWidgetMenu"

interface MessagesLayoutProps extends Partial<AutoLayoutProps>, ReqCompProps, OptionalRender {
  messages?: (Message[] | undefined)[]
}

/** Arranges messages (In/Out). NewUserCard — первый элемент ленты. */
export function MessagesLayout({ messages, renderElements, children, theme, ...props }: MessagesLayoutProps) {
  // Last-message mode
  const lastMessageSide = messages?.[messages.length - 1]
  const lastMessage = lastMessageSide?.[lastMessageSide.length - 1]

  // Controls
  const { showNewUserCard, profileName, profileCountry, profileReg } = useWidgetMenu({ attachPropertyMenu: false })

  // Gaps как в ТГ
  const GAP_BELOW_ACTIONS = 34
  const GAP_BELOW_CARD = 16

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

  return (
    <AutoLayout
      name="Container Layout"
      x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
      y={{ type: "bottom", offset: 0 }}
      overflow="visible"
      direction="vertical"
      spacing={24}
      padding={{ vertical: 16, horizontal: 8 }}
      width={390}
      verticalAlignItems="end"
      horizontalAlignItems="center"
      {...props}
    >
      {/* Карточка нового пользователя — по центру */}
      {showNewUserCard && (
        <AutoLayout
          name="NewUserIntro"
          direction="vertical"
          width="fill-parent"
          horizontalAlignItems="center"         // ← центрируем
          padding={{ top: GAP_BELOW_ACTIONS, bottom: GAP_BELOW_CARD }}
        >
          <NewUserCard
            username={profileName}
            country={profileCountry}
            registration={profileReg}
          />
        </AutoLayout>
      )}

      {/* Сообщения */}
      {messages?.map(
        (dirMsg, key) =>
          dirMsg && (
            <DirectionContainer key={key} dir={dirMsg[0].dir}>
              {dirMsg.map((msg, i) => (
                <WithButtons key={i} buttons={msg.buttons} theme={theme}>
                  <Message {...msg} theme={theme} />
                </WithButtons>
              ))}
            </DirectionContainer>
          ),
      )}
      {children}
    </AutoLayout>
  )
}
