'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import * as ChannelService from '@channel.io/channel-web-sdk-loader'

let booted = false

/**
 * 채널톡 버튼. 플러그인 키는 채널 데스크
 * (Channel settings > General > Manage Plug-in > Install plug-in)에서 복사해
 * NEXT_PUBLIC_CHANNEL_PLUGIN_KEY로 넣는다. 키가 없으면 조용히 미노출.
 */
export function ChannelTalkBoot() {
  const pathname = usePathname()
  const pluginKey = process.env.NEXT_PUBLIC_CHANNEL_PLUGIN_KEY

  useEffect(() => {
    if (!pluginKey || booted) return
    booted = true
    ChannelService.loadScript()
    ChannelService.boot({ pluginKey })
  }, [pluginKey])

  useEffect(() => {
    if (!pluginKey || !booted) return
    if (pathname.startsWith('/admin')) {
      ChannelService.hideChannelButton()
    } else {
      ChannelService.showChannelButton()
    }
  }, [pluginKey, pathname])

  return null
}
