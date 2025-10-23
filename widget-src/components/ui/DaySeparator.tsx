// widget-src/components/ui/DaySeparator.tsx
const { AutoLayout, Text } = figma.widget

interface DaySeparatorProps extends Partial<AutoLayoutProps> {
  label: string
}

export function DaySeparator({ label, name = "DaySeparator", ...props }: DaySeparatorProps) {
  const BG = "#3C3C3E"               // оттенок как в TG
  const TEXT = "#FFFFFF"
  return (
    <AutoLayout
      name={name}
      horizontalAlignItems="center"
      verticalAlignItems="center"
      padding={{ vertical: 2, horizontal: 7 }}
      cornerRadius={14}
      fill={BG}
      {...props}
    >
      <Text fontSize={13} fontWeight={600} fill={TEXT}>
        {label}
      </Text>
    </AutoLayout>
  )
}
