// widget-src/components/ui/Header.tsx
const { AutoLayout, Text, Rectangle, SVG, Input, useSyncedState } = figma.widget
import { remapTokens } from "@/utils"
import { IosHeaderStatus, ProfilePic } from "@/components/ui/atoms"

interface HeaderProps extends ReqCompProps, Partial<AutoLayoutProps>, ContainsEvent<[TextEditEvent]> {
  profilePicSrc: string
  profilePicHash?: string | null
}

export function Header({ value, profilePicSrc, profilePicHash = null, onEvent, theme, ...props }: HeaderProps) {
  const reqChildProps = { theme }

  // редактируемые поля
  const [headerUsername, setHeaderUsername] = useSyncedState<string>("headerUsername", value ?? "Random User")
  const [headerLastSeen] = useSyncedState<string>("headerLastSeen", "last seen just now")

  const color = remapTokens({
    surface: { container: { dark: "#1C1C1D", light: "#F6F6F6" } },
    text: { primary: { dark: "#FFF", light: "#000" }, secondary: { dark: "#8D8D8F", light: "#8D8D8F" } },
  })[theme]

  // Матовое стекло (как согласовали): #262628 @ 80% + blur
  const GLASS_FILL = { r: 0x26 / 255, g: 0x26 / 255, b: 0x28 / 255, a: 0.85 }
  const BLUR_EFFECT: Effect = { type: "background-blur", blur: 16 }

  // «Stroke только снизу»: эмулируем отдельным 0.2px прямоугольником внутри хедера
  const BOTTOM_STROKE = { r: 0xEA / 255, g: 0xEA / 255, b: 0xEA / 255, a: 0.14 } // #EAEAEA @ 14%
  const HEADER_H = 89
  const LINE_H = 0.2

  const svgPaths = {
    arrowLeft: `<svg width='12' height='21' viewBox='0 0 12 21' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M3.60206 10.5L11.4062 2.55085C11.9866 1.9597 11.9778 1.00999 11.3867 0.429623C10.7955 -0.150747 9.84583 -0.142006 9.26546 0.449147L0.429623 9.44915C-0.143208 10.0326 -0.143208 10.9674 0.429623 11.5509L9.26546 20.5509C9.84583 21.142 10.7955 21.1507 11.3867 20.5704C11.9778 19.99 11.9866 19.0403 11.4062 18.4491L3.60206 10.5Z' fill='${color.text.primary}'/>
    </svg>`,
  }

  return (
    <AutoLayout name="Header" direction="vertical" width={375} {...props}>
      {/* Стеклянная вуаль без внешнего бордера */}
      <Rectangle
        name="Surface/Glass"
        positioning="absolute"
        x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
        y={{ type: "top-bottom", topOffset: 0, bottomOffset: 0 }}
        width={375}
        height={HEADER_H}
        fill={GLASS_FILL}
        strokeWidth={0}
        effect={BLUR_EFFECT}
      />
      {/* Тончайший нижний Stroke (эмуляция bottom-only) */}
      <Rectangle
        name="Surface/BottomStroke"
        positioning="absolute"
        x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
        y={{ type: "bottom", offset: 0 }}     // прижат к низу хедера
        width={375}
        height={LINE_H}
        fill={BOTTOM_STROKE}
        strokeWidth={0}
      />

      {/* статус-бар (время/сигнал/вайфай/батарея) */}
      <IosHeaderStatus {...reqChildProps} width={"fill-parent"} name="_ios/HeaderStatus" />

      <AutoLayout
        name="ChatHeader"
        overflow="visible"
        spacing="auto"
        padding={{ vertical: 4, horizontal: 6 }}
        width={"fill-parent"}
        height={45}
        verticalAlignItems="center"
      >
        <AutoLayout name="Back" spacing={7} verticalAlignItems="center">
          <SVG name="Shape" height={21} width={12} src={svgPaths.arrowLeft} />
          <Text name="Chats" fill={color.text.primary} lineHeight={22} fontSize={17} letterSpacing={-0.4}>
            Chats
          </Text>
        </AutoLayout>

        <ProfilePic
          name="profile-pic/HawkMoney"
          profilePicHash={profilePicHash}
          profilePicSrc={profilePicSrc}
          strokeWidth={0.925}
          width={37}
          height={37}
        />

        <AutoLayout
          name="TitleBlock"
          x={{ type: "left-right", leftOffset: 73, rightOffset: 74 }}
          y={6}
          positioning="absolute"
          direction="vertical"
          spacing={1}
          width={228}
          horizontalAlignItems="center"
        >
          <Input
            name="username"
            placeholder="Username or Group"
            fill={color.text.primary}
            horizontalAlignText="center"
            lineHeight={18}
            fontSize={17}
            letterSpacing={-0.4}
            fontWeight={500}
            value={headerUsername}
            onTextEditEnd={(e) => {
              setHeaderUsername(e.characters)
              onEvent?.(e)
            }}
          />
          <Text name="last-seen" fill={color.text.secondary} lineHeight={15} fontSize={13} letterSpacing={-0.05}>
            {headerLastSeen}
          </Text>
        </AutoLayout>
      </AutoLayout>
    </AutoLayout>
  )
}
