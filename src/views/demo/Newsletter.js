import React, { useEffect, useState, useRef } from 'react'
import { FormItem, FormContainer, Segment, Input, Upload, Card, Button, Tooltip, Avatar, Badge, Notification, toast, Dialog, Error, Select, Table, Checkbox } from 'components/ui'
import { Loading, TextEllipsis, ConfirmDialog, Container } from 'components/shared'
import { useDispatch, useSelector } from 'react-redux'
import supabaseClient from 'utils/supabaseClient'
import PanelHeader from './PanelHeader'
import { useTable, useRowSelect } from 'react-table'
import { CSVLink } from "react-csv"
import { GrTrash } from 'react-icons/gr'
import { SubContext, useGlobalContext } from "utils/context/subContext"

const openNotification = (type, text) => {
	toast.push(
		<Notification type={type}>
			{text}
		</Notification>
	)
}

const { Tr, Th, Td, THead, TBody } = Table

const IndeterminateCheckbox = React.forwardRef(({ indeterminate, onChange, ...rest }, ref) => {
	const defaultRef = useRef()
	const resolvedRef = ref || defaultRef

	useEffect(() => {
		resolvedRef.current.indeterminate = indeterminate
	}, [resolvedRef, indeterminate])

	return <Checkbox ref={resolvedRef} onChange={(_, e) => onChange(e)} {...rest} />
})

function ReactTable({ columns, data }) {

	const { setLoading, fetchSub } = useGlobalContext()

	const headers = [
		{ label: "ID", key: "id" },
		{ label: "Name", key: "name" },
		{ label: "Email", key: "email" },
		{ label: "Date", key: "created_at" }
	];

	const [deleteDisabled, setdeleteDisabled] = useState(false);

	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		rows,
		prepareRow,
		selectedFlatRows,
	} = useTable({ columns, data }, useRowSelect,
		hooks => {
			hooks.visibleColumns.push(columns => [
				// Let's make a column for selection
				{
					id: 'selection',
					// The header can use the table's getToggleAllRowsSelectedProps method
					// to render a checkbox
					Header: ({ getToggleAllRowsSelectedProps }) => (
						<div>
							<IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
						</div>
					),
					// The cell can use the individual row's getToggleRowSelectedProps method
					// to the render a checkbox
					Cell: ({ row }) => (
						<div>
							<IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
						</div>
					),
				},
				...columns,
			])
		}
	)

	console.log('selectedFlatRows', selectedFlatRows)

	const deleteSub = async () => {
		setdeleteDisabled(true)
		const deleteIDs = [];
		selectedFlatRows.map(sel => { deleteIDs.push(sel.original.id) })
		console.log(deleteIDs)

		const { data, error } = await supabaseClient
		.from('newsletter')
		.delete()
		.in('id', deleteIDs)

		if(error) {
			setdeleteDisabled(false)
			console.log(error.message)
			throw openNotification('danger', error.message)
		}
		if(data) {
			//setLoading(true)
			fetchSub()
			openNotification('success', "Deleted Successfully")
			setdeleteDisabled(false)
		}
	}

	// Render the UI for your table
	return (
		<>
			<div className='flex flex-row justify-between'>
				
				<PanelHeader type="Newsletter" title="Manage Newsletter" />
				{
					selectedFlatRows.length > 0 && <div className='flex flex-row'>
						<div className="mr-5">
							<Tooltip title="Delete">
								<Button 
									disabled={deleteDisabled}
									shape="circle" 
									variant="plain"
									size="sm"
									onClick={deleteSub}
									icon={<GrTrash className='opacity-70' />} 
								/>
							</Tooltip>
						</div>
						<CSVLink
							data={selectedFlatRows.map(sel => { return sel.original })}
							filename={"subscribers.csv"}
							headers={headers}
							onClick={() => {
								console.log("You click the link"); // 👍🏻 Your click handling logic
							}}
						>
							<Button 		 
								size="sm" 
								variant="solid"
							>
								Export to CSV
							</Button>
						</CSVLink>
					</div>
				}

			</div>
			{
				data.length != 0 ? <Table className="mt-5" {...getTableProps()}>
					<THead>
						{headerGroups.map(headerGroup => (
							<Tr {...headerGroup.getHeaderGroupProps()}>
								{headerGroup.headers.map(column => (
									<Th {...column.getHeaderProps()}>{column.render('Header')}</Th>
								))}
							</Tr>
						))}
					</THead>
					<TBody {...getTableBodyProps()}>
						{rows.map((row, i) => {
							prepareRow(row)
							return (
								<Tr {...row.getRowProps()}>
									{row.cells.map(cell => {
										return <Td {...cell.getCellProps()}>{cell.render('Cell')}</Td>
									})}
								</Tr>
							)
						})}
					</TBody>
				</Table>
				:
				<div className='text-center text-1xl mt-10 py-5 border-2 border-neutral-300 dark:border-neutral-700 border-dashed rounded-md'>
					<p>No Records Found</p>
				</div>

			}
		</>
	)
}

const Newsletter = () => {

	const dispatch = useDispatch()
	
	const authID = useSelector((state) => state.auth.user.id)

	const [error, setError] = useState(false)
	const [loading, setLoading] = useState(true)

	const [sub, setSub] = useState()

	useEffect(() => {
		fetchSub()
	}, [])
	
	const fetchSub = async () => {

		console.log(authID)
		
		const { data, error } = await supabaseClient
        .from('newsletter')
        .select(`id, name, email, created_at`)
        .eq('author', authID)
        .order('created_at', { ascending: false })
		
		if(error) {
			throw setError(true)
		}
		if(data) {
			console.log(data)
			setSub(data)
			setLoading(false)
		}

	}
	
	const columns = [
		{
			Header: 'Id',
			accessor: 'id',
		},
		{
			Header: 'Name',
			accessor: 'name',
		},
		{
			Header: 'Email',
			accessor: 'email',
		},
		{
			Header: 'Date',
			accessor: 'created_at',
			Cell: ({ cell: { value } }) => value ? new Date(value).toLocaleString('en-us',{month:'short', day:'numeric', year:'numeric'}) : "-"
		},
	]

	if(error === true) {

		return (
			<Error />
		)

	}else { 

		return (
            <Container>
                <Loading loading={loading}>
					<SubContext.Provider value={{ setLoading, fetchSub }}>
						<ReactTable columns={columns} data={sub} />
					</SubContext.Provider>
					{/* <div className="mb-6">
						<div>
							<Table className="mt-10">
								<THead>
									<Tr>
										<Th>Name</Th>
										<Th>Email</Th>
										<Th>Date</Th>
										<Th>Delete</Th>
									</Tr>
								</THead>
								<TBody>
									{
										sub?.map(({name, email, created_at}, index) => (
											<Tr key={index}>
												<Td>{name}</Td>
												<Td>{email}</Td>
												<Td>{ new Date(created_at).toLocaleString('en-us',{month:'short', day:'numeric', year:'numeric'}) }</Td>
											</Tr>
										))
									}
								</TBody>
							</Table>
						</div>
					</div> */}
                </Loading>
            </Container>
		)
	}
}

export default Newsletter