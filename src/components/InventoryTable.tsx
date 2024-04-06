import { AgGridReact } from 'ag-grid-react'; // AG Grid Component
import {useEffect, useRef, useState} from "react";
import axios from "axios";
import Modal from "./Modal.tsx";

const InventoryTable = () => {
    const [rowData, setRowData] = useState([]);
    const [showCreateItemModal, setShowCreateItemModal] = useState(false)
    const [colDefs, setColDefs] = useState([
        { field: "item", flex: 1 },
        { field: "quantity", editable: true, flex: 1 },
        {
            headerName: '',
            cellRenderer: (params) => (
                <button onClick={() => handleDelete(params)}>Delete</button>
            ),
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


    return (
     <div
         className="ag-theme-quartz"
         style={{ height: '500px', width: '100%'}}
     >
         <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={openCreateItemModal}>Create </button>
         <AgGridReact
             rowData={rowData}
             columnDefs={colDefs}
             editable={true}
             onCellValueChanged={handleCellValueChanged}
         />
         <Modal isVisible={showCreateItemModal} onClose={closeCreateItemModal} onSubmit={handleCreateItem}/>
     </div>
 )
}

export default InventoryTable