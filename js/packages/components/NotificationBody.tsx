import React, { useEffect } from 'react'
import { Vibration } from 'react-native'
import GestureRecognizer from 'react-native-swipe-gestures'
import { SafeAreaContext } from 'react-native-safe-area-context'

import { berty } from '@berty-tech/api/index.pb'
import { messenger as messengerpb } from '@berty-tech/api/index.js'
import { useStyles } from '@berty-tech/styles'
import { usePersistentOptions, useMsgrContext } from '@berty-tech/store/hooks'
import { NotificationsInhibitor } from '@berty-tech/store/context'

import { usePrevious } from './hooks'
import notifications, { DefaultNotification } from './notifications'
import { playSound, SoundKey } from './sounds'

const NotificationContents: React.FC<{
	additionalProps: { type: berty.messenger.v1.StreamEvent.Notified.Type }
}> = (props) => {
	const NotificationComponent = notifications[props?.additionalProps?.type]
	if (NotificationComponent) {
		return <NotificationComponent {...props} />
	}
	return <DefaultNotification {...props} />
}

const NotificationBody: React.FC<any> = (props) => {
	const [{ border, flex, column, background }] = useStyles()

	return (
		<SafeAreaContext.Consumer>
			{(insets) => (
				<GestureRecognizer
					onSwipe={(gestureName) => {
						if (gestureName === 'SWIPE_UP' && typeof props.onClose === 'function') {
							props.onClose()
						}
					}}
					style={[
						border.shadow.big,
						flex.tiny,
						flex.justify.center,
						column.item.center,
						background.white,
						{
							position: 'absolute',
							marginTop: insets?.top || 0,
							width: '90%',
							borderRadius: 15,
						},
					]}
				>
					<NotificationContents {...props} />
				</GestureRecognizer>
			)}
		</SafeAreaContext.Consumer>
	)
}

const T = messengerpb.StreamEvent.Notified.Type

const notifsSounds: { [key: number]: SoundKey } = {
	[T.TypeContactRequestReceived]: 'contactRequestReceived',
	[T.TypeMessageReceived]: 'messageReceived',
	[T.TypeContactRequestSent]: 'contactRequestSent',
}

const GatedNotificationBody: React.FC<any> = (props) => {
	const prevProps = usePrevious(props)
	const justOpened = props.isOpen && !prevProps?.isOpen

	const ctx = useMsgrContext()
	const persistentOptions = usePersistentOptions()

	const notif = props.additionalProps as berty.messenger.v1.StreamEvent.INotified | undefined

	const isValid = notif && props.isOpen && persistentOptions?.notifications?.enable

	const inhibit = isValid
		? ctx.notificationsInhibitors.reduce<ReturnType<NotificationsInhibitor>>((r, inh) => {
				if (r === false) {
					return inh(ctx, notif as any)
				}
				return r
		  }, false)
		: true

	const notifType = notif?.type || 0

	useEffect(() => {
		const sound: SoundKey | undefined = notifsSounds[notifType]
		if (justOpened && sound && (!inhibit || inhibit === 'sound-only')) {
			Vibration.vibrate(400)
			playSound(sound)
		}
	}, [notifType, justOpened, inhibit])

	if (!isValid || inhibit) {
		if (props.isOpen) {
			props.onClose()
		}
		return null
	}

	return <NotificationBody {...props} />
}

export default GatedNotificationBody
