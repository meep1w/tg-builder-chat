// widget-src/components/ui/DaySeparator.tsx
const { AutoLayout, Text } = figma.widget

interface DaySeparatorProps extends Partial<AutoLayoutProps> {
  label: string
}

export function DaySeparator({ label, name = "DaySeparator", ...props }: DaySeparatorProps) {
  // Матовый тон: #212121 @ 54%
  const TINT = { r: 0x21 / 255, g: 0x21 / 255, b: 0x21 / 255, a: 0.54 }
  const TEXT = "#FFFFFF"

  return (
    <AutoLayout
      name={name}
      horizontalAlignItems="center"
      verticalAlignItems="center"
      padding={{ vertical: 2, horizontal: 8 }}
      cornerRadius={14}
      fill={TINT}
      // Тот же блюр, что на NewUserCard
      effect={{ type: "background-blur", blur: 60 }}
      {...props}
    >
      <Text fontSize={12} fontWeight={600} fill={TEXT}>
        {label}
      </Text>
    </AutoLayout>
  )
}
