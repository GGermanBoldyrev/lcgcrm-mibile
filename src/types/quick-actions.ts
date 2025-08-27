export interface QuickActionSecondary {
  icon?: string
  label?: string
  color?: string
  to?: object | string
  onClick?: () => void | Promise<void>
}

export interface QuickAction {
  label?: string
  icon?: string
  color?: string
  to?: object | string
  secondaryCard?: QuickActionSecondary
}
