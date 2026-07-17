"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import i18nConfig from "@/i18nConfig"
import { APP_LANGUAGES } from "@/lib/i18n-languages"
import { IconCheck, IconWorld } from "@tabler/icons-react"
import { usePathname, useRouter } from "next/navigation"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "../ui/button"

interface LanguageSwitcherProps {}

export const LanguageSwitcher: FC<LanguageSwitcherProps> = ({}) => {
  const { i18n } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()

  const languages = APP_LANGUAGES.filter(language =>
    i18nConfig.locales.includes(language.code)
  )

  const currentLocale =
    languages.find(language => pathname?.startsWith(`/${language.code}`))
      ?.code || i18nConfig.defaultLocale

  const handleChange = (newLocale: string) => {
    if (newLocale === currentLocale) return

    const days = 30
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${date.toUTCString()};path=/`

    const segments = (pathname || "/").split("/")
    if (i18nConfig.locales.includes(segments[1])) {
      segments[1] = newLocale
    } else {
      segments.splice(1, 0, newLocale)
    }
    const newPath = segments.join("/") || "/"

    router.push(newPath)
    router.refresh()
  }

  return (
    <div className="fixed right-4 top-2 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Change language">
            <IconWorld size={22} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {languages.map(language => (
            <DropdownMenuItem
              key={language.code}
              className="flex items-center justify-between space-x-2"
              onClick={() => handleChange(language.code)}
            >
              <span>{language.label}</span>
              {language.code === currentLocale && <IconCheck size={16} />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
