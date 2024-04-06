import { AgGridReact } from 'ag-grid-react';
import {useEffect, useMemo, useState, FC} from "react";
import axios from "axios";
import Modal from "./Modal.tsx";
import { ColDef, RowClassParams } from 'ag-grid-community';

interface Inventory {
    id: number;
    item: string;
    quantity: number;
}

const InventoryTable: FC = () => {
    const [rowData, setRowData] = useState<Inventory[]>([]);
    const [showCreateItemModal, setShowCreateItemModal] = useState<boolean>(false)

    const colDefs: ColDef[] = [
        { field: "item", flex: 1, filter: true },
        { field: "quantity", editable: (params) => params.data.item !== grandTotalRow.item, flex: 1, },
        {
            headerName: '',
            cellRenderer: (params) => {
                if(params.data.item === grandTotalRow.item) {
                    return null
                }
                return (
                    <button className='bg-red-500 hover:bg-red-700 text-white font-bold  px-4 rounded' onClick={() => handleDelete(params)}>Delete</button>
                )
            },
            flex: 1,
            editable: false,
        }
    ]

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async (filterText?: string) => {
        try {
            let url = 'http://localhost:3000/inventory';
            if (filterText) {
                url += `/search?name=${filterText}`;
            }
            const response = await axios.get(url)
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

    const handleCreateItem = async (item: string, quantity: number) => {
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

    const onFilterChanged = async (event) => {
        const filterText = event.api.getFilterModel().item?.filter;
        await fetchData(filterText)
    }

    const getRowClass = (params: RowClassParams) => {
        return params.data.item === grandTotalRow.item ? grandTotalRowStyle : ''
    }

    return (
     <div
         className="ag-theme-quartz"
         style={{ height: '320px', width: '100%'}}
     >
         <AgGridReact
             rowData={[...rowData, grandTotalRow]}
             columnDefs={colDefs}
             editable={true}
             onCellValueChanged={handleCellValueChanged}
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