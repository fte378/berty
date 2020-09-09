import React, { useState } from 'react'
import { View, ScrollView, TouchableOpacity, TextInput, Text as TextNative } from 'react-native'
import { Layout, Text, Icon, CheckBox } from 'react-native-ui-kitten'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useNavigation } from '@berty-tech/navigation'
import { useStyles } from '@berty-tech/styles'
import { useContactsList, useAccountContactSearchResults } from '@berty-tech/store/hooks'

import { FooterCreateGroup } from './CreateGroupFooter'
import { Header } from './HomeModal'
import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'

// Styles
const useStylesCreateGroup = () => {
	const [{ height, width, absolute, border, background, column }] = useStyles()
	return {
		separateBar: [border.scale(0.5), border.color.light.grey], // opacity
		memberItemDelete: [
			height(25),
			width(25),
			absolute.scale({ top: 5, right: 10 }),
			border.shadow.medium,
			border.radius.medium,
			background.white,
			absolute.top,
			column.justify,
		],
	}
}

// Type
type AddMembersItemProps = {
	separateBar?: boolean
	contact: any
	added: boolean
	onSetMember: (contact: any) => void
	onRemoveMember: (id: string) => void
}

type AddMembersProps = {
	paddingBottom?: number
	layout: number
	onSetMember: (contact: any) => void
	onRemoveMember: (id: string) => void
	members: any[]
}

const AddMembersItem: React.FC<AddMembersItemProps> = ({
	onSetMember,
	onRemoveMember,
	contact,
	added,
	separateBar = true,
}) => {
	const [{ row, margin, padding }] = useStyles()
	const _styles = useStylesCreateGroup()
	return (
		<View>
			<View style={[row.fill, padding.right.small]}>
				<View style={[row.left, row.item.justify, { flexShrink: 1 }]}>
					<ProceduralCircleAvatar seed={contact.publicKey} diffSize={30} size={80} />
					<Text numberOfLines={1} style={[margin.left.small, row.item.justify, { flexShrink: 1 }]}>
						{contact.displayName}
					</Text>
				</View>
				<View style={[row.item.justify]}>
					<CheckBox
						checked={added}
						onChange={(isChecked: any) => {
							if (isChecked) {
								onSetMember(contact)
							} else {
								onRemoveMember(contact.publicKey)
							}
						}}
					/>
				</View>
			</View>
			{separateBar && <View style={[_styles.separateBar]} />}
		</View>
	)
}

export const AddMembersHeader: React.FC<{ style?: any }> = ({ style }) => {
	const [{ padding, row, text, margin, border }] = useStyles()
	return (
		<View style={style}>
			<View
				style={[
					margin.top.small,
					row.item.justify,
					border.scale(2.5),
					border.color.light.grey,
					border.radius.scale(4),
					{
						backgroundColor: '#E8E9FC',
						width: '14%',
					},
				]}
			/>
			<View style={[padding.bottom.big, padding.top.medium]}>
				<TextNative style={[text.bold.medium, text.size.scale(27), text.color.black]}>
					Add members
				</TextNative>
			</View>
		</View>
	)
}

const AddMembers: React.FC<AddMembersProps> = ({
	onSetMember,
	onRemoveMember,
	paddingBottom,
	members,
	layout,
}) => {
	const [
		{ padding, background, row, color, height, text, margin, border },
		{ windowHeight },
	] = useStyles()
	const [searchText, setSearchText] = useState('')
	const searchContacts = useAccountContactSearchResults(searchText)
	const accountContacts = useContactsList()
	const contacts = searchText.length ? searchContacts : accountContacts

	return (
		<View>
			<View style={[padding.horizontal.large, padding.top.small, background.white]}>
				<View style={[background.light.grey, padding.small, row.left, border.radius.medium]}>
					<Icon
						name='search-outline'
						width={30}
						height={30}
						fill={color.grey}
						style={row.item.justify}
					/>
					<TextInput
						style={[text.color.grey, margin.left.small, row.item.justify]}
						placeholder={'Search'}
						onChangeText={setSearchText}
						autoCorrect={false}
					/>
				</View>
				<View style={[height(windowHeight - layout - 90)]}>
					<ScrollView
						contentContainerStyle={[
							padding.top.medium,
							paddingBottom ? padding.bottom.scale(paddingBottom) : padding.bottom.medium,
						]}
						showsVerticalScrollIndicator={false}
						bounces={false}
					>
						{contacts.map((contact, index) => (
							<AddMembersItem
								onSetMember={onSetMember}
								onRemoveMember={onRemoveMember}
								added={!!members.find((member) => member.publicKey === contact.publicKey)}
								contact={contact}
								separateBar={index < contacts.length - 1}
							/>
						))}
					</ScrollView>
				</View>
			</View>
		</View>
	)
}

const MemberItem: React.FC<{ member: any; onRemove: () => void }> = ({ member, onRemove }) => {
	const [{ padding, column, text, color, row, maxWidth }] = useStyles()
	const _styles = useStylesCreateGroup()

	return (
		<View style={[padding.horizontal.medium, maxWidth(100)]}>
			<View style={[column.top, padding.top.small]}>
				<ProceduralCircleAvatar seed={member.publicKey} diffSize={20} size={70} />
				<Text numberOfLines={1} style={[text.color.white, column.item.center, padding.top.tiny]}>
					{member.displayName}
				</Text>
			</View>
			<TouchableOpacity style={[_styles.memberItemDelete]} onPress={onRemove}>
				<Icon
					name='close-outline'
					width={20}
					height={20}
					fill={color.red}
					style={row.item.justify}
				/>
			</TouchableOpacity>
		</View>
	)
}

export const MemberList: React.FC<{
	members: any[]
	onRemoveMember: (id: string) => void
}> = ({ members, onRemoveMember }) => {
	const [{ height, padding }] = useStyles()

	return (
		<View style={[height(135)]}>
			<ScrollView
				horizontal={true}
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={[padding.left.medium]}
			>
				{members.map((member) => (
					<MemberItem member={member} onRemove={() => onRemoveMember(member.publicKey)} />
				))}
			</ScrollView>
		</View>
	)
}

export const CreateGroupHeader: React.FC<{}> = () => {
	const navigation = useNavigation()
	const [{ color, padding, margin }] = useStyles()
	return (
		<View
			style={[
				padding.medium,
				margin.bottom.small,
				{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
				},
			]}
		>
			<View
				style={[
					{
						flexDirection: 'row',
						alignItems: 'center',
					},
				]}
			>
				<TouchableOpacity
					onPress={navigation.goBack}
					style={{ alignItems: 'center', justifyContent: 'center' }}
				>
					<Icon
						name='arrow-back-outline'
						width={_iconArrowBackSize}
						height={_iconArrowBackSize}
						fill={color.white}
					/>
				</TouchableOpacity>
				<Text
					style={{
						fontWeight: '700',
						fontSize: _titleSize,
						lineHeight: 1.25 * _titleSize,
						marginLeft: 10,
						color: color.white,
					}}
				>
					New Group
				</Text>
			</View>
			<Icon name='people-outline' width={40} height={40} fill={color.white} />
		</View>
	)
}

const _iconArrowBackSize = 30
const _titleSize = 26

export const CreateGroupAddMembers: React.FC<{
	onSetMember: (contact: any) => void
	onRemoveMember: (id: string) => void
	members: any[]
}> = ({ onSetMember, onRemoveMember, members }) => {
	const [{ flex, background, margin }] = useStyles()
	const [layout, setLayout] = useState<number>(0)
	const navigation = useNavigation()

	return (
		<Layout style={[flex.tiny]}>
			<SafeAreaView style={[flex.tiny, background.blue]}>
				<View onLayout={(e) => setLayout(e.nativeEvent.layout.height)}>
					<CreateGroupHeader />
					<MemberList members={members} onRemoveMember={onRemoveMember} />
				</View>
				<Header title='Add members' first style={[margin.bottom.scale(-1)]} />
				<AddMembers
					members={members}
					onSetMember={onSetMember}
					onRemoveMember={onRemoveMember}
					paddingBottom={120}
					layout={layout}
				/>
			</SafeAreaView>
			<FooterCreateGroup
				title='CONTINUE'
				icon='arrow-forward-outline'
				action={navigation.navigate.main.createGroup.createGroupFinalize}
			/>
		</Layout>
	)
}
