// widget-src/components/ui/TopActions.tsx
const { AutoLayout, Text, Rectangle, SVG } = figma.widget

interface TopActionsProps extends ReqCompProps, Partial<AutoLayoutProps> {}

export function TopActions({ name = "TopActions", width = 390, ...props }: TopActionsProps) {
  const BG = "#1C1C1D"
  const BORDER = { r: 0xA2/255, g: 0xA2/255, b: 0xA2/255, a: 0.2 }
  const RED = "#FF000B"
  const BLUE = "#3CA6FC"

  return (
    <AutoLayout
      name={name}
      width={width}
      height={41}
      direction="horizontal"
      padding={{ left: 87, right: 12.48 }}
      spacing={0}
      verticalAlignItems="center"
      fill={BG}
      {...props}
    >
      {/* top stroke */}
      <Rectangle
        name="TopBorder"
        positioning="absolute"
        x={{ type: "left-right", leftOffset: 0, rightOffset: 0 }}
        y={{ type: "top", offset: 0 }}
        width="fill-parent"
        height={0.2}
        fill={BORDER}
      />

      {/* только тут двигаем — gap=52 */}
      <AutoLayout name="Links" spacing={52} verticalAlignItems="center">
        <Text name="Block User" fontSize={15} fontWeight={400} fill={RED}>
          Block User
        </Text>
        <Text name="Add to Contacts" fontSize={15} fontWeight={400} fill={BLUE}>
          Add to Contacts
        </Text>
      </AutoLayout>

      {/* крестик остаётся прижат к правому паддингу */}
      <AutoLayout name="spacer" width="fill-parent" />

      <SVG
        name="CloseIcon"
        src={`<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.52 19.04C4.256 19.04 0 14.784 0 9.52C0 4.256 4.256 0 9.52 0C14.784 0 19.04 4.256 19.04 9.52C19.04 14.784 14.784 19.04 9.52 19.04ZM9.52 1.12C4.872 1.12 1.12 4.872 1.12 9.52C1.12 14.168 4.872 17.92 9.52 17.92C14.168 17.92 17.92 14.168 17.92 9.52C17.92 4.872 14.168 1.12 9.52 1.12Z" fill="#3598FD"/>
<path d="M13.2023 5.04539C13.4211 4.82659 13.7758 4.82664 13.9945 5.04552C14.2131 5.26427 14.2131 5.6188 13.9944 5.83748L5.83742 13.9944C5.61876 14.2131 5.26424 14.2131 5.04557 13.9944C4.82691 13.7758 4.82691 13.4213 5.04556 13.2026L13.2023 5.04539Z" fill="#3598FD"/>
<path d="M5.04544 5.04551C5.26415 4.82664 5.61891 4.82658 5.8377 5.04537L13.9944 13.2021C14.2131 13.4207 14.2131 13.7753 13.9945 13.994C13.7758 14.2129 13.4211 14.213 13.2023 13.9942L5.04558 5.83749C4.8269 5.61881 4.82683 5.26427 5.04544 5.04551Z" fill="#3598FD"/>
</svg>`}
      />
    </AutoLayout>
  )
}
