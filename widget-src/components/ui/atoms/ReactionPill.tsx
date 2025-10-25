const { AutoLayout, Text, Image } = figma.widget

interface ReactionPillProps extends ReqCompProps {
  dir: 0 | 1
  emoji: string
  avatarSrc?: string
}

/** Белая пилюля реакции: emoji + мини-аватар. Без времени/галочек. */
export function ReactionPill({ emoji, avatarSrc }: ReactionPillProps) {
  return (
    <AutoLayout
      name="ReactionPill"
      fill="#FFFFFF"
      cornerRadius={18}
      padding={{ vertical: 6, horizontal: 12 }}
      spacing={8}
      verticalAlignItems="center"
      effect={{ type: "drop-shadow", color: "#0000001A", offset: { x: 0, y: 1 }, blur: 2, showShadowBehindNode: false }}
    >
      <Text fontSize={18} lineHeight={22} fill="#000000">{emoji || "❤️"}</Text>
      {avatarSrc ? <Image width={20} height={20} cornerRadius={10} src={avatarSrc} /> : null}
    </AutoLayout>
  )
}
