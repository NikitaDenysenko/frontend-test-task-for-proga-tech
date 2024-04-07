import { AgGridReact } from 'ag-grid-react';
import {useEffect, useMemo, useState} from "react";
import axios from "axios";
import Modal from "./Modal.tsx";
import { ColDef, RowClassParams } from 'ag-grid-community';

interface Inventory {
    id: number;
    item: string;
    quantity: number;
}

const InventoryTable = () => {
    const [rowData, setRowData] = useState<Inventory[]>([]);
    const [showCreateItemModal, setShowCreateItemModal] = useState<boolean>(false)

    const colDefs: ColDef[] = [
        { field: "item", flex: 1, filter: true },
        { field: "quantity", editable: (params) => params.data.item !== getGrandTotalRow().item, flex: 1, },
        {
            headerName: '',
            cellRenderer: (params) => {
                if(params.data.item === getGrandTotalRow().item) {
                    return null
                }
                return (
                    <button className='bg-red-500 hover:bg-red-700 text-white font-bold  px-4 rounded' onClick={() => handleDeleteItem(params)}>Delete</button>
                )
            },
            flex: 1,
            editable: false,
        }
    ]

    useEffect(() => {
        fetchInventoryData()
    }, [])

    const fetchInventoryData = async (filterText?: string) => {
        try {
            let url = 'http://localhost:3000/inventory';
            if (filterText) {
                url += `/search?name=${filterText}`;
            }
            const response = await axios.get(url)
            const jsonData: Inventory[] = await response.data
            setRowData(jsonData)
        } catch (error) {
            console.error('Error in fetching data: ', error)
        }
    }

    const handleDeleteItem = async (params) => {
        const deleteItemId = params.data.id
        await axios.delete(`http://localhost:3000/inventory/${deleteItemId}`)
        await fetchInventoryData()
    }

    const handleQuantityValueChanged = async (params) => {
        const editedData = { ...params.data, [params.colDef.field]: params.newValue };
        const updatedRowData = rowData.map(row => row.id === params.data.id ? editedData : row);
        setRowData(updatedRowData);
        await axios.patch(`http://localhost:3000/inventory/${params.data.id}`, {quantity: params.newValue})
        await fetchInventoryData()
    }

    const handleCreateItem = async (item: string, quantity: number) => {
        await axios.post('http://localhost:3000/inventory', {item, quantity})
        await fetchInventoryData()
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

    const getGrandTotalRow = () => {
        return {item: "Grand Total", quantity: totalItems}
    }

    const onFilterChanged = async (event) => {
        const filterText = event.api.getFilterModel().item?.filter;
        await fetchInventoryData(filterText)
    }

    const getRowClass = (params: RowClassParams) => {
        return params.data.item === getGrandTotalRow().item ? "bg-gray-200 font-bold" : ''
    }

    return (
     <div
         className="ag-theme-quartz"
         style={{ height: '320px', width: '100%'}}
     >
         <AgGridReact
             rowData={[...rowData, getGrandTotalRow()]}
             columnDefs={colDefs}
             editable={true}
             onCellValueChanged={handleQuantityValueChanged}
             enableFilter={true}
             getRowClass={getRowClass}
             rowHeight={45}
             onFilterChanged={onFilterChanged}
         />
         <div className="flex justify-center items-center">
             <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 ' onClick={openCreateItemModal}>Create new Item</button>
         </div>
         <Modal isVisible={showCreateItemModal} onClose={closeCreateItemModal} onSubmit={handleCreateItem}/>
     </div>
 )
}

export default InventoryTable