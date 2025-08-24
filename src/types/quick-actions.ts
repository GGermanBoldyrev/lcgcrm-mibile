export interface QuickActionSecondary {
  icon?: string
  label?: string
  color?: string
  to?: object | string
}

export interface QuickAction {
  label?: string
  icon?: string
  color?: string
  to?: object | string
  secondaryCard?: QuickActionSecondary
}
