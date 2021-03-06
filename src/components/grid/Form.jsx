import React, { useEffect, Fragment } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useFirestore, useFirebase } from 'react-redux-firebase'
import { Select, Button, Typography, Box } from '@material-ui/core'
import { Save as SaveIcon, Delete as DeleteIcon, Casino as TossIcon } from '@material-ui/icons'
import { participantsInGrid, gridInfo } from './playOff/functionsPlayOff'
import { tossPlayOff } from './playOff/functionsToss'
import { tossGroup } from './group/functionsToss'
import { categoryName, tournamentName } from '../../config/functions'
import GridPlayOff from './playOff/GridPlayOff'
import ConsolationDuels from './playOff/ConsolationDuels'
import GroupFinal from './group/FinalDuel'
import GridAllPlayAll from './playAlltoAll/GridAllPlayAll'
import { setGridParams, createGrid, createGroups, clearGrid } from '../../store/gridActions'
import { gridRecommendation } from './functions'
// import TopPlaces from './TopPlaces'
// import TopPlacesAllPlayAll from './TopPlacesAllPlayAll'
import Participants from './Participants'
import GroupTable from './GroupTable'
import Result from './Result'
import { makeStyles, useMediaQuery } from '@material-ui/core'

function Form(props) {
	const {
		tournament,
		category,
		participants,
		grid,
		gridType,
		groupParticipants,
		group1grid,
		group2grid,
		categoryId,
		tournamentId
	} = useSelector(state => state.grid)

	const dispatch = useDispatch()

	const isForPrintView = useMediaQuery('print')

	const useStyles = makeStyles(theme => ({
		page: {
			backgroundImage: `url("/wkf-logo.png")`,
			backgroundPosition: 'top 0px right 30px',
			backgroundRepeat: 'no-repeat',
			backgroundSize: 100,
			position: 'relative',
			margin: 20
		}
	}))

	const classes = useStyles()
	const firestore = useFirestore()
	const firebase = useFirebase()
	// Set with participants we want to hide in list
	let participantsToHide = new Set()
	//in playOff-grid we want to hide participants who alredy in greed
	if (gridType === 'playOff') {
		participantsToHide = participantsInGrid(grid)
		participantsToHide.delete(undefined)
		participantsToHide.delete('')
	}
	//in group-grid - hide who alredy in group
	if (gridType === 'group') {
		const alredyInGroups = groupParticipants.flat()
		participantsToHide = new Set(alredyInGroups)
		participantsToHide.delete('')
		participantsToHide.delete(0)
		// console.log('participantsToHide', participantsToHide)
	}

	const participantsParams = { participants, participantsToHide }

	const handleChange = e => {
		const gridType = e.target.value
		dispatch(setGridParams({ gridType }))
		if (gridType === 'playOff') {
			const participantCount = participants.length
			dispatch(createGrid({ gridType, participantCount }))
		}
		if (gridType === 'allPlayAll') {
			const participantIds = participants.map(elem => elem.athlet.id)
			dispatch(createGrid({ gridType, participantIds }))
		}
		if (gridType === 'group') {
			//const participantIds = participants.map(elem => elem.athlet.id)
			const participantCount = participants.length
			dispatch(createGroups({ participantCount }))
		}
	}

	const handleSubmit = () => {
		let gridForSave = {}
		if (gridType === 'group') {
			gridForSave = { group1grid, group2grid }
		} else {
			gridForSave = { grid }
		}
		firestore.set(
			`grids/${tournamentId}`,
			{ [categoryId]: { ...gridForSave, gridType } },
			{ merge: true }
		)
	}

	const handleDelete = () => {
		//delete
		firestore
			.set(
				`grids/${tournamentId}`,
				{ [categoryId]: firebase.firestore.FieldValue.delete() },
				{ merge: true }
			)
			.then(dispatch(clearGrid()))
	}

	const handleToss = () => {
		if (gridType === 'allPlayAll') return
		const participantCount = participants.length

		if (gridType === 'playOff') {
			dispatch(createGrid({ gridType, participantCount }))
			tossPlayOff()
		}
		if (gridType === 'group') {
			tossGroup()
			dispatch(createGrid({ gridType }))
		}
	}

	useEffect(() => {
		//component will mount
		return () => {
			//component will UNmount
			dispatch(clearGrid())
		}
	}, [])

	const gridRecommendationText = gridRecommendation(participants.length)

	const groupGrid = () => (
		<div>
			<div style={{ display: 'inline-block' }}>
				<table>
					<tbody>
						<tr>
							<td>
								{participantsToHide.size !== participants.length && (
									<Participants {...participantsParams} />
								)}
							</td>
							<td>
								<GroupTable
									groupParticipants={groupParticipants}
									participants={participants}
									groupIndex={0}
								/>
							</td>
							<td>
								<GroupTable
									groupParticipants={groupParticipants}
									participants={participants}
									groupIndex={1}
								/>
							</td>
						</tr>
						<tr>
							<td></td>
							<td></td>
							<td style={{ textAlign: 'right' }}>
								<Box displayPrint='none'>
									<Button
										variant='contained'
										color='primary'
										onClick={() => dispatch(createGrid({ gridType: 'group' }))}
									>
										Обновить поединки
									</Button>
								</Box>
							</td>
						</tr>
						<tr>
							<td></td>
							<td>
								<GridAllPlayAll grid={group1grid} participants={participants} />
							</td>
							<td>
								<GridAllPlayAll grid={group2grid} participants={participants} />
							</td>
						</tr>
					</tbody>
				</table>
				{Object.keys({ ...group1grid, ...group2grid }).length > 0 && (
					<div style={{ textAlign: 'center' }}>
						<GroupFinal />
					</div>
				)}
			</div>
			<Result />
		</div>
	)

	const allPlayAllGrid = () => (
		<Fragment>
			{/* <TopPlacesAllPlayAll grid={grid} participants={participants} /> */}
			<GridAllPlayAll grid={grid} participants={participants} />
			<Result />
		</Fragment>
	)

	const gridSettingsAndInfo = () => (
		<div>
			<div style={{ textAlign: 'center' }}>
				<Typography variant='h5'>{`${tournamentName(tournament)}`}</Typography>
				<Typography variant='h6'>{categoryName(category)}</Typography>
			</div>
			<Box style={{ marginBottom: 10 }} displayPrint='none'>
				<Typography variant='body1'>Всего участников: {participants.length}</Typography>
				<Typography variant='body1'>Рекомендуется: {gridRecommendationText}</Typography>
				<Select
					onChange={handleChange}
					native
					value={gridType}
					inputProps={{
						id: 'gridType'
					}}
				>
					<option value=''></option>
					<option value='playOff'>Олимпийская</option>
					<option value='allPlayAll'>Круговая</option>
					<option value='group'>Групповая</option>
				</Select>
				<Button
					style={{ marginLeft: 20 }}
					endIcon={<SaveIcon />}
					variant='outlined'
					onClick={handleSubmit}
				>
					Save
				</Button>
				<Button
					style={{ marginLeft: 20 }}
					endIcon={<DeleteIcon />}
					variant='outlined'
					onClick={handleDelete}
				>
					Delete
				</Button>
				<Button
					style={{ marginLeft: 20 }}
					endIcon={<TossIcon />}
					variant='outlined'
					onClick={handleToss}
				>
					Toss
				</Button>
			</Box>
		</div>
	)

	const playOffGrid = () => (
		<div>
			<div style={{ display: 'flex' }}>
				{participantsToHide.size !== participants.length && (
					<Participants {...participantsParams} />
				)}
				<GridPlayOff />
				{/* <TopPlaces grid={grid} participants={participants} /> */}
				{/* gridInfo = {tourCount, mainDuelCount} */}
			</div>
			<ConsolationDuels {...gridInfo(grid)} position={isForPrintView ? 'fixed' : 'static'} />
			<Result />
		</div>
	)

	return (
		<div className={classes.page}>
			{gridSettingsAndInfo()}

			{/* columns: participants | level-0 | level-1 | ... */}
			{!gridType && <Participants {...participantsParams} />}
			{gridType === 'playOff' && playOffGrid()}
			{gridType === 'allPlayAll' && allPlayAllGrid()}
			{gridType === 'group' && groupGrid()}
		</div>
	)
}

export default Form
