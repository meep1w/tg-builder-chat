// widget-src/components/ui/NewUserCard.tsx
const { AutoLayout, Text, SVG } = figma.widget

interface NewUserCardProps extends Partial<AutoLayoutProps> {
  username: string
  country: string      // например: "🇳🇬 Nigeria" или просто "Nigeria"
  registration: string // например: "January 2024"
}

// Выделяем флаг (две Regional Indicator буквы) в начале строки
function splitFlagAndLabel(input: string): { flag: string; label: string } {
  const codePoints = Array.from(input) // корректно по графемам
  const isRI = (ch: string) => {
    const cp = ch.codePointAt(0)!
    return cp >= 0x1F1E6 && cp <= 0x1F1FF
  }
  if (codePoints.length >= 2 && isRI(codePoints[0]) && isRI(codePoints[1])) {
    const flag = codePoints[0] + codePoints[1]
    const rest = input.slice(flag.length).trimStart()
    return { flag, label: rest }
  }
  return { flag: "", label: input.trim() }
}

export function NewUserCard({
  username,
  country,
  registration,
  name = "NewUserCard",
  ...props
}: NewUserCardProps) {
  // Матовость: фон #212121 @54% + сильный background-blur
  const CARD_BG = { r: 0x21 / 255, g: 0x21 / 255, b: 0x21 / 255, a: 0.54 }
  const WHITE   = "#FFFFFF"
  const MUTED   = "#B1B8C2"

  const { flag, label } = splitFlagAndLabel(country)
  const FLAG_SIZE = 16 // флаг «чуть больше» основного текста (12)

  return (
    <AutoLayout
      name={name}
      width={225}
      height={160}
      direction="vertical"
      fill={CARD_BG}
      cornerRadius={16}
      padding={{ left: 16, right: 16, top: 18, bottom: 16 }}
      spacing={8}
      // Figma Widgets: только единый background-blur → ставим близко к твоему скрину
      effect={{ type: "background-blur", blur: 60 }}
      {...props}
    >
      {/* Заголовок и статус — по центру */}
      <AutoLayout
        name="header"
        width="fill-parent"
        verticalAlignItems="center"
        horizontalAlignItems="center"
        direction="vertical"
        spacing={4}
      >
        <Text name="username" fill={WHITE} fontSize={15} fontWeight={500}>
          {username}
        </Text>
        <Text name="contact-status" fill={MUTED} fontSize={12} fontWeight={400}>
          Not a contact
        </Text>
      </AutoLayout>

      {/* Инфо-блоки */}
      <AutoLayout
        name="info"
        direction="vertical"
        width="fill-parent"
        spacing={6}
        padding={{ top: 8, bottom: 2 }}
      >
        {/* Phone Number */}
        <AutoLayout
          name="row-phone"
          direction="horizontal"
          width="fill-parent"
          spacing={8}
          verticalAlignItems="center"
        >
          <AutoLayout width={90} horizontalAlignItems="end">
            <Text fill={MUTED} fontSize={12} fontWeight={400}>
              Phone Number
            </Text>
          </AutoLayout>

          {/* флаг + страна слева */}
          <AutoLayout width="fill-parent" horizontalAlignItems="start" spacing={6} verticalAlignItems="center">
            {flag && (
              <Text fontSize={FLAG_SIZE} fontWeight={600}>
                {flag}
              </Text>
            )}
            <Text fill={WHITE} fontSize={12} fontWeight={500}>
              {label}
            </Text>
          </AutoLayout>
        </AutoLayout>

        {/* Registration */}
        <AutoLayout name="row-reg" direction="horizontal" width="fill-parent" spacing={8}>
          <AutoLayout width={90} horizontalAlignItems="end">
            <Text fill={MUTED} fontSize={12} fontWeight={400}>
              Registration
            </Text>
          </AutoLayout>
          <AutoLayout width="fill-parent" horizontalAlignItems="start">
            <Text fill={WHITE} fontSize={12} fontWeight={500}>
              {registration}
            </Text>
          </AutoLayout>
        </AutoLayout>
      </AutoLayout>

      {/* Not an official account — по центру */}
      <AutoLayout
        name="not-official"
        direction="horizontal"
        width="fill-parent"
        spacing={8}
        verticalAlignItems="center"
        horizontalAlignItems="center"
        padding={{ top: 6 }}
      >
        <SVG
          name="info-icon"
          src={`<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.5 0C6.01664 0 4.56659 0.434454 3.33323 1.24842C2.09986 2.06239 1.13856 3.21931 0.570907 4.57289C0.00324963 5.92647 -0.145275 7.41591 0.144114 8.85286C0.433503 10.2898 1.14781 11.6097 2.1967 12.6457C3.2456 13.6817 4.58197 14.3872 6.03683 14.6731C7.49168 14.9589 8.99968 14.8122 10.3701 14.2515C11.7406 13.6908 12.9119 12.7414 13.736 11.5232C14.5601 10.305 15 8.8728 15 7.40769C15 6.4349 14.806 5.47163 14.4291 4.57289C14.0522 3.67415 13.4997 2.85753 12.8033 2.16966C12.1069 1.4818 11.2801 0.936149 10.3701 0.563877C9.46019 0.191606 8.48492 0 7.5 0ZM7.5 11.1115C7.35167 11.1115 7.20666 11.0681 7.08332 10.9867C6.95999 10.9053 6.86386 10.7896 6.80709 10.6543C6.75033 10.5189 6.73547 10.3699 6.76441 10.2263C6.79335 10.0826 6.86478 9.95057 6.96967 9.84697C7.07456 9.74337 7.2082 9.67282 7.35368 9.64424C7.49917 9.61565 7.64997 9.63032 7.78702 9.68639C7.92406 9.74246 8.04119 9.8374 8.1236 9.95922C8.20602 10.081 8.25 10.2243 8.25 10.3708C8.25 10.5672 8.17098 10.7557 8.03033 10.8946C7.88968 11.0335 7.69891 11.1115 7.5 11.1115ZM8.25 8.14846C8.25 8.34493 8.17098 8.53334 8.03033 8.67227C7.88968 8.81119 7.69891 8.88923 7.5 8.88923C7.30109 8.88923 7.11032 8.81119 6.96967 8.67227C6.82902 8.53334 6.75 8.34493 6.75 8.14846V4.44462C6.75 4.24815 6.82902 4.05973 6.96967 3.92081C7.11032 3.78189 7.30109 3.70385 7.5 3.70385C7.69891 3.70385 7.88968 3.78189 8.03033 3.92081C8.17098 4.05973 8.25 4.24815 8.25 4.44462V8.14846Z" fill="#B1B8C2"/>
</svg>`}
        />
        <Text fill={MUTED} fontSize={13} fontWeight={400}>
          Not an official account
        </Text>
      </AutoLayout>
    </AutoLayout>
  )
}
