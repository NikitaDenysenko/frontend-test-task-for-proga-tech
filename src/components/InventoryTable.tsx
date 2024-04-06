import { AgGridReact } from 'ag-grid-react'; // AG Grid Component
import {useEffect, useMemo, useState} from "react";
import axios from "axios";
import Modal from "./Modal.tsx";

const InventoryTable = () => {
    const [rowData, setRowData] = useState([]);
    const [showCreateItemModal, setShowCreateItemModal] = useState(false)
    const [colDefs, setColDefs] = useState([
        { field: "item", flex: 1, filter: true },
        { field: "quantity", editable: true, flex: 1 },
        {
            headerName: '',
            cellRenderer: (params) => {
                if(params.data.item === grandTotalRow.item) {
                    return null
                }
                return (
                    <button onClick={() => handleDelete(params)}>Delete</button>
                )
            },
            flex: 1,
        }
    ]);

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:3000/inventory')
            const jsonData = await response.data
            setRowData(jsonData)
        } catch (error) {
            console.error('Error in fetching data: ', error)
        }
    }

    const handleDelete = async (params) => {
        const deleteItemId = params.data.id
        await axios.delete(`http://localhost:3000/inventory/${deleteItemId}`)
        await fetchData()
    }

    const handleCellValueChanged = async (params) => {
        const editedData = { ...params.data, [params.colDef.field]: params.newValue };
        const updatedRowData = rowData.map(row => row.id === params.data.id ? editedData : row);
        setRowData(updatedRowData);
        await axios.patch(`http://localhost:3000/inventory/${params.data.id}`, {quantity: params.newValue})
        await fetchData()
    }

    const handleCreateItem = async (item, quantity) => {
        await axios.post('http://localhost:3000/inventory', {item, quantity})
        await fetchData()
        closeCreateItemModal()
    }

    const openCreateItemModal = () => {
        setShowCreateItemModal(true)
    }

    const closeCreateItemModal = () => {
        setShowCreateItemModal(false)
    }

    const totalItems = useMemo(() => {
        return rowData.reduce((total, row) => total + row.quantity, 0);
    }, [rowData]);

    const grandTotalRow = {item: "Grand Total", quantity: totalItems}
    const grandTotalRowStyle = "bg-gray-200 font-bold";

    return (
     <div
         className="ag-theme-quartz"
         style={{ height: '300px', width: '100%'}}
     >
         <AgGridReact
             rowData={[...rowData, grandTotalRow]}
             columnDefs={colDefs}
             editable={true}
             onCellValueChanged={handleCellValueChanged}
             enableFilter={true}
             getRowClass={(params) => params.data.item === grandTotalRow.item ? grandTotalRowStyle : null}
         />
         <div className="flex justify-center items-center">
             <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 ' onClick={openCreateItemModal}>Create new Item</button>
         </div>
         <Modal isVisible={showCreateItemModal} onClose={closeCreateItemModal} onSubmit={handleCreateItem}/>
     </div>
 )
}

export default InventoryTable